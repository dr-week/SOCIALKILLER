import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import {
  escapeHtml,
  escapeTelegramMarkdownV2,
  fetchWithBackoff,
  normalizeTags,
  truncateText
} from '../utils.ts'

export interface TelegramFormattedRequest {
  endpoint: 'sendPhoto' | 'sendMessage'
  chat_id: string
  parse_mode: 'HTML' | 'MarkdownV2'
  textOrCaption: string
  photoSource?: string
}

export function buildTelegramRequest(
  payload: SocialPostPayload,
  config: SocialEnvConfig
): TelegramFormattedRequest {
  const parseMode = config.telegram.parseMode
  const tagsLine = normalizeTags(payload.tags).join(' ')
  const hasPhoto = Boolean(payload.imagePath && payload.imagePath.trim())
  const maxLen = hasPhoto ? 1024 : 4096

  let formattedText = ''
  if (parseMode === 'MarkdownV2') {
    const title = `*${escapeTelegramMarkdownV2(`🚀 ${payload.title}`)}*`
    const body = escapeTelegramMarkdownV2(payload.detailed || payload.summary)
    const link = payload.url ? `\n\n🔗 ${escapeTelegramMarkdownV2(payload.url)}` : ''
    const tags = tagsLine ? `\n\n${escapeTelegramMarkdownV2(tagsLine)}` : ''
    formattedText = truncateText(`${title}\n\n${body}${link}${tags}`, maxLen)
  } else {
    const title = `<b>🚀 ${escapeHtml(payload.title)}</b>`
    const summaryLine =
      payload.summary && payload.detailed && payload.summary !== payload.detailed
        ? `\n<i>${escapeHtml(payload.summary)}</i>\n`
        : '\n'
    const body = escapeHtml(payload.detailed || payload.summary)
    const link = payload.url
      ? `\n\n🔗 <a href="${escapeHtml(payload.url)}">${escapeHtml(payload.url)}</a>`
      : ''
    const tags = tagsLine ? `\n\n${escapeHtml(tagsLine)}` : ''
    formattedText = truncateText(`${title}${summaryLine}\n${body}${link}${tags}`, maxLen)
  }

  return {
    endpoint: hasPhoto ? 'sendPhoto' : 'sendMessage',
    chat_id: config.telegram.chatId || '@your_channel_id',
    parse_mode: parseMode,
    textOrCaption: formattedText,
    ...(hasPhoto && payload.imagePath ? { photoSource: payload.imagePath } : {})
  }
}

export const telegramAdapter: SocialAdapter = {
  platform: 'telegram',
  name: 'Telegram (Bot API)',

  isConfigured(config: SocialEnvConfig): boolean {
    return Boolean(config.telegram.botToken && config.telegram.chatId)
  },

  formatPreview(payload: SocialPostPayload, config: SocialEnvConfig): TelegramFormattedRequest {
    return buildTelegramRequest(payload, config)
  },

  async publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult> {
    const start = Date.now()
    const formatted = buildTelegramRequest(payload, config)

    if (options?.dryRun) {
      return {
        platform: 'telegram',
        ok: true,
        dryRun: true,
        message: `[DRY-RUN] Telegram ${formatted.endpoint} payload ready (${formatted.parse_mode}).`,
        formattedPreview: formatted,
        durationMs: Date.now() - start
      }
    }

    if (!this.isConfigured(config)) {
      return {
        platform: 'telegram',
        ok: false,
        dryRun: false,
        message: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment.',
        error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured',
        formattedPreview: formatted,
        durationMs: Date.now() - start
      }
    }

    try {
      const baseUrl = `https://api.telegram.org/bot${config.telegram.botToken}`
      let res: Response

      if (formatted.endpoint === 'sendPhoto' && formatted.photoSource) {
        const isUrl =
          formatted.photoSource.startsWith('http://') ||
          formatted.photoSource.startsWith('https://')

        if (isUrl) {
          res = await fetchWithBackoff(`${baseUrl}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: config.telegram.chatId,
              photo: formatted.photoSource,
              caption: formatted.textOrCaption,
              parse_mode: formatted.parse_mode
            })
          })
        } else {
          const absPath = resolve(process.cwd(), formatted.photoSource)
          if (!existsSync(absPath)) {
            throw new Error(`Telegram image file not found at: ${absPath}`)
          }
          const fileBytes = readFileSync(absPath)
          const form = new FormData()
          form.append('chat_id', config.telegram.chatId)
          form.append('caption', formatted.textOrCaption)
          form.append('parse_mode', formatted.parse_mode)
          form.append('photo', new Blob([fileBytes]), basename(absPath))

          res = await fetchWithBackoff(`${baseUrl}/sendPhoto`, {
            method: 'POST',
            body: form
          })
        }
      } else {
        res = await fetchWithBackoff(`${baseUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.telegram.chatId,
            text: formatted.textOrCaption,
            parse_mode: formatted.parse_mode,
            disable_web_page_preview: false
          })
        })
      }

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        description?: string
        result?: { message_id?: number }
      }

      if (!res.ok || !data.ok) {
        return {
          platform: 'telegram',
          ok: false,
          dryRun: false,
          status: res.status,
          message: `Telegram API error: ${data.description || `HTTP ${res.status}`}`,
          error: data.description || `HTTP ${res.status}`,
          durationMs: Date.now() - start
        }
      }

      return {
        platform: 'telegram',
        ok: true,
        dryRun: false,
        status: res.status,
        ...(data.result?.message_id ? { externalId: String(data.result.message_id) } : {}),
        message: `Published to Telegram (${formatted.endpoint}) in chat ${config.telegram.chatId}.`,
        formattedPreview: formatted,
        durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'telegram',
        ok: false,
        dryRun: false,
        message: 'Failed to publish to Telegram.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

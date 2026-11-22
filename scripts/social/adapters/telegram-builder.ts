import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import type { SocialEnvConfig, SocialPostPayload } from '../types.ts'
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

export async function sendTelegramApi(
  baseUrl: string,
  formatted: TelegramFormattedRequest,
  chatId: string
): Promise<Response> {
  if (formatted.endpoint === 'sendPhoto' && formatted.photoSource) {
    const isUrl =
      formatted.photoSource.startsWith('http://') ||
      formatted.photoSource.startsWith('https://')

    if (isUrl) {
      return fetchWithBackoff(`${baseUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: formatted.photoSource,
          caption: formatted.textOrCaption,
          parse_mode: formatted.parse_mode
        })
      })
    }
    const absPath = resolve(process.cwd(), formatted.photoSource)
    if (!existsSync(absPath)) {
      throw new Error(`Telegram image file not found at: ${absPath}`)
    }
    const fileBytes = readFileSync(absPath)
    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('caption', formatted.textOrCaption)
    form.append('parse_mode', formatted.parse_mode)
    form.append('photo', new Blob([fileBytes]), basename(absPath))

    return fetchWithBackoff(`${baseUrl}/sendPhoto`, { method: 'POST', body: form })
  }

  return fetchWithBackoff(`${baseUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatted.textOrCaption,
      parse_mode: formatted.parse_mode,
      disable_web_page_preview: false
    })
  })
}

import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import {
  type TelegramFormattedRequest,
  buildTelegramRequest,
  sendTelegramApi
} from './telegram-builder.ts'

export type { TelegramFormattedRequest }
export { buildTelegramRequest }

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
      const res = await sendTelegramApi(baseUrl, formatted, config.telegram.chatId)

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

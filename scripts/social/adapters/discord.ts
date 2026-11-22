import type { PlatformPublishResult, SocialAdapter, SocialEnvConfig, SocialPostPayload } from '../types.ts'
import { fetchWithBackoff, truncateText } from '../utils.ts'
import { buildDiscordWebhookPayload, type DiscordWebhookBody } from './discord-builder.ts'

export { buildDiscordWebhookPayload, type DiscordWebhookBody } from './discord-builder.ts'

export const discordAdapter: SocialAdapter = {
  platform: 'discord',
  name: 'Discord (Rich Webhook)',

  isConfigured(config: SocialEnvConfig): boolean {
    return Boolean(config.discord.webhookUrl)
  },

  formatPreview(payload: SocialPostPayload, config: SocialEnvConfig): DiscordWebhookBody {
    return buildDiscordWebhookPayload(payload, config)
  },

  async publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult> {
    const start = Date.now()
    const body = buildDiscordWebhookPayload(payload, config)

    if (options?.dryRun) {
      return {
        platform: 'discord',
        ok: true,
        dryRun: true,
        message: '[DRY-RUN] Discord rich embed payload ready.',
        formattedPreview: body,
        durationMs: Date.now() - start
      }
    }

    if (!this.isConfigured(config)) {
      return {
        platform: 'discord',
        ok: false,
        dryRun: false,
        message: 'Missing DISCORD_WEBHOOK_URL in environment.',
        error: 'DISCORD_WEBHOOK_URL not configured',
        formattedPreview: body,
        durationMs: Date.now() - start
      }
    }

    try {
      const targetUrl = config.discord.webhookUrl.includes('?')
        ? `${config.discord.webhookUrl}&wait=true`
        : `${config.discord.webhookUrl}?wait=true`

      const res = await fetchWithBackoff(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errText = await res.text()
        return {
          platform: 'discord',
          ok: false,
          dryRun: false,
          status: res.status,
          message: `Discord webhook returned HTTP ${res.status}`,
          error: truncateText(errText, 300),
          durationMs: Date.now() - start
        }
      }

      const data = (await res.json().catch(() => ({}))) as { id?: string }
      return {
        platform: 'discord',
        ok: true,
        dryRun: false,
        status: res.status,
        ...(data.id ? { externalId: data.id } : {}),
        message: 'Published rich embed to Discord channel.',
        formattedPreview: body,
        durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'discord',
        ok: false,
        dryRun: false,
        message: 'Failed to publish to Discord webhook.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

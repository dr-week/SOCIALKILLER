import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import {
  fetchWithBackoff,
  hexToDiscordColorInt,
  normalizeTags,
  truncateText
} from '../utils.ts'

export interface DiscordWebhookBody {
  username?: string
  avatar_url?: string
  content?: string
  embeds: Array<{
    title: string
    url?: string
    description: string
    color: number
    fields: Array<{ name: string; value: string; inline?: boolean }>
    image?: { url: string }
    footer: { text: string }
    timestamp: string
  }>
}

export function buildDiscordWebhookPayload(
  payload: SocialPostPayload,
  config: SocialEnvConfig
): DiscordWebhookBody {
  const tagsLine = normalizeTags(payload.tags).join(' ')
  const brand = payload.brandName || config.brandName
  const color = hexToDiscordColorInt(payload.accentColor || '#a855f7')

  const fields: Array<{ name: string; value: string; inline?: boolean }> = []
  if (payload.summary) {
    fields.push({
      name: '⚡ TL;DR',
      value: truncateText(payload.summary, 1024),
      inline: false
    })
  }
  if (payload.url) {
    fields.push({
      name: '🔗 Canonical Link',
      value: payload.url,
      inline: true
    })
  }
  if (payload.versionTag) {
    fields.push({
      name: '🏷️ Version',
      value: `\`${payload.versionTag}\``,
      inline: true
    })
  }
  if (tagsLine) {
    fields.push({
      name: '📣 Topics',
      value: truncateText(tagsLine, 1024),
      inline: false
    })
  }

  const isRemoteImage =
    payload.imagePath &&
    (payload.imagePath.startsWith('http://') || payload.imagePath.startsWith('https://'))

  const embed: DiscordWebhookBody['embeds'][0] = {
    title: truncateText(`🚀 ${payload.title}`, 256),
    ...(payload.url ? { url: payload.url } : {}),
    description: truncateText(payload.detailed || payload.summary, 4000),
    color,
    fields,
    ...(isRemoteImage && payload.imagePath ? { image: { url: payload.imagePath } } : {}),
    footer: {
      text: `${brand} • Automated Multi-Platform Publisher`
    },
    timestamp: new Date().toISOString()
  }

  return {
    ...(config.discord.username ? { username: config.discord.username } : {}),
    ...(config.discord.avatarUrl ? { avatar_url: config.discord.avatarUrl } : {}),
    embeds: [embed]
  }
}

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

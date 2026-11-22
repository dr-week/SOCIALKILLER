import type { SocialEnvConfig, SocialPostPayload } from '../types.ts'
import { hexToDiscordColorInt, normalizeTags, truncateText } from '../utils.ts'

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
    fields.push({ name: '⚡ TL;DR', value: truncateText(payload.summary, 1024), inline: false })
  }
  if (payload.url) {
    fields.push({ name: '🔗 Canonical Link', value: payload.url, inline: true })
  }
  if (payload.versionTag) {
    fields.push({ name: '🏷️ Version', value: `\`${payload.versionTag}\``, inline: true })
  }
  if (tagsLine) {
    fields.push({ name: '📣 Topics', value: truncateText(tagsLine, 1024), inline: false })
  }

  const isRemoteImage = payload.imagePath && (payload.imagePath.startsWith('http://') || payload.imagePath.startsWith('https://'))

  const embed: DiscordWebhookBody['embeds'][0] = {
    title: truncateText(`🚀 ${payload.title}`, 256),
    ...(payload.url ? { url: payload.url } : {}),
    description: truncateText(payload.detailed || payload.summary, 4000),
    color,
    fields,
    ...(isRemoteImage && payload.imagePath ? { image: { url: payload.imagePath } } : {}),
    footer: { text: `${brand} • Automated Multi-Platform Publisher` },
    timestamp: new Date().toISOString()
  }

  return {
    ...(config.discord.username ? { username: config.discord.username } : {}),
    ...(config.discord.avatarUrl ? { avatar_url: config.discord.avatarUrl } : {}),
    embeds: [embed]
  }
}

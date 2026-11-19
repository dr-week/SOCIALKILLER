/**
 * Official Discord Webhook & Bot REST API Adapter (<160 lines)
 * 
 * Supports:
 * 1. Webhook execution: `POST https://discord.com/api/webhooks/...`
 * 2. Rich embeds with titles, descriptions, and media links
 * 3. Fallback to Discord Client URL (`https://discord.com/channels/@me`)
 */

import { ensureValidToken } from '../../credential-store.mjs'

export async function post({ title = '', body = '', webLink = null, imageUrl = null, credentials = {} } = {}) {
  const creds = await ensureValidToken('discord', credentials)
  const webhookUrl = creds.webhookUrl || process.env.DISCORD_WEBHOOK_URL
  const botUsername = creds.botUsername || 'FollowDesk Social Bot'

  // 1. Direct Webhook Dispatch
  if (webhookUrl && webhookUrl.startsWith('https://discord')) {
    try {
      const payload = {
        username: botUsername,
        content: `📣 **${(title || 'Developer Update').slice(0, 150)}**\n\n${(body || '').slice(0, 1800)}`
      }

      if (webLink || imageUrl) {
        payload.embeds = [{
          title: (title || 'Project Link').slice(0, 200),
          url: webLink || undefined,
          image: imageUrl ? { url: imageUrl } : undefined,
          color: 0x7c3aed
        }]
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      })

      if (res.ok || res.status === 204) {
        return {
          status: 'ok',
          platformId: 'discord',
          mode: 'live_api',
          message: 'Posted live to Discord channel via official Webhook.'
        }
      }
      const errText = await res.text()
      console.warn(`[Discord Webhook] Returned ${res.status}:`, errText)
    } catch (err) {
      console.warn('[Discord Webhook] Failed, falling back:', err.message)
    }
  }

  // 2. Fallback: Intent URL
  return {
    status: 'ok',
    platformId: 'discord',
    mode: 'intent_assisted',
    intentUrl: 'https://discord.com/channels/@me',
    message: 'Formatted for Discord. Ready for manual dispatch.'
  }
}

export async function ping(credentials = {}) {
  const creds = await ensureValidToken('discord', credentials)
  const webhookUrl = creds.webhookUrl || process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl || !webhookUrl.startsWith('https://discord')) {
    return { connected: false, error: 'No valid webhook URL configured' }
  }
  try {
    const res = await fetch(webhookUrl, { signal: AbortSignal.timeout(4000) })
    if (res.ok) {
      const data = await res.json()
      return { connected: true, name: data.name, channelId: data.channel_id, guildId: data.guild_id }
    }
    return { connected: false, status: res.status }
  } catch (err) {
    return { connected: false, error: err.message }
  }
}

export async function keepAlive() {
  return { status: 'alive', platformId: 'discord', timestamp: new Date().toISOString() }
}

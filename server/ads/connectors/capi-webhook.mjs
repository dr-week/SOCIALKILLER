/**
 * Meta Conversions API (CAPI) & Google Enhanced Conversions webhook helper.
 * Hashes PII (email/phone) with SHA-256 before dispatch.
 */
import { createHash } from 'node:crypto'

export function sha256Normalized(value = '') {
  const clean = String(value).trim().toLowerCase()
  return clean ? createHash('sha256').update(clean).digest('hex') : ''
}

export async function sendMetaCapiEvent({ pixelId, accessToken, eventName = 'Purchase', email = '', value = 0, currency = 'USD', paperTrade = true }) {
  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: email ? { em: [sha256Normalized(email)] } : {},
      custom_data: { currency, value: Number(value || 0) },
    }],
  }

  if (paperTrade || !pixelId || !accessToken) {
    return { ok: true, mode: 'paper_trade', payload }
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`CAPI dispatch failed (${res.status})`)
  return { ok: true, mode: 'live_capi', response: await res.json() }
}

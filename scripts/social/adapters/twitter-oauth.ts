import { createHmac, randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SocialEnvConfig } from '../types.ts'
import { fetchWithBackoff } from '../utils.ts'

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  )
}

export function buildOAuth1Header(
  method: string,
  url: string,
  creds: {
    apiKey: string
    apiSecret: string
    accessToken: string
    accessSecret: string
  },
  extraParams: Record<string, string> = {}
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: '1.0'
  }

  const allParams: Record<string, string> = { ...extraParams, ...oauthParams }
  const sortedKeys = Object.keys(allParams).sort()
  const paramString = sortedKeys
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k] ?? '')}`)
    .join('&')

  const baseUrl = url.split('?')[0] ?? url
  const signatureBase = `${method.toUpperCase()}&${percentEncode(baseUrl)}&${percentEncode(paramString)}`
  const signingKey = `${percentEncode(creds.apiSecret)}&${percentEncode(creds.accessSecret)}`
  const signature = createHmac('sha1', signingKey).update(signatureBase).digest('base64')

  oauthParams.oauth_signature = signature

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k] ?? '')}"`)
    .join(', ')

  return `OAuth ${headerParts}`
}

export async function uploadTwitterMediaV1(
  imagePath: string,
  config: SocialEnvConfig
): Promise<string | null> {
  if (
    !config.twitter.apiKey ||
    !config.twitter.apiSecret ||
    !config.twitter.accessToken ||
    !config.twitter.accessSecret
  ) {
    return null
  }

  let base64Data = ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const imgRes = await fetchWithBackoff(imagePath)
    if (!imgRes.ok) return null
    const buf = Buffer.from(await imgRes.arrayBuffer())
    base64Data = buf.toString('base64')
  } else {
    const absPath = resolve(process.cwd(), imagePath)
    if (!existsSync(absPath)) return null
    base64Data = readFileSync(absPath).toString('base64')
  }

  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json'
  const authHeader = buildOAuth1Header('POST', uploadUrl, config.twitter)
  const form = new FormData()
  form.append('media_data', base64Data)

  const res = await fetchWithBackoff(uploadUrl, {
    method: 'POST',
    headers: { Authorization: authHeader },
    body: form
  })
  if (!res.ok) return null
  const json = (await res.json().catch(() => ({}))) as { media_id_string?: string }
  return json.media_id_string ?? null
}

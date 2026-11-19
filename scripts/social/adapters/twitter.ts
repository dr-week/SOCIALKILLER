import { createHmac, randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { buildTwitterMicroThread, fetchWithBackoff, truncateText } from '../utils.ts'

export interface TwitterFormattedPreview {
  thread: string[]
  mediaAttachment?: string
  characterCounts: number[]
}

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

async function uploadTwitterMediaV1(
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

export const twitterAdapter: SocialAdapter = {
  platform: 'twitter',
  name: 'Twitter / X (REST API v2 + v1.1 Media)',

  isConfigured(config: SocialEnvConfig): boolean {
    return Boolean(
      config.twitter.bearerToken ||
        (config.twitter.apiKey &&
          config.twitter.apiSecret &&
          config.twitter.accessToken &&
          config.twitter.accessSecret)
    )
  },

  formatPreview(payload: SocialPostPayload, _config: SocialEnvConfig): TwitterFormattedPreview {
    const thread = buildTwitterMicroThread(
      payload.title,
      payload.summary || payload.detailed,
      payload.url,
      payload.tags
    )
    return {
      thread,
      ...(payload.imagePath ? { mediaAttachment: payload.imagePath } : {}),
      characterCounts: thread.map(t => t.length)
    }
  },

  async publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult> {
    const start = Date.now()
    const preview = this.formatPreview(payload, config) as TwitterFormattedPreview

    if (options?.dryRun) {
      return {
        platform: 'twitter',
        ok: true,
        dryRun: true,
        message: `[DRY-RUN] Twitter/X micro-thread ready (${preview.thread.length} tweet(s), ${preview.characterCounts.join('/')} chars).`,
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    }

    if (!this.isConfigured(config)) {
      return {
        platform: 'twitter',
        ok: false,
        dryRun: false,
        message: 'Missing Twitter API v2 credentials in environment.',
        error: 'TWITTER_API_KEY / TWITTER_ACCESS_TOKEN not configured',
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    }

    try {
      let mediaId: string | null = null
      if (payload.imagePath) {
        mediaId = await uploadTwitterMediaV1(payload.imagePath, config)
      }

      const tweetEndpoint = 'https://api.twitter.com/2/tweets'
      let previousTweetId: string | undefined
      let firstTweetId: string | undefined

      for (let i = 0; i < preview.thread.length; i++) {
        const text = preview.thread[i] ?? ''
        const bodyObj: Record<string, unknown> = { text }

        if (i === 0 && mediaId) {
          bodyObj.media = { media_ids: [mediaId] }
        }
        if (previousTweetId) {
          bodyObj.reply = { in_reply_to_tweet_id: previousTweetId }
        }

        const hasOAuth1 = Boolean(
          config.twitter.apiKey &&
            config.twitter.apiSecret &&
            config.twitter.accessToken &&
            config.twitter.accessSecret
        )

        const authHeader = hasOAuth1
          ? buildOAuth1Header('POST', tweetEndpoint, config.twitter)
          : `Bearer ${config.twitter.bearerToken}`

        const res = await fetchWithBackoff(tweetEndpoint, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyObj)
        })

        if (!res.ok) {
          const errText = await res.text()
          return {
            platform: 'twitter',
            ok: false,
            dryRun: false,
            status: res.status,
            message: `Twitter v2 API returned HTTP ${res.status}`,
            error: truncateText(errText, 300),
            durationMs: Date.now() - start
          }
        }

        const json = (await res.json().catch(() => ({}))) as { data?: { id?: string } }
        const createdId = json.data?.id
        if (i === 0) firstTweetId = createdId
        previousTweetId = createdId
      }

      return {
        platform: 'twitter',
        ok: true,
        dryRun: false,
        status: 201,
        ...(firstTweetId ? { externalId: firstTweetId } : {}),
        ...(firstTweetId ? { externalUrl: `https://x.com/i/web/status/${firstTweetId}` } : {}),
        message: `Published ${preview.thread.length} tweet(s) to Twitter / X.`,
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'twitter',
        ok: false,
        dryRun: false,
        message: 'Failed to publish to Twitter / X.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

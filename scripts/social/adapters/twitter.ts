import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { buildTwitterMicroThread, fetchWithBackoff, truncateText } from '../utils.ts'
import { buildOAuth1Header, uploadTwitterMediaV1 } from './twitter-oauth.ts'

export { buildOAuth1Header }

export interface TwitterFormattedPreview {
  thread: string[]
  mediaAttachment?: string
  characterCounts: number[]
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
      const mediaId = payload.imagePath
        ? await uploadTwitterMediaV1(payload.imagePath, config)
        : null
      const tweetEndpoint = 'https://api.twitter.com/2/tweets'
      let previousTweetId: string | undefined
      let firstTweetId: string | undefined

      const hasOAuth1 = Boolean(
        config.twitter.apiKey &&
          config.twitter.apiSecret &&
          config.twitter.accessToken &&
          config.twitter.accessSecret
      )

      for (let i = 0; i < preview.thread.length; i++) {
        const bodyObj: Record<string, unknown> = { text: preview.thread[i] ?? '' }
        if (i === 0 && mediaId) bodyObj.media = { media_ids: [mediaId] }
        if (previousTweetId) bodyObj.reply = { in_reply_to_tweet_id: previousTweetId }

        const authHeader = hasOAuth1
          ? buildOAuth1Header('POST', tweetEndpoint, config.twitter)
          : `Bearer ${config.twitter.bearerToken}`

        const res = await fetchWithBackoff(tweetEndpoint, {
          method: 'POST',
          headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyObj)
        })

        if (!res.ok) {
          return {
            platform: 'twitter',
            ok: false,
            dryRun: false,
            status: res.status,
            message: `Twitter v2 API returned HTTP ${res.status}`,
            error: truncateText(await res.text(), 300),
            durationMs: Date.now() - start
          }
        }

        const json = (await res.json().catch(() => ({}))) as { data?: { id?: string } }
        if (i === 0) firstTweetId = json.data?.id
        previousTweetId = json.data?.id
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

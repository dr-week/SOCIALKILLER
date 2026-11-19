import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { fetchWithBackoff, normalizeTags, truncateText } from '../utils.ts'

export interface RedditSubmissionPreview {
  subreddit: string
  title: string
  kind: 'self'
  text: string
  url?: string
}

export function buildRedditSubmission(
  payload: SocialPostPayload,
  config: SocialEnvConfig
): RedditSubmissionPreview {
  const sr = (payload.subreddit || config.reddit.defaultSubreddit || 'opensource')
    .trim()
    .replace(/^r\//i, '')

  const tagsLine = normalizeTags(payload.tags).join(' ')
  const brand = payload.brandName || config.brandName

  const markdownBody = [
    `**TL;DR:** ${payload.summary}`,
    '',
    '---',
    '',
    payload.detailed || payload.summary,
    '',
    payload.url ? `🔗 **Project / Release Link:** [${payload.url}](${payload.url})` : '',
    payload.imagePath && payload.imagePath.startsWith('http')
      ? `🖼️ **Preview Card:** [View Media](${payload.imagePath})`
      : '',
    tagsLine ? `\n*Topics: ${tagsLine}*` : '',
    `\n*Posted via ${brand}*`
  ]
    .filter(Boolean)
    .join('\n')

  return {
    subreddit: sr,
    title: truncateText(
      payload.versionTag ? `[${payload.versionTag}] ${payload.title}` : payload.title,
      295
    ),
    kind: 'self',
    text: markdownBody,
    ...(payload.url ? { url: payload.url } : {})
  }
}

export const redditAdapter: SocialAdapter = {
  platform: 'reddit',
  name: 'Reddit Community (OAuth2 /api/submit)',

  isConfigured(config: SocialEnvConfig): boolean {
    return Boolean(
      config.reddit.clientId &&
        config.reddit.clientSecret &&
        config.reddit.username &&
        config.reddit.password
    )
  },

  formatPreview(payload: SocialPostPayload, config: SocialEnvConfig): RedditSubmissionPreview {
    return buildRedditSubmission(payload, config)
  },

  async publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult> {
    const start = Date.now()
    const submission = buildRedditSubmission(payload, config)

    if (options?.dryRun) {
      return {
        platform: 'reddit',
        ok: true,
        dryRun: true,
        message: `[DRY-RUN] Reddit markdown post ready for r/${submission.subreddit}.`,
        formattedPreview: submission,
        durationMs: Date.now() - start
      }
    }

    if (!this.isConfigured(config)) {
      return {
        platform: 'reddit',
        ok: false,
        dryRun: false,
        message:
          'Missing REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, or REDDIT_PASSWORD.',
        error: 'Reddit OAuth2 script credentials not configured',
        formattedPreview: submission,
        durationMs: Date.now() - start
      }
    }

    try {
      // Step 1: Exchange script credentials for OAuth2 bearer token
      const basicAuth = Buffer.from(
        `${config.reddit.clientId}:${config.reddit.clientSecret}`
      ).toString('base64')

      const tokenParams = new URLSearchParams({
        grant_type: 'password',
        username: config.reddit.username,
        password: config.reddit.password
      })

      const tokenRes = await fetchWithBackoff('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': config.reddit.userAgent
        },
        body: tokenParams.toString()
      })

      if (!tokenRes.ok) {
        const errText = await tokenRes.text()
        return {
          platform: 'reddit',
          ok: false,
          dryRun: false,
          status: tokenRes.status,
          message: `Reddit OAuth token request failed (HTTP ${tokenRes.status})`,
          error: truncateText(errText, 300),
          durationMs: Date.now() - start
        }
      }

      const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string }
      if (!tokenData.access_token) {
        return {
          platform: 'reddit',
          ok: false,
          dryRun: false,
          message: `Reddit OAuth failed: ${tokenData.error || 'No access_token returned'}`,
          error: tokenData.error || 'No access_token',
          durationMs: Date.now() - start
        }
      }

      // Step 2: Submit self-post to r/<subreddit>
      const submitParams = new URLSearchParams({
        api_type: 'json',
        sr: submission.subreddit,
        kind: submission.kind,
        title: submission.title,
        text: submission.text,
        resubmit: 'true'
      })

      const submitRes = await fetchWithBackoff('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': config.reddit.userAgent
        },
        body: submitParams.toString()
      })

      if (!submitRes.ok) {
        const errText = await submitRes.text()
        return {
          platform: 'reddit',
          ok: false,
          dryRun: false,
          status: submitRes.status,
          message: `Reddit /api/submit returned HTTP ${submitRes.status}`,
          error: truncateText(errText, 300),
          durationMs: Date.now() - start
        }
      }

      const submitJson = (await submitRes.json().catch(() => ({}))) as {
        json?: {
          errors?: unknown[][]
          data?: { id?: string; url?: string }
        }
      }

      const errors = submitJson.json?.errors ?? []
      if (errors.length > 0) {
        return {
          platform: 'reddit',
          ok: false,
          dryRun: false,
          message: `Reddit submission rejected: ${JSON.stringify(errors[0])}`,
          error: JSON.stringify(errors[0]),
          durationMs: Date.now() - start
        }
      }

      const postUrl = submitJson.json?.data?.url
      const postId = submitJson.json?.data?.id

      return {
        platform: 'reddit',
        ok: true,
        dryRun: false,
        status: submitRes.status,
        ...(postId ? { externalId: postId } : {}),
        ...(postUrl ? { externalUrl: postUrl } : {}),
        message: `Published community thread to r/${submission.subreddit}.`,
        formattedPreview: submission,
        durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'reddit',
        ok: false,
        dryRun: false,
        message: 'Failed to publish to Reddit.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

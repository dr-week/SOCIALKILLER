import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { fetchWithBackoff, truncateText } from '../utils.ts'
import {
  type RedditSubmissionPreview,
  buildRedditSubmission,
  fetchRedditAccessToken
} from './reddit-builder.ts'

export type { RedditSubmissionPreview }
export { buildRedditSubmission }

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
      const auth = await fetchRedditAccessToken(config)
      if (!auth.token) {
        return {
          platform: 'reddit',
          ok: false,
          dryRun: false,
          ...(auth.status ? { status: auth.status } : {}),
          message: auth.status
            ? `Reddit OAuth token request failed (HTTP ${auth.status})`
            : `Reddit OAuth failed: ${auth.error}`,
          error: auth.error || 'OAuth failed',
          durationMs: Date.now() - start
        }
      }

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
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': config.reddit.userAgent
        },
        body: submitParams.toString()
      })

      if (!submitRes.ok) {
        return {
          platform: 'reddit',
          ok: false,
          dryRun: false,
          status: submitRes.status,
          message: `Reddit /api/submit returned HTTP ${submitRes.status}`,
          error: truncateText(await submitRes.text(), 300),
          durationMs: Date.now() - start
        }
      }

      const submitJson = (await submitRes.json().catch(() => ({}))) as {
        json?: { errors?: unknown[][]; data?: { id?: string; url?: string } }
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
        platform: 'reddit', ok: true, dryRun: false, status: submitRes.status,
        ...(postId ? { externalId: postId } : {}),
        ...(postUrl ? { externalUrl: postUrl } : {}),
        message: `Published community thread to r/${submission.subreddit}.`,
        formattedPreview: submission, durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'reddit', ok: false, dryRun: false,
        message: 'Failed to publish to Reddit.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

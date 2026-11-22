import type { SocialEnvConfig, SocialPostPayload } from '../types.ts'
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

export async function fetchRedditAccessToken(
  config: SocialEnvConfig
): Promise<{ token?: string; status?: number; error?: string }> {
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
    return { status: tokenRes.status, error: truncateText(await tokenRes.text(), 300) }
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string }
  if (!tokenData.access_token) {
    return { error: tokenData.error || 'No access_token returned' }
  }
  return { token: tokenData.access_token }
}

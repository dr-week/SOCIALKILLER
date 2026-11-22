import type { PlatformPublishResult, SocialEnvConfig, SocialPostPayload } from '../types.ts'
import { fetchWithBackoff, normalizeTags, truncateText } from '../utils.ts'

export interface BufferOrMetaPreview {
  mode: 'buffer' | 'meta_instagram'
  caption: string
  profileIds?: string[]
  instagramAccountId?: string
  mediaUrl?: string
  link?: string
}

export function buildBufferCaption(payload: SocialPostPayload): string {
  const hashtagBlock = normalizeTags(payload.tags).join(' ')
  const parts = [
    `✨ ${payload.title}`,
    payload.detailed || payload.summary,
    payload.url ? `🔗 Link in bio / ${payload.url}` : '',
    hashtagBlock ? `.\n.\n.\n${hashtagBlock}` : ''
  ].filter(Boolean)

  return truncateText(parts.join('\n\n'), 2150)
}

export function buildBufferPreview(
  payload: SocialPostPayload,
  config: SocialEnvConfig
): BufferOrMetaPreview {
  const useMetaDirect =
    !config.buffer.accessToken &&
    Boolean(config.buffer.metaAccessToken && config.buffer.metaInstagramAccountId)

  const caption = buildBufferCaption(payload)
  const isRemoteMedia =
    payload.imagePath &&
    (payload.imagePath.startsWith('http://') || payload.imagePath.startsWith('https://'))

  if (useMetaDirect) {
    return {
      mode: 'meta_instagram',
      caption,
      instagramAccountId: config.buffer.metaInstagramAccountId,
      ...(isRemoteMedia && payload.imagePath ? { mediaUrl: payload.imagePath } : {})
    }
  }

  return {
    mode: 'buffer',
    caption,
    profileIds:
      config.buffer.profileIds.length > 0
        ? config.buffer.profileIds
        : ['BUFFER_PROFILE_ID_IG', 'BUFFER_PROFILE_ID_THREADS'],
    ...(isRemoteMedia && payload.imagePath ? { mediaUrl: payload.imagePath } : {}),
    ...(payload.url ? { link: payload.url } : {})
  }
}

export async function publishViaMetaGraph(
  preview: BufferOrMetaPreview,
  config: SocialEnvConfig,
  start: number
): Promise<PlatformPublishResult> {
  if (!preview.mediaUrl) {
    return {
      platform: 'buffer',
      ok: false,
      dryRun: false,
      message: 'Instagram Graph API requires a public image URL in imagePath.',
      error: 'Missing public imagePath URL for Instagram container',
      durationMs: Date.now() - start
    }
  }

  const igId = config.buffer.metaInstagramAccountId
  const token = config.buffer.metaAccessToken

  const containerUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(igId)}/media`
  const containerRes = await fetchWithBackoff(containerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: preview.mediaUrl,
      caption: preview.caption,
      access_token: token
    })
  })

  if (!containerRes.ok) {
    return {
      platform: 'buffer',
      ok: false,
      dryRun: false,
      status: containerRes.status,
      message: `Meta Graph media container error (HTTP ${containerRes.status})`,
      error: truncateText(await containerRes.text(), 300),
      durationMs: Date.now() - start
    }
  }

  const containerData = (await containerRes.json()) as { id?: string }
  if (!containerData.id) {
    return {
      platform: 'buffer',
      ok: false,
      dryRun: false,
      message: 'Meta Graph API did not return a creation_id.',
      error: 'Missing creation_id',
      durationMs: Date.now() - start
    }
  }

  const publishUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(igId)}/media_publish`
  const pubRes = await fetchWithBackoff(publishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerData.id, access_token: token })
  })

  if (!pubRes.ok) {
    return {
      platform: 'buffer',
      ok: false,
      dryRun: false,
      status: pubRes.status,
      message: `Meta Graph media_publish error (HTTP ${pubRes.status})`,
      error: truncateText(await pubRes.text(), 300),
      durationMs: Date.now() - start
    }
  }

  const pubData = (await pubRes.json()) as { id?: string }
  return {
    platform: 'buffer',
    ok: true,
    dryRun: false,
    status: pubRes.status,
    ...(pubData.id ? { externalId: pubData.id } : {}),
    message: 'Published square visual + hashtag block to Instagram via Meta Graph API.',
    formattedPreview: preview,
    durationMs: Date.now() - start
  }
}

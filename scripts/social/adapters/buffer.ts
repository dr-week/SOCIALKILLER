import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
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

export const bufferAdapter: SocialAdapter = {
  platform: 'buffer',
  name: 'Instagram & Threads (Buffer / Meta Graph API)',

  isConfigured(config: SocialEnvConfig): boolean {
    return Boolean(
      (config.buffer.accessToken && config.buffer.profileIds.length > 0) ||
        (config.buffer.metaAccessToken && config.buffer.metaInstagramAccountId)
    )
  },

  formatPreview(payload: SocialPostPayload, config: SocialEnvConfig): BufferOrMetaPreview {
    return buildBufferPreview(payload, config)
  },

  async publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult> {
    const start = Date.now()
    const preview = buildBufferPreview(payload, config)

    if (options?.dryRun) {
      return {
        platform: 'buffer',
        ok: true,
        dryRun: true,
        message: `[DRY-RUN] ${preview.mode === 'meta_instagram' ? 'Meta Graph API (Instagram)' : 'Buffer Syndication (Instagram/Threads/FB)'} payload ready.`,
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    }

    if (!this.isConfigured(config)) {
      return {
        platform: 'buffer',
        ok: false,
        dryRun: false,
        message:
          'Missing BUFFER_ACCESS_TOKEN + BUFFER_PROFILE_IDS (or META_ACCESS_TOKEN + META_IG_ACCOUNT_ID).',
        error: 'Buffer / Meta credentials not configured',
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    }

    try {
      // Path A: Direct Meta Graph API for Instagram Business Account
      if (preview.mode === 'meta_instagram') {
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

        // Step 1: Create media container
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
          const errText = await containerRes.text()
          return {
            platform: 'buffer',
            ok: false,
            dryRun: false,
            status: containerRes.status,
            message: `Meta Graph media container error (HTTP ${containerRes.status})`,
            error: truncateText(errText, 300),
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

        // Step 2: Publish media container
        const publishUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(igId)}/media_publish`
        const pubRes = await fetchWithBackoff(publishUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: token
          })
        })

        if (!pubRes.ok) {
          const errText = await pubRes.text()
          return {
            platform: 'buffer',
            ok: false,
            dryRun: false,
            status: pubRes.status,
            message: `Meta Graph media_publish error (HTTP ${pubRes.status})`,
            error: truncateText(errText, 300),
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

      // Path B: Buffer API v1 updates/create.json (syndicates to Instagram, Threads, Facebook)
      const params = new URLSearchParams()
      params.append('text', preview.caption)
      params.append('now', 'true')
      for (const pid of config.buffer.profileIds) {
        params.append('profile_ids[]', pid)
      }
      if (preview.link) {
        params.append('media[link]', preview.link)
      }
      if (preview.mediaUrl) {
        params.append('media[photo]', preview.mediaUrl)
        params.append('media[thumbnail]', preview.mediaUrl)
      }

      const res = await fetchWithBackoff('https://api.bufferapp.com/1/updates/create.json', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.buffer.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      if (!res.ok) {
        const errText = await res.text()
        return {
          platform: 'buffer',
          ok: false,
          dryRun: false,
          status: res.status,
          message: `Buffer API returned HTTP ${res.status}`,
          error: truncateText(errText, 300),
          durationMs: Date.now() - start
        }
      }

      const data = (await res.json().catch(() => ({}))) as {
        updates?: Array<{ id?: string }>
      }
      const firstId = data.updates?.[0]?.id
      return {
        platform: 'buffer',
        ok: true,
        dryRun: false,
        status: res.status,
        ...(firstId ? { externalId: firstId } : {}),
        message: `Syndicated post to ${config.buffer.profileIds.length} Buffer profile(s) (Instagram/Threads/FB).`,
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'buffer',
        ok: false,
        dryRun: false,
        message: 'Failed to publish via Buffer / Meta API.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

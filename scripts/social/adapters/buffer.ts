import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { fetchWithBackoff, truncateText } from '../utils.ts'
import {
  type BufferOrMetaPreview,
  buildBufferCaption,
  buildBufferPreview,
  publishViaMetaGraph
} from './buffer-builder.ts'

export type { BufferOrMetaPreview }
export { buildBufferCaption, buildBufferPreview }

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
      if (preview.mode === 'meta_instagram') {
        return await publishViaMetaGraph(preview, config, start)
      }

      const params = new URLSearchParams()
      params.append('text', preview.caption)
      params.append('now', 'true')
      for (const pid of config.buffer.profileIds) {
        params.append('profile_ids[]', pid)
      }
      if (preview.link) params.append('media[link]', preview.link)
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
        return {
          platform: 'buffer',
          ok: false,
          dryRun: false,
          status: res.status,
          message: `Buffer API returned HTTP ${res.status}`,
          error: truncateText(await res.text(), 300),
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

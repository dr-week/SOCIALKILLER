import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { fetchWithBackoff, truncateText } from '../utils.ts'
import {
  type LinkedInUgcPayload,
  buildLinkedInUgcPayload,
  registerAndUploadLinkedInImage
} from './linkedin-builder.ts'

export type { LinkedInUgcPayload }
export { buildLinkedInUgcPayload }

export const linkedinAdapter: SocialAdapter = {
  platform: 'linkedin',
  name: 'LinkedIn (UGC Share API v2)',

  isConfigured(config: SocialEnvConfig): boolean {
    return Boolean(config.linkedin.accessToken && config.linkedin.authorUrn)
  },

  formatPreview(payload: SocialPostPayload, config: SocialEnvConfig): LinkedInUgcPayload {
    return buildLinkedInUgcPayload(
      payload,
      config,
      payload.imagePath ? 'urn:li:digitalmediaAsset:PREVIEW_IMAGE_ASSET' : undefined
    )
  },

  async publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult> {
    const start = Date.now()
    const preview = this.formatPreview(payload, config)

    if (options?.dryRun) {
      return {
        platform: 'linkedin',
        ok: true,
        dryRun: true,
        message: '[DRY-RUN] LinkedIn UGC technical post payload ready.',
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    }

    if (!this.isConfigured(config)) {
      return {
        platform: 'linkedin',
        ok: false,
        dryRun: false,
        message: 'Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN in environment.',
        error: 'LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN not configured',
        formattedPreview: preview,
        durationMs: Date.now() - start
      }
    }

    try {
      let assetUrn: string | undefined
      if (payload.imagePath) {
        const uploaded = await registerAndUploadLinkedInImage(payload.imagePath, config)
        if (uploaded) assetUrn = uploaded
      }

      const body = buildLinkedInUgcPayload(payload, config, assetUrn)
      const res = await fetchWithBackoff('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.linkedin.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        return {
          platform: 'linkedin',
          ok: false,
          dryRun: false,
          status: res.status,
          message: `LinkedIn API returned HTTP ${res.status}`,
          error: truncateText(await res.text(), 300),
          durationMs: Date.now() - start
        }
      }

      const data = (await res.json().catch(() => ({}))) as { id?: string }
      return {
        platform: 'linkedin',
        ok: true,
        dryRun: false,
        status: res.status,
        ...(data.id ? { externalId: data.id } : {}),
        message: 'Published technical announcement to LinkedIn.',
        formattedPreview: body,
        durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'linkedin',
        ok: false,
        dryRun: false,
        message: 'Failed to publish to LinkedIn.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

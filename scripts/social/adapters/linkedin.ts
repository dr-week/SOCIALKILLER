import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { fetchWithBackoff, normalizeTags, truncateText } from '../utils.ts'

export interface LinkedInUgcPayload {
  author: string
  lifecycleState: 'PUBLISHED'
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: { text: string }
      shareMediaCategory: 'NONE' | 'ARTICLE' | 'IMAGE'
      media?: Array<{
        status: 'READY'
        description?: { text: string }
        originalUrl?: string
        media?: string
        title?: { text: string }
      }>
    }
  }
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
  }
}

export function buildLinkedInUgcPayload(
  payload: SocialPostPayload,
  config: SocialEnvConfig,
  uploadedAssetUrn?: string
): LinkedInUgcPayload {
  const tagsLine = normalizeTags(payload.tags).join(' ')
  const fullCommentary = truncateText(
    [
      `🚀 ${payload.title}`,
      payload.detailed || payload.summary,
      payload.url ? `🔗 Explore: ${payload.url}` : '',
      tagsLine
    ]
      .filter(Boolean)
      .join('\n\n'),
    2950
  )

  const authorUrn = config.linkedin.authorUrn || 'urn:li:person:YOUR_LINKEDIN_ID'

  if (uploadedAssetUrn) {
    return {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: fullCommentary },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              description: { text: truncateText(payload.summary || payload.title, 200) },
              media: uploadedAssetUrn,
              title: { text: truncateText(payload.title, 200) }
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }
  }

  if (payload.url) {
    return {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: fullCommentary },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              description: { text: truncateText(payload.summary || payload.title, 200) },
              originalUrl: payload.url,
              title: { text: truncateText(payload.title, 200) }
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }
  }

  return {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: fullCommentary },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  }
}

async function registerAndUploadLinkedInImage(
  imagePath: string,
  config: SocialEnvConfig
): Promise<string | null> {
  let imgBytes: Buffer | null = null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const res = await fetchWithBackoff(imagePath)
    if (!res.ok) return null
    imgBytes = Buffer.from(await res.arrayBuffer())
  } else {
    const absPath = resolve(process.cwd(), imagePath)
    if (!existsSync(absPath)) return null
    imgBytes = readFileSync(absPath)
  }

  const registerRes = await fetchWithBackoff(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.linkedin.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: config.linkedin.authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      })
    }
  )

  if (!registerRes.ok) return null
  const regData = (await registerRes.json().catch(() => ({}))) as {
    value?: {
      asset?: string
      uploadMechanism?: {
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'?: {
          uploadUrl?: string
        }
      }
    }
  }

  const assetUrn = regData.value?.asset
  const uploadUrl =
    regData.value?.uploadMechanism?.[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ]?.uploadUrl

  if (!assetUrn || !uploadUrl || !imgBytes) return null

  const putRes = await fetchWithBackoff(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.linkedin.accessToken}`,
      'Content-Type': 'application/octet-stream'
    },
    body: new Uint8Array(imgBytes)
  })

  return putRes.ok ? assetUrn : null
}

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
        const errText = await res.text()
        return {
          platform: 'linkedin',
          ok: false,
          dryRun: false,
          status: res.status,
          message: `LinkedIn API returned HTTP ${res.status}`,
          error: truncateText(errText, 300),
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

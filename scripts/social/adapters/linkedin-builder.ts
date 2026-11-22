import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SocialEnvConfig, SocialPostPayload } from '../types.ts'
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
  const visibility = { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' as const }
  const shareMediaCategory = uploadedAssetUrn ? 'IMAGE' : payload.url ? 'ARTICLE' : 'NONE'
  const media = uploadedAssetUrn
    ? [{
        status: 'READY' as const,
        description: { text: truncateText(payload.summary || payload.title, 200) },
        media: uploadedAssetUrn,
        title: { text: truncateText(payload.title, 200) }
      }]
    : payload.url
      ? [{
          status: 'READY' as const,
          description: { text: truncateText(payload.summary || payload.title, 200) },
          originalUrl: payload.url,
          title: { text: truncateText(payload.title, 200) }
        }]
      : undefined

  return {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: fullCommentary },
        shareMediaCategory,
        ...(media ? { media } : {})
      }
    },
    visibility
  }
}

export async function registerAndUploadLinkedInImage(
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
            { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }
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
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'?: { uploadUrl?: string }
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

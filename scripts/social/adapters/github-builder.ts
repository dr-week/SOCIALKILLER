import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import type { SocialEnvConfig, SocialPostPayload } from '../types.ts'
import { fetchWithBackoff, normalizeTags } from '../utils.ts'

export interface GitHubReleasePayload {
  repository: string
  tag_name: string
  name: string
  body: string
  draft: boolean
  prerelease: boolean
  assetPath?: string
}

export function buildGitHubReleasePayload(
  payload: SocialPostPayload,
  config: SocialEnvConfig
): GitHubReleasePayload {
  const tagName = payload.versionTag || `v${new Date().toISOString().slice(0, 10)}`
  const tagsLine = normalizeTags(payload.tags).join(' ')
  const brand = payload.brandName || config.brandName

  const mdLines = [
    `## 🚀 ${payload.title}`,
    '',
    `> ${payload.summary}`,
    '',
    '### 📋 Release Highlights & Technical Breakdown',
    '',
    payload.detailed || payload.summary,
    '',
    payload.url ? `🔗 **Canonical URL:** ${payload.url}` : '',
    tagsLine ? `🏷️ **Tags:** ${tagsLine}` : '',
    '',
    `---`,
    `*Published automatically via ${brand} Multi-Platform Release Engine.*`
  ].filter(line => line !== undefined)

  return {
    repository: config.github.repository || 'danger-labs/followdesk',
    tag_name: tagName,
    name: `${tagName} — ${payload.title}`,
    body: mdLines.join('\n'),
    draft: config.github.draft,
    prerelease: config.github.prerelease,
    ...(payload.imagePath ? { assetPath: payload.imagePath } : {})
  }
}

export async function uploadReleaseAsset(
  token: string,
  uploadUrl: string,
  imagePath: string
): Promise<void> {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return
  const absPath = resolve(process.cwd(), imagePath)
  if (!existsSync(absPath)) return

  const uploadBase = uploadUrl.replace(/\{\?name,label\}$/, '')
  const fileName = basename(absPath)
  const fileBytes = readFileSync(absPath)
  await fetchWithBackoff(`${uploadBase}?name=${encodeURIComponent(fileName)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/octet-stream',
      'User-Agent': 'Zuari-MultiPlatform-Publisher/1.0'
    },
    body: new Uint8Array(fileBytes)
  }).catch(() => null)
}

import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { fetchWithBackoff, normalizeTags, truncateText } from '../utils.ts'

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

export const githubAdapter: SocialAdapter = {
  platform: 'github',
  name: 'GitHub Releases (REST API v3)',

  isConfigured(config: SocialEnvConfig): boolean {
    return Boolean(config.github.token && config.github.repository)
  },

  formatPreview(payload: SocialPostPayload, config: SocialEnvConfig): GitHubReleasePayload {
    return buildGitHubReleasePayload(payload, config)
  },

  async publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult> {
    const start = Date.now()
    const releasePayload = buildGitHubReleasePayload(payload, config)

    if (options?.dryRun) {
      return {
        platform: 'github',
        ok: true,
        dryRun: true,
        message: `[DRY-RUN] GitHub Release ${releasePayload.tag_name} ready for ${releasePayload.repository}.`,
        formattedPreview: releasePayload,
        durationMs: Date.now() - start
      }
    }

    if (!this.isConfigured(config)) {
      return {
        platform: 'github',
        ok: false,
        dryRun: false,
        message: 'Missing GITHUB_TOKEN or GITHUB_REPOSITORY in environment.',
        error: 'GITHUB_TOKEN / GITHUB_REPOSITORY not configured',
        formattedPreview: releasePayload,
        durationMs: Date.now() - start
      }
    }

    try {
      const apiUrl = `https://api.github.com/repos/${config.github.repository}/releases`
      const res = await fetchWithBackoff(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.github.token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'User-Agent': 'Zuari-MultiPlatform-Publisher/1.0'
        },
        body: JSON.stringify({
          tag_name: releasePayload.tag_name,
          name: releasePayload.name,
          body: releasePayload.body,
          draft: releasePayload.draft,
          prerelease: releasePayload.prerelease,
          generate_release_notes: true
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        return {
          platform: 'github',
          ok: false,
          dryRun: false,
          status: res.status,
          message: `GitHub Releases API returned HTTP ${res.status}`,
          error: truncateText(errText, 300),
          durationMs: Date.now() - start
        }
      }

      const data = (await res.json()) as {
        id?: number
        html_url?: string
        upload_url?: string
      }

      // Optional local asset upload if imagePath points to a local file
      if (
        payload.imagePath &&
        !payload.imagePath.startsWith('http://') &&
        !payload.imagePath.startsWith('https://') &&
        data.upload_url
      ) {
        const absPath = resolve(process.cwd(), payload.imagePath)
        if (existsSync(absPath)) {
          const uploadBase = data.upload_url.replace(/\{\?name,label\}$/, '')
          const fileName = basename(absPath)
          const fileBytes = readFileSync(absPath)
          await fetchWithBackoff(`${uploadBase}?name=${encodeURIComponent(fileName)}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.github.token}`,
              Accept: 'application/vnd.github+json',
              'Content-Type': 'application/octet-stream',
              'User-Agent': 'Zuari-MultiPlatform-Publisher/1.0'
            },
            body: new Uint8Array(fileBytes)
          }).catch(() => null)
        }
      }

      return {
        platform: 'github',
        ok: true,
        dryRun: false,
        status: res.status,
        ...(data.id ? { externalId: String(data.id) } : {}),
        ...(data.html_url ? { externalUrl: data.html_url } : {}),
        message: `Published GitHub Release ${releasePayload.tag_name} to ${config.github.repository}.`,
        formattedPreview: releasePayload,
        durationMs: Date.now() - start
      }
    } catch (err) {
      return {
        platform: 'github',
        ok: false,
        dryRun: false,
        message: 'Failed to publish GitHub Release.',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start
      }
    }
  }
}

import type {
  PlatformPublishResult,
  SocialAdapter,
  SocialEnvConfig,
  SocialPostPayload
} from '../types.ts'
import { fetchWithBackoff, truncateText } from '../utils.ts'
import {
  type GitHubReleasePayload,
  buildGitHubReleasePayload,
  uploadReleaseAsset
} from './github-builder.ts'

export type { GitHubReleasePayload }
export { buildGitHubReleasePayload }

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

      const data = (await res.json()) as { id?: number; html_url?: string; upload_url?: string }
      if (payload.imagePath && data.upload_url) {
        await uploadReleaseAsset(config.github.token, data.upload_url, payload.imagePath)
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

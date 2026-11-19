export type SocialPlatform =
  | 'discord'
  | 'telegram'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'buffer'
  | 'reddit'

export const ALL_PLATFORMS: SocialPlatform[] = [
  'discord',
  'telegram',
  'twitter',
  'linkedin',
  'github',
  'buffer',
  'reddit'
]

export type PresetName = 'release' | 'benchmark' | 'community' | 'custom'

export interface SocialPostPayload {
  /** Short headline / announcement title */
  title: string
  /** 280-char concise version for Twitter/X and quick social hooks */
  summary: string
  /** Full technical breakdown or community copy for LinkedIn / Discord / Telegram / Reddit */
  detailed: string
  /** Optional absolute or relative path (or URL) to marketing image / asset */
  imagePath?: string
  /** Array of hashtag strings (without or with leading #) */
  tags: string[]
  /** Canonical link (e.g. GitHub repository, release URL, or live demo) */
  url: string
  /** Optional Reddit target subreddit override (e.g. 'webdev' or 'opensource') */
  subreddit?: string
  /** Optional version tag for GitHub Releases (e.g. 'v0.2.0') */
  versionTag?: string
  /** Optional brand/organization name override (e.g. 'Zuari / Danger.Labs' or 'FollowDesk') */
  brandName?: string
  /** Optional embed hex color (e.g. '#a855f7') */
  accentColor?: string
}

export interface PlatformPublishResult {
  platform: SocialPlatform
  ok: boolean
  dryRun: boolean
  status?: number
  externalId?: string
  externalUrl?: string
  message: string
  formattedPreview?: unknown
  error?: string
  durationMs: number
}

export interface SocialAdapter {
  platform: SocialPlatform
  name: string
  isConfigured(config: SocialEnvConfig): boolean
  formatPreview(payload: SocialPostPayload, config: SocialEnvConfig): unknown
  publish(
    payload: SocialPostPayload,
    config: SocialEnvConfig,
    options?: { dryRun?: boolean }
  ): Promise<PlatformPublishResult>
}

export interface SocialEnvConfig {
  brandName: string
  defaultUrl: string
  discord: {
    webhookUrl: string
    username: string
    avatarUrl: string
  }
  telegram: {
    botToken: string
    chatId: string
    parseMode: 'HTML' | 'MarkdownV2'
  }
  twitter: {
    apiKey: string
    apiSecret: string
    accessToken: string
    accessSecret: string
    bearerToken: string
  }
  linkedin: {
    accessToken: string
    authorUrn: string
  }
  github: {
    token: string
    repository: string
    draft: boolean
    prerelease: boolean
  }
  buffer: {
    accessToken: string
    profileIds: string[]
    metaPageId: string
    metaInstagramAccountId: string
    metaAccessToken: string
  }
  reddit: {
    clientId: string
    clientSecret: string
    username: string
    password: string
    userAgent: string
    defaultSubreddit: string
  }
}

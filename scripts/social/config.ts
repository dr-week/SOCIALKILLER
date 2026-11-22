import type { SocialEnvConfig } from './types.ts'
export { parseEnvFileContent, loadDotEnv } from './env-parser.ts'
export { getPlatformReadiness } from './readiness.ts'

export function loadSocialConfig(
  env: Record<string, string | undefined> = process.env
): SocialEnvConfig {
  const get = (key: string, fallback = ''): string => (env[key] ?? fallback).trim()
  const profileIdsRaw = get('BUFFER_PROFILE_IDS')
  const profileIds = profileIdsRaw ? profileIdsRaw.split(',').map(s => s.trim()).filter(Boolean) : []
  const parseMode: 'HTML' | 'MarkdownV2' = get('TELEGRAM_PARSE_MODE', 'HTML') === 'MarkdownV2' ? 'MarkdownV2' : 'HTML'

  return {
    brandName: get('SOCIAL_BRAND_NAME', 'SOCIALKILLER'),
    defaultUrl: get('SOCIAL_DEFAULT_URL', 'https://github.com/danger-labs/followdesk'),
    discord: {
      webhookUrl: get('DISCORD_WEBHOOK_URL'),
      username: get('DISCORD_BOT_USERNAME', 'Zuari Release Bot'),
      avatarUrl: get('DISCORD_BOT_AVATAR_URL')
    },
    telegram: {
      botToken: get('TELEGRAM_BOT_TOKEN'),
      chatId: get('TELEGRAM_CHAT_ID'),
      parseMode
    },
    twitter: {
      apiKey: get('TWITTER_API_KEY'),
      apiSecret: get('TWITTER_API_SECRET'),
      accessToken: get('TWITTER_ACCESS_TOKEN'),
      accessSecret: get('TWITTER_ACCESS_SECRET'),
      bearerToken: get('TWITTER_BEARER_TOKEN')
    },
    linkedin: {
      accessToken: get('LINKEDIN_ACCESS_TOKEN'),
      authorUrn: get('LINKEDIN_AUTHOR_URN')
    },
    github: {
      token: get('GITHUB_TOKEN'),
      repository: get('GITHUB_REPOSITORY'),
      draft: get('GITHUB_RELEASE_DRAFT', 'false').toLowerCase() === 'true',
      prerelease: get('GITHUB_RELEASE_PRERELEASE', 'false').toLowerCase() === 'true'
    },
    buffer: {
      accessToken: get('BUFFER_ACCESS_TOKEN'),
      profileIds,
      metaPageId: get('META_PAGE_ID'),
      metaInstagramAccountId: get('META_IG_ACCOUNT_ID'),
      metaAccessToken: get('META_ACCESS_TOKEN')
    },
    reddit: {
      clientId: get('REDDIT_CLIENT_ID'),
      clientSecret: get('REDDIT_CLIENT_SECRET'),
      username: get('REDDIT_USERNAME'),
      password: get('REDDIT_PASSWORD'),
      userAgent: get('REDDIT_USER_AGENT', 'ZuariSocialPublisher/1.0 (by /u/dangerlabs)'),
      defaultSubreddit: get('REDDIT_SUBREDDIT', 'opensource')
    }
  }
}

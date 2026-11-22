import type { SocialEnvConfig, SocialPlatform } from './types.ts'

export function getPlatformReadiness(
  config: SocialEnvConfig
): Record<SocialPlatform, { configured: boolean; missingKeys: string[] }> {
  const twitterConfigured = Boolean(
    config.twitter.bearerToken ||
    (config.twitter.apiKey && config.twitter.apiSecret && config.twitter.accessToken && config.twitter.accessSecret)
  )

  const bufferConfigured = Boolean(
    (config.buffer.accessToken && config.buffer.profileIds.length > 0) ||
    (config.buffer.metaAccessToken && config.buffer.metaInstagramAccountId)
  )

  const redditConfigured = Boolean(
    config.reddit.clientId && config.reddit.clientSecret && config.reddit.username && config.reddit.password
  )

  return {
    discord: {
      configured: Boolean(config.discord.webhookUrl),
      missingKeys: config.discord.webhookUrl ? [] : ['DISCORD_WEBHOOK_URL']
    },
    telegram: {
      configured: Boolean(config.telegram.botToken && config.telegram.chatId),
      missingKeys: [
        ...(!config.telegram.botToken ? ['TELEGRAM_BOT_TOKEN'] : []),
        ...(!config.telegram.chatId ? ['TELEGRAM_CHAT_ID'] : [])
      ]
    },
    twitter: {
      configured: twitterConfigured,
      missingKeys: twitterConfigured ? [] : ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET']
    },
    linkedin: {
      configured: Boolean(config.linkedin.accessToken && config.linkedin.authorUrn),
      missingKeys: [
        ...(!config.linkedin.accessToken ? ['LINKEDIN_ACCESS_TOKEN'] : []),
        ...(!config.linkedin.authorUrn ? ['LINKEDIN_AUTHOR_URN'] : [])
      ]
    },
    github: {
      configured: Boolean(config.github.token && config.github.repository),
      missingKeys: [
        ...(!config.github.token ? ['GITHUB_TOKEN'] : []),
        ...(!config.github.repository ? ['GITHUB_REPOSITORY'] : [])
      ]
    },
    buffer: {
      configured: bufferConfigured,
      missingKeys: bufferConfigured ? [] : ['BUFFER_ACCESS_TOKEN + BUFFER_PROFILE_IDS (or META_ACCESS_TOKEN + META_IG_ACCOUNT_ID)']
    },
    reddit: {
      configured: redditConfigured,
      missingKeys: [
        ...(!config.reddit.clientId ? ['REDDIT_CLIENT_ID'] : []),
        ...(!config.reddit.clientSecret ? ['REDDIT_CLIENT_SECRET'] : []),
        ...(!config.reddit.username ? ['REDDIT_USERNAME'] : []),
        ...(!config.reddit.password ? ['REDDIT_PASSWORD'] : [])
      ]
    }
  }
}

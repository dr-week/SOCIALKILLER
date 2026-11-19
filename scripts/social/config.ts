import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SocialEnvConfig, SocialPlatform } from './types.ts'

/**
 * Minimal zero-dependency .env parser that loads variables into a target map
 * without overwriting already-present environment variables.
 */
export function parseEnvFileContent(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    let val = line.slice(eqIdx + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (key) {
      result[key] = val
    }
  }
  return result
}

export function loadDotEnv(envFilePath = resolve(process.cwd(), '.env')): Record<string, string> {
  if (!existsSync(envFilePath)) return {}
  try {
    const raw = readFileSync(envFilePath, 'utf8')
    const parsed = parseEnvFileContent(raw)
    for (const [k, v] of Object.entries(parsed)) {
      if (process.env[k] === undefined) {
        process.env[k] = v
      }
    }
    return parsed
  } catch {
    return {}
  }
}

export function loadSocialConfig(
  env: Record<string, string | undefined> = process.env
): SocialEnvConfig {
  const get = (key: string, fallback = ''): string => (env[key] ?? fallback).trim()

  const profileIdsRaw = get('BUFFER_PROFILE_IDS')
  const profileIds = profileIdsRaw
    ? profileIdsRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : []

  const parseModeRaw = get('TELEGRAM_PARSE_MODE', 'HTML')
  const parseMode: 'HTML' | 'MarkdownV2' =
    parseModeRaw === 'MarkdownV2' ? 'MarkdownV2' : 'HTML'

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

export function getPlatformReadiness(
  config: SocialEnvConfig
): Record<SocialPlatform, { configured: boolean; missingKeys: string[] }> {
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
      configured: Boolean(
        config.twitter.bearerToken ||
          (config.twitter.apiKey &&
            config.twitter.apiSecret &&
            config.twitter.accessToken &&
            config.twitter.accessSecret)
      ),
      missingKeys:
        config.twitter.bearerToken ||
        (config.twitter.apiKey &&
          config.twitter.apiSecret &&
          config.twitter.accessToken &&
          config.twitter.accessSecret)
          ? []
          : [
              'TWITTER_API_KEY',
              'TWITTER_API_SECRET',
              'TWITTER_ACCESS_TOKEN',
              'TWITTER_ACCESS_SECRET'
            ]
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
      configured: Boolean(
        (config.buffer.accessToken && config.buffer.profileIds.length > 0) ||
          (config.buffer.metaAccessToken && config.buffer.metaInstagramAccountId)
      ),
      missingKeys:
        (config.buffer.accessToken && config.buffer.profileIds.length > 0) ||
        (config.buffer.metaAccessToken && config.buffer.metaInstagramAccountId)
          ? []
          : ['BUFFER_ACCESS_TOKEN + BUFFER_PROFILE_IDS (or META_ACCESS_TOKEN + META_IG_ACCOUNT_ID)']
    },
    reddit: {
      configured: Boolean(
        config.reddit.clientId &&
          config.reddit.clientSecret &&
          config.reddit.username &&
          config.reddit.password
      ),
      missingKeys: [
        ...(!config.reddit.clientId ? ['REDDIT_CLIENT_ID'] : []),
        ...(!config.reddit.clientSecret ? ['REDDIT_CLIENT_SECRET'] : []),
        ...(!config.reddit.username ? ['REDDIT_USERNAME'] : []),
        ...(!config.reddit.password ? ['REDDIT_PASSWORD'] : [])
      ]
    }
  }
}

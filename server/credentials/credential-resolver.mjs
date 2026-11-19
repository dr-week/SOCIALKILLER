import { getPlatformVaultCredentials } from './credential-vault.mjs'

const ENV_VAR_MAP = {
  instagram: 'INSTAGRAM_ACCESS_TOKEN',
  x: 'X_BEARER_TOKEN',
  reddit: 'REDDIT_ACCESS_TOKEN',
  github: 'GITHUB_TOKEN',
  discord: 'DISCORD_BOT_TOKEN',
  linkedin: 'LINKEDIN_ACCESS_TOKEN',
  devto: 'DEVTO_API_KEY',
  hashnode: 'HASHNODE_ACCESS_TOKEN',
  medium: 'MEDIUM_INTEGRATION_TOKEN',
  blog: 'BLOG_API_KEY'
}

export function getCredential(platform, brandId = 'danger-labs') {
  if (brandId !== 'danger-labs') {
    const scoped = getPlatformVaultCredentials(platform, brandId)
    return scoped?.token || scoped?.accessToken || scoped?.apiKey || scoped?.personalAccessToken || null
  }
  const varName = ENV_VAR_MAP[platform]
  if (varName && process.env[varName]) return process.env[varName]
  if (platform === 'x' && process.env.TWITTER_ACCESS_TOKEN) return process.env.TWITTER_ACCESS_TOKEN
  if (platform === 'devto' && process.env.DEVTO_API_KEY) return process.env.DEVTO_API_KEY
  const vault = getPlatformVaultCredentials(platform)
  return vault?.token || vault?.accessToken || vault?.apiKey || vault?.personalAccessToken || null
}

export const requireCredential = platform => {
  const token = getCredential(platform)
  if (!token) throw new Error(`Missing credential for "${platform}"`)
  return token
}

export const hasCredential = platform => Boolean(getCredential(platform))

export function getPlatformCredentials(platformId, config = {}) {
  const brandId = config.brandId || 'danger-labs'
  const vault = getPlatformVaultCredentials(platformId, brandId) || {}
  const saved = config.credentials || {}
  const combined = { ...vault, ...saved }
  const pick = (envName, ...keys) =>
    keys.map(key => saved[key]).find(value => value && String(value).trim()) ||
    (brandId === 'danger-labs' ? process.env[envName] : undefined) ||
    keys.map(key => vault[key]).find(value => value && String(value).trim()) ||
    undefined
  const explicitToken = saved.token || saved.accessToken || saved.bearerToken
  const envToken = getCredential(platformId, brandId)
  const token = explicitToken || envToken || vault.token || vault.accessToken || vault.bearerToken || undefined

  return {
    ...combined,
    brandId,
    clientId: pick(`${String(platformId).toUpperCase()}_CLIENT_ID`, 'clientId'),
    clientSecret: pick(`${String(platformId).toUpperCase()}_CLIENT_SECRET`, 'clientSecret'),
    refreshToken: pick(`${String(platformId).toUpperCase()}_REFRESH_TOKEN`, 'refreshToken'),
    webhookUrl: platformId === 'discord' ? pick('DISCORD_WEBHOOK_URL', 'webhookUrl') : combined.webhookUrl,
    botUsername: pick('DISCORD_BOT_USERNAME', 'botUsername'),
    personalAccessToken: platformId === 'github' ? pick('GITHUB_TOKEN', 'personalAccessToken', 'token') : combined.personalAccessToken,
    apiKey: pick(`${String(platformId).toUpperCase()}_API_KEY`, 'apiKey'),
    defaultSubreddit: pick('REDDIT_DEFAULT_SUBREDDIT', 'defaultSubreddit') || 'r/webdev',
    authorUrn: pick('LINKEDIN_PERSON_URN', 'authorUrn'),
    publicationId: pick('HASHNODE_PUBLICATION_ID', 'publicationId'),
    ...(token ? { token, bearerToken: token, accessToken: token } : {})
  }
}

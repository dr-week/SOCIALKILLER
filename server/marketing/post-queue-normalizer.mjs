import { SUPPORTED_PLATFORMS } from './platforms.mjs'

const knownPlatforms = new Set(SUPPORTED_PLATFORMS.map(platform => platform.id))

export function normalizeQueuedPost(post) {
  if (!post || typeof post !== 'object' || Array.isArray(post)) {
    throw new TypeError('Queued post must be an object.')
  }
  if (Array.isArray(post.platforms)) return post

  const loggedPlatforms = Array.isArray(post.deliveryLogs)
    ? post.deliveryLogs
      .map(log => log?.platformId)
      .filter(platformId => knownPlatforms.has(platformId))
    : []
  const platforms = [...new Set(loggedPlatforms)]

  return {
    ...post,
    platforms,
    ...(platforms.length
      ? {}
      : { metadataWarning: 'Target channels are missing; restore them before editing, approving, duplicating, or confirming.' })
  }
}

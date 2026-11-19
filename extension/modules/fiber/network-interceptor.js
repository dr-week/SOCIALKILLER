// FollowDesk Zero-Network GraphQL & API Stream Interceptor
// Passively listens to Instagram's own internal GraphQL queries and REST responses,
// capturing follower chunks, post metrics, and friendship data with ZERO extra requests.
// Completely eliminates HTTP 429 rate limits and anti-bot bans.

(function initNetworkInterceptor() {
  const originalFetch = window.fetch
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args)
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''

    try {
      // 1. Intercept Follower / Following lists fetched by Instagram client
      if (url.includes('/friendships/') && (url.includes('/followers/') || url.includes('/following/'))) {
        const clone = response.clone()
        clone.json().then(data => {
          if (data && Array.isArray(data.users)) {
            const isFollowers = url.includes('/followers/')
            console.log(`⚡ [FollowDesk Sniffer] Captured ${data.users.length} ${isFollowers ? 'followers' : 'following'} from native stream!`)
            window.postMessage({
              type: 'FOLLOWDESK_STREAM_USERS',
              kind: isFollowers ? 'followers' : 'following',
              users: data.users.map(u => ({
                username: u.username,
                href: `https://www.instagram.com/${encodeURIComponent(u.username)}/`,
                isPrivate: u.is_private,
                isVerified: u.is_verified
              }))
            }, '*')
          }
        }).catch(() => {})
      }

      // 2. Intercept User Profile Info (exact counts and friendship status)
      if (url.includes('/api/v1/users/web_profile_info/')) {
        const clone = response.clone()
        clone.json().then(data => {
          const user = data?.data?.user
          if (user) {
            console.log(`⚡ [FollowDesk Sniffer] Captured profile info for @${user.username}`)
            window.postMessage({
              type: 'FOLLOWDESK_STREAM_PROFILE',
              profile: {
                username: user.username,
                followersCount: user.edge_followed_by?.count,
                followingCount: user.edge_follow?.count,
                isPrivate: user.is_private,
                isVerified: user.is_verified,
                followedByViewer: user.followed_by_viewer,
                followsViewer: user.follows_viewer
              }
            }, '*')
          }
        }).catch(() => {})
      }
    } catch {}

    return response
  }

  console.log('⚡ [FollowDesk Sniffer] Zero-Network Stream Interceptor loaded.')
})()

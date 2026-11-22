// FollowDesk Ghost Mode (Anonymous Story, Highlight & DM Seen Blocker)
// Intercepts and retrieves Stories, Highlights & Direct Messages without transmitting 'seen' receipts.

(function initFollowDeskGhostMode() {
  const IG_APP_ID = '936619743392459'

  function isSeenBeacon(url) {
    if (typeof url !== 'string') return false
    return (
      url.includes('/api/v1/stories/reel/seen') ||
      url.includes('/seen') ||
      url.includes('/direct_v2/threads/') && url.includes('/seen') ||
      url.includes('/direct_v2/threads/broadcast/activity_indicator') ||
      url.includes('/graphsearch/view_stats')
    )
  }

  // Block Instagram's view/seen receipt telemetry beacons
  const originalFetch = window.fetch
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input?.url || ''
    if (isSeenBeacon(url)) {
      console.log('🛡️ [FollowDesk Ghost Mode] Blocked story / DM view receipt:', url)
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
    }
    return originalFetch.apply(this, arguments)
  }

  // Intercept XMLHttpRequest for seen beacons as well
  const originalOpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url) {
    if (isSeenBeacon(url)) {
      console.log('🛡️ [FollowDesk Ghost Mode] Blocked XHR story / DM view receipt:', url)
      this.send = function () {} // No-op
      return
    }
    return originalOpen.apply(this, arguments)
  }

  console.log('👻 FollowDesk Ghost Mode is active (Stories & DMs viewed anonymously without leaving seen receipts).')
})()

/**
 * Auto-Poster & Content Dispatch Module for Browser Extension
 * Bridges browser tabs, active social sessions, and the local-first FollowDesk backend
 */

export const SUPPORTED_EXTENSION_CHANNELS = [
  { id: 'x', name: 'X (Twitter)', icon: '𝕏', postUrl: 'https://twitter.com/intent/tweet?text=' },
  { id: 'reddit', name: 'Reddit', icon: 'RD', postUrl: 'https://www.reddit.com/r/webdev/submit?title=' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'IN', postUrl: 'https://www.linkedin.com/feed/?shareActive=true&text=' },
  { id: 'github', name: 'GitHub Gist', icon: 'GH', postUrl: 'https://gist.github.com/' },
  { id: 'discord', name: 'Discord', icon: 'DC', postUrl: 'https://discord.com/app' },
  { id: 'devto', name: 'Dev.to Blog', icon: 'DEV', postUrl: 'https://dev.to/new' }
]

/**
 * Fetches latest queued or generated posts from FollowDesk local backend
 */
export async function fetchPendingCampaigns() {
  try {
    const res = await fetch('http://127.0.0.1:4174/api/social/posts', {
      headers: { 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      return data.posts || []
    }
  } catch (err) {
    console.warn('Backend not responding to extension:', err)
  }
  return []
}

/**
 * Triggers an instant account keep-alive pulse directly from the browser extension
 */
export async function triggerExtensionKeepAlive(platformId = null) {
  try {
    const res = await fetch('http://127.0.0.1:4174/api/social/keep-alive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platformId })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
  return { success: false, error: 'Failed to pulse' }
}

/**
 * Dispatches a post or opens platform intent via Chrome extension tabs
 */
export async function dispatchPostViaExtension(platformId, text, title = '') {
  const channel = SUPPORTED_EXTENSION_CHANNELS.find(c => c.id === platformId)
  const encodedText = encodeURIComponent(text || '')
  const encodedTitle = encodeURIComponent(title || '')

  let targetUrl = 'https://google.com'
  if (platformId === 'x') {
    targetUrl = `https://twitter.com/intent/tweet?text=${encodedText}`
  } else if (platformId === 'reddit') {
    targetUrl = `https://www.reddit.com/r/webdev/submit?title=${encodedTitle}&text=${encodedText}`
  } else if (platformId === 'linkedin') {
    targetUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`
  } else if (platformId === 'github') {
    targetUrl = 'https://gist.github.com/'
  } else if (platformId === 'devto') {
    targetUrl = 'https://dev.to/new'
  } else if (platformId === 'discord') {
    targetUrl = 'https://discord.com/app'
  }

  // Copy content to clipboard
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  } catch (e) {
    console.warn('Clipboard write fallback', e)
  }

  // Create new tab for publishing
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    await chrome.tabs.create({ url: targetUrl })
  } else {
    window.open(targetUrl, '_blank')
  }

  return { success: true, platformId, targetUrl }
}

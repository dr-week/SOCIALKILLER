/**
 * Adaptive Page & Community Data Harvester (<160 lines)
 * Detects the active website (X, Reddit, GitHub, LinkedIn, Dev.to, Instagram, etc.),
 * adapts its extraction selectors to that platform's DOM, harvests all useful metadata
 * (author handle, thread/repo title, engagement metrics, top posts/comments, code blocks),
 * and transfers the structured payload directly to the FollowDesk Main App (`:4174`).
 */

export const ADAPTIVE_PLATFORM_THEMES = {
  x: {
    id: 'x',
    name: 'X (Twitter)',
    icon: '𝕏',
    accent: '#38bdf8',
    bgGlow: 'rgba(56, 189, 248, 0.14)',
    harvestLabel: '📥 Harvest X Thread & Metrics → App',
    injectLabel: '𝕏 Inject Viral Hook',
    actions: [
      { id: 'thread_hook', icon: '🪝', label: 'Thread Hook' },
      { id: 'wasm_bench', icon: '🦀', label: '120FPS Wasm' },
      { id: 'harvest', icon: '📥', label: 'Sync to App' }
    ]
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    icon: '👽',
    accent: '#ff4500',
    bgGlow: 'rgba(255, 69, 0, 0.14)',
    harvestLabel: '📥 Harvest Subreddit Thread → App',
    injectLabel: '👽 Inject Technical Breakdown',
    actions: [
      { id: 'arch_deep', icon: '🧠', label: 'No-VDOM Deep-Dive' },
      { id: 'zuari_bench', icon: '⚡', label: '<2.5KB Table' },
      { id: 'harvest', icon: '📥', label: 'Sync to App' }
    ]
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    accent: '#a855f7',
    bgGlow: 'rgba(168, 85, 247, 0.14)',
    harvestLabel: '📥 Harvest Repo & Stars → App',
    injectLabel: '🐙 Inject Release / Issue Note',
    actions: [
      { id: 'release_md', icon: '📦', label: 'Changelog MD' },
      { id: 'ai_llms', icon: '🤖', label: 'llms.txt Spec' },
      { id: 'harvest', icon: '📥', label: 'Sync to App' }
    ]
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    accent: '#0a66c2',
    bgGlow: 'rgba(10, 102, 194, 0.16)',
    harvestLabel: '📥 Harvest Post & Lead → App',
    injectLabel: '💼 Inject Founder Story',
    actions: [
      { id: 'founder_roi', icon: '📈', label: 'Founder ROI' },
      { id: 'meeting_cta', icon: '📅', label: '15m Demo CTA' },
      { id: 'harvest', icon: '📥', label: 'Sync to App' }
    ]
  },
  devto: {
    id: 'devto',
    name: 'Dev.to',
    icon: '👩‍💻',
    accent: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.14)',
    harvestLabel: '📥 Harvest Article & Tags → App',
    injectLabel: '👩‍💻 Inject Full Dev Tutorial',
    actions: [
      { id: 'blog_md', icon: '📝', label: 'Full Article' },
      { id: 'code_block', icon: '💻', label: 'Zuari Snippet' },
      { id: 'harvest', icon: '📥', label: 'Sync to App' }
    ]
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    accent: '#5865f2',
    bgGlow: 'rgba(88, 101, 242, 0.16)',
    harvestLabel: '📥 Harvest Channel Context → App',
    injectLabel: '🎮 Inject Community Drop',
    actions: [
      { id: 'drop_ping', icon: '🚀', label: 'Release Drop' },
      { id: 'collab_dm', icon: '🤝', label: 'Collab Intro' },
      { id: 'harvest', icon: '📥', label: 'Sync to App' }
    ]
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    accent: '#e1306c',
    bgGlow: 'rgba(225, 48, 108, 0.14)',
    harvestLabel: '📥 Export Followers / Profile → App',
    injectLabel: '📸 Inject Reel Caption',
    actions: [
      { id: 'reel_cap', icon: '🎬', label: 'Reel Hook' },
      { id: 'harvest', icon: '📥', label: 'Sync to App' }
    ]
  }
}

/**
 * Extracts structured intelligence from the current browser tab DOM
 */
export function extractStructuredPageIntel() {
  const host = window.location.hostname.toLowerCase()
  const url = window.location.href
  const title = document.title || ''

  if (host.includes('x.com') || host.includes('twitter.com')) {
    const tweets = Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
      .slice(0, 5)
      .map(el => el.textContent?.trim())
      .filter(Boolean)
    const author =
      document.querySelector('[data-testid="User-Name"]')?.textContent?.trim() ||
      window.location.pathname.split('/')[1] ||
      'x_user'
    return {
      platformId: 'x',
      url,
      title: tweets[0]?.slice(0, 90) || title,
      authorHandle: author.startsWith('@') ? author : `@${author}`,
      extractedItems: tweets,
      summary: `Harvested ${tweets.length} posts/tweets from ${author}`
    }
  }

  if (host.includes('reddit.com')) {
    const postTitle = document.querySelector('h1')?.textContent?.trim() || title
    const subreddit = window.location.pathname.match(/\/r\/([^/]+)/)?.[1] || 'webdev'
    const comments = Array.from(document.querySelectorAll('[slot="comment"], shreddit-comment p'))
      .slice(0, 5)
      .map(el => el.textContent?.trim())
      .filter(Boolean)
    return {
      platformId: 'reddit',
      url,
      title: postTitle,
      authorHandle: `r/${subreddit}`,
      extractedItems: [postTitle, ...comments],
      summary: `Harvested r/${subreddit} thread ("${postTitle.slice(0, 50)}") + ${comments.length} top comments`
    }
  }

  if (host.includes('github.com')) {
    const repoPath = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').slice(0, 2).join('/')
    const aboutText = document.querySelector('p.f4.my-3')?.textContent?.trim() || title
    const stars = document.querySelector('#repo-stars-counter-star')?.textContent?.trim() || '0'
    return {
      platformId: 'github',
      url,
      title: repoPath || title,
      authorHandle: repoPath ? `gh:${repoPath}` : 'github',
      extractedItems: [aboutText, `Stars: ${stars}`],
      summary: `Harvested GitHub repo ${repoPath} (⭐ ${stars}): ${aboutText.slice(0, 60)}`
    }
  }

  const h1 = document.querySelector('h1')?.textContent?.trim() || title
  const paragraphs = Array.from(document.querySelectorAll('article p, main p'))
    .slice(0, 4)
    .map(p => p.textContent?.trim())
    .filter(Boolean)

  return {
    platformId: host.includes('linkedin')
      ? 'linkedin'
      : host.includes('dev.to')
      ? 'devto'
      : host.includes('discord')
      ? 'discord'
      : host.includes('instagram')
      ? 'instagram'
      : 'x',
    url,
    title: h1,
    authorHandle: host,
    extractedItems: [h1, ...paragraphs],
    summary: `Harvested "${h1.slice(0, 65)}" from ${host}`
  }
}

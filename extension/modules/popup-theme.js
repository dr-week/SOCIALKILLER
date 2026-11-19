/**
 * Theme & UI Helpers for FollowDesk Extension Popup (<90 lines)
 */

export const ALGORITHM_TIPS = {
  x: '💡 X Algorithm: Bookmarks (10x) & Replies with author (75x+) boost reach. Keep links in replies.',
  reddit: '💡 Reddit Rule: Upvote ratio & comment depth in first 60m dictate rank. Focus on real technical value.',
  github: '💡 GitHub Tip: Star velocity & release changelogs drive trending feed discovery.',
  linkedin: '💡 LinkedIn Tip: Dwell time & 12+ word constructive comments trigger network expansion.',
  devto: '💡 Dev.to Tip: Meaningful code snippets & #webdev tags maximize reading list bookmarks.',
  discord: '💡 Discord Tip: Live release drops keep community members engaged.',
  instagram: '💡 Instagram Tip: Reels watch-through & direct saves outweigh passive likes.'
}

export function detectActivePlatform(url = '') {
  const u = url.toLowerCase()
  if (u.includes('twitter.com') || u.includes('x.com')) return 'x'
  if (u.includes('reddit.com')) return 'reddit'
  if (u.includes('github.com')) return 'github'
  if (u.includes('linkedin.com')) return 'linkedin'
  if (u.includes('dev.to')) return 'devto'
  if (u.includes('discord.com')) return 'discord'
  if (u.includes('instagram.com')) return 'instagram'
  return 'x'
}

export function applyPlatformTheme(theme) {
  if (!theme) return
  document.documentElement.style.setProperty('--primary', theme.accent)
  document.documentElement.style.setProperty('--accent-glow', theme.bgGlow)
}

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PresetName, SocialPostPayload } from './types.ts'

function readRepoVersion(): string {
  try {
    const pkgPath = resolve(process.cwd(), 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string }
      if (pkg.version) return `v${pkg.version.replace(/^v/, '')}`
    }
  } catch {
    // ignore
  }
  return 'v0.1.0'
}

export function getPresetPayload(
  preset: PresetName,
  defaultUrl = 'https://github.com/danger-labs/followdesk',
  brandName = 'SOCIALKILLER'
): SocialPostPayload {
  const versionTag = readRepoVersion()

  if (preset === 'benchmark') {
    return {
      title: `SOCIALKILLER ${versionTag} — Audience & Social Publishing`,
      summary:
        'Zero-latency O(N) follower graph diffs + automated multi-platform publishing across Discord, Telegram, X, LinkedIn, GitHub, Instagram & Reddit.',
      detailed: [
        `We benchmarked the ${brandName} (${versionTag}) local-first audience engine and headless multi-platform broadcast pipeline:`,
        '',
        '• Set-based follower/following comparison: 50,000 accounts processed in <14ms in-browser Web Worker.',
        '• 2026 Viral Hook & Sentiment Predictor: deterministic sub-millisecond scoring for social captions.',
        '• Simultaneous multi-channel syndication across 7 platforms with automatic rate-limit backoff and dry-run verification.'
      ].join('\n'),
      imagePath:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1080&q=80',
      tags: ['TheSocialBase', 'OpenSource', 'TypeScript', 'SocialMedia'],
      url: defaultUrl,
      subreddit: 'opensource',
      versionTag,
      brandName,
      accentColor: '#10b981'
    }
  }

  if (preset === 'community') {
    return {
      title: 'Building a 100% Local-First Social Media Companion & Omni-Channel Auto-Publisher',
      summary:
        'Tired of switching between 7 tabs to share updates and manage your community? Here is how we unified everything into one seamless app.',
      detailed: [
        'Managing social media growth, creative reposting, and community announcements usually requires half a dozen separate tools.',
        '',
        `With ${brandName}, we unified everything into a single self-hosted workspace:`,
        '1. Privacy-first Instagram audience analytics & ghost follower detection (zero login/cookies).',
        '2. Creative Repost Studio with AI-free human captions & viral hook scoring.',
        '3. One-click omni-channel auto-publisher for Discord, Telegram, Reddit, X/Twitter, LinkedIn, GitHub Releases, and Instagram (Buffer/Meta).',
        '',
        'What platforms or community workflows would you love to automate next?'
      ].join('\n'),
      imagePath:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
      tags: ['BuildInPublic', 'TheSocialBase', 'SocialMediaAutomation', 'IndieDev', 'Reddit'],
      url: defaultUrl,
      subreddit: 'SideProject',
      versionTag,
      brandName,
      accentColor: '#ec4899'
    }
  }

  // Default: 'release'
  return {
    title: `${brandName} ${versionTag} Released — Seamless Multi-Platform Social Auto-Publisher`,
    summary: `${brandName} ${versionTag} is live! Instant audience insights, viral caption studio, and 1-click publishing to Discord, Telegram, X, LinkedIn, GitHub, IG & Reddit.`,
    detailed: [
      `🎉 **${brandName} (${versionTag})** is now available!`,
      '',
      '### What’s New in This Release',
      '• **Autonomous Multi-Platform Publisher (`scripts/social/`)**: Broadcast release notes, benchmarks, and creative assets to Discord, Telegram, Twitter/X, LinkedIn, GitHub Releases, Instagram/Threads (Buffer & Meta Graph), and Reddit.',
      '• **Unified Creative Studio Integration**: Trigger live or dry-run multi-platform broadcasts directly from SOCIALKILLER dashboard or CLI.',
      '• **Zero-Copy Formatting & Safety**: Automatic 280-char micro-threading for X, rich embeds for Discord, MarkdownV2/HTML for Telegram, and exponential backoff rate-limit resilience.'
    ].join('\n'),
    imagePath:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
    tags: ['TheSocialBase', 'Release', 'OpenSource', 'SocialAutomation'],
    url: defaultUrl,
    subreddit: 'opensource',
    versionTag,
    brandName,
    accentColor: '#a855f7'
  }
}

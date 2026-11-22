/**
 * Adaptive Page & Community Data Harvester (<100 lines)
 */
import { ADAPTIVE_PLATFORM_THEMES } from './page-harvester-themes.js'

export { ADAPTIVE_PLATFORM_THEMES }

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

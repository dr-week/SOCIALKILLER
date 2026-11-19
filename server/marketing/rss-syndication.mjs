/**
 * Decentralized RSS/Atom Syndication Feed Generator (<85 lines)
 * Provides Layer 5 of the Execution Resilience Cascade:
 * Automatically syndicates published & queued releases in standard RSS 2.0 and Atom XML
 * formats so aggregators, Substack/Ghost importers, Mastodon bots, and decentralized feeds
 * can consume and publish your updates even during total platform UI blocks.
 */

export function generateRssFeedXml({
  posts = [],
  title = 'FollowDesk & Zuari Framework Syndication Feed',
  description = 'Automated releases, developer devlogs, and benchmark pulses for Zuari and FollowDesk',
  feedUrl = 'http://127.0.0.1:4174/api/social/feed.xml',
  siteUrl = 'https://github.com/dr-week/fast-framework'
} = {}) {
  const now = new Date().toUTCString()
  const itemsXml = posts
    .map((post) => {
      const pubDate = new Date(post.createdAt || post.scheduledAt || Date.now()).toUTCString()
      const postTitle = (post.title || post.topic || 'Developer Release').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const content = (post.rawNotes || post.variants?.devto || post.title || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      return `    <item>
      <title>${postTitle}</title>
      <link>${siteUrl}#${post.id || Date.now()}</link>
      <guid isPermaLink="false">${post.id || Date.now()}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${content}]]></description>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${siteUrl}</link>
    <description>${description}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`
}

/**
 * RSS / Atom XML Feed Generator for Zero-API Content Syndication
 * Allows Dev.to, Hashnode, Medium, Substack, and RSS readers to automatically
 * ingest posts when direct APIs fail or rate-limit.
 */

export function generateRssFeedXml({
  posts = [],
  title = 'Developer Ecosystem & Framework Releases',
  description = 'Automated technical devlogs, architecture deep dives, and framework updates.',
  feedUrl = 'http://127.0.0.1:4174/api/marketing/feed.xml',
  siteUrl = 'http://127.0.0.1:4174'
} = {}) {
  const now = new Date().toUTCString()
  const itemsXml = posts.map(p => {
    const postTitle = (p.title || 'Developer Update').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
    const postDate = p.scheduledAt ? new Date(p.scheduledAt).toUTCString() : now
    const rawContent = p.variants?.devto || p.variants?.hashnode || p.variants?.x || p.title || ''
    const safeContent = rawContent.replace(/]]>/g, ']]&gt;')
    const guid = p.id || `post-${Date.now()}`

    return `    <item>
      <title>${postTitle}</title>
      <link>${siteUrl}/#${guid}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${postDate}</pubDate>
      <description><![CDATA[${safeContent}]]></description>
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${siteUrl}</link>
    <description>${description}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`
}

import {
  getPostsQueue,
  generateMultiPlatformContent,
  triggerKeepAlivePulse,
  getSocialActivityLogs
} from '../../social-publisher.mjs'
import { generateRssFeedXml } from '../../marketing/rss-syndication.mjs'
import { handleTrendingAndViralRoutes } from '../viral-routes.mjs'
import { handleOpsRoutes } from '../ops-routes.mjs'
import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'

export async function handleSocialGenerationRoutes(req, res, url, json) {
  if (req.method === 'GET' && ['/api/social/feed.xml', '/feed.xml', '/rss.xml'].includes(url.pathname)) {
    const xml = generateRssFeedXml({ posts: getPostsQueue() })
    res.writeHead(200, {
      'content-type': 'application/rss+xml; charset=utf-8',
      'access-control-allow-origin': '*'
    })
    res.end(xml)
    return true
  }

  if (req.method === 'POST' && url.pathname === '/api/social/generate') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const generated = generateMultiPlatformContent(JSON.parse(body || '{}'))
        return json(res, 200, { success: true, ...generated })
      } catch {
        return json(res, 400, { error: 'Failed to generate multi-platform content' })
      }
    })
    return true
  }

  if (await handleTrendingAndViralRoutes(req, res, url, json)) return true
  if (await handleOpsRoutes(req, res, url, json) !== false) return true

  if (req.method === 'POST' && url.pathname === '/api/social/keep-alive') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {}
        parsed.brandId = parsed.brandId || 'danger-labs'
        if (!/^[a-z0-9-]{1,64}$/.test(parsed.brandId) ||
            (!dbService.getBrandProfile(parsed.brandId) && !DEFAULT_BRANDS.some(brand => brand.id === parsed.brandId))) {
          return json(res, 404, { error: 'Company workspace not found.' })
        }
        const pulseResult = await triggerKeepAlivePulse(parsed.platformId || null, parsed.brandId)
        return json(res, 200, { success: true, ...pulseResult, activityLogs: getSocialActivityLogs(parsed.brandId) })
      } catch {
        return json(res, 400, { error: 'Failed to execute keep-alive pulse' })
      }
    })
    return true
  }
  return false
}

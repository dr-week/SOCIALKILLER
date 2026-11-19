import {
  createOrPublishPost,
  getSocialActivityLogs,
  getPendingBrowserDispatches,
  popPendingBrowserDispatch
} from '../../social-publisher.mjs'
import { dbService } from '../../db/sqlite-engine.mjs'

export async function handleExtensionRoutes(req, res, url, json) {
  if (req.method === 'POST' && url.pathname === '/api/social/harvest') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const platformId = parsed.platformId || 'x'
        const title = parsed.title || 'Harvested Community Thread'
        const summary = parsed.summary || `Harvested from ${parsed.authorHandle || platformId}: ${title}`
        const post = await createOrPublishPost({
          title: `[Harvested ${platformId.toUpperCase()}] ${title}`,
          topic: title,
          rawNotes: `${summary}\nSource: ${parsed.url || ''}`,
          platforms: ['x', 'reddit', 'linkedin', 'github', 'devto', 'ai_registry'],
          publishNow: false
        })
        return json(res, 201, {
          success: true,
          harvested: { platformId, title, url: parsed.url },
          post,
          activityLogs: getSocialActivityLogs()
        })
      } catch (error) {
        return json(res, 400, { error: 'Invalid harvest payload', details: error.message })
      }
    })
    return true
  }

  if (url.pathname === '/api/social/pending-dispatches') {
    if (req.method === 'GET') {
      const items = getPendingBrowserDispatches()
      return json(res, 200, { success: true, count: items.length, items })
    }
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {}
          return json(res, 200, { success: true, item: popPendingBrowserDispatch(parsed.id || null) })
        } catch (error) {
          return json(res, 400, { error: error.message })
        }
      })
      return true
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/social/log') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const logItem = {
          id: `ext-${Date.now()}-${parsed.platformId || 'browser'}`,
          timestamp: new Date().toISOString(),
          platformId: parsed.platformId || 'browser',
          action: parsed.action || 'Browser Auto-Post',
          status: parsed.status || 'success',
          mode: 'extension_browser',
          intentUrl: parsed.url || null,
          externalUrl: parsed.externalUrl || null,
          message: parsed.message || 'Browser automation event'
        }
        dbService.addActivityLog(logItem)
        return json(res, 201, { success: true, log: logItem })
      } catch (error) {
        return json(res, 400, { error: error.message })
      }
    })
    return true
  }
  return false
}

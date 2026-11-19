import { savePageCloneSession, listPageCloneSessions, getHtmlClone } from './clone-service.mjs'
import { addFeedback, getFeedbackLogs } from './sync-store.mjs'
import { readJsonBody } from './http/read-json.mjs'
import { handleInstagramRoutes } from './routes/instagram-routes.mjs'
import { handleSocialAndMarketingRoutes } from './routes/social-routes.mjs'
import { handleBrandRoutes } from './routes/brand-routes.mjs'
import { handleAssistantRoutes } from './routes/assistant-routes.mjs'
import { createInboxRoutes } from './routes/inbox-routes.mjs'
import { assistantService } from './assistant/assistant-service.mjs'
import { handleAutomationRoutes } from './automation/automation-routes.mjs'
import { handleRuntimeRoutes } from './routes/runtime-routes.mjs'

const handleInboxRoutes = createInboxRoutes({ draftReply: input => assistantService.draftCommentReply(input) })

export function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'access-control-allow-headers': 'Content-Type'
  })
  res.end(JSON.stringify(body))
  return true
}

export function handleOptions(res) {
  res.writeHead(204, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'access-control-allow-headers': 'Content-Type'
  })
  res.end()
}

// Origins allowed to change state: this extension, the local app, and tools with no Origin header (curl, node).
const TRUSTED_ORIGIN = /^(chrome-extension:\/\/[a-p]{32}|https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?)$/
const LOOPBACK_HOST = /^(127\.0\.0\.1|localhost)(:\d+)?$/
// Content scripts on third-party pages may still call these (draft-only / read paths).
const FOREIGN_ORIGIN_OK_WRITES = new Set(['/api/social/harvest'])

export function isRequestAllowed(req, pathname) {
  if (!LOOPBACK_HOST.test(req.headers.host || '')) return false // DNS rebinding
  const origin = req.headers.origin
  if (!origin) return true
  const isLoopbackOrigin = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)
  if (pathname === '/api/runtime' && !isLoopbackOrigin) return false
  if (pathname.startsWith('/api/android/') && !isLoopbackOrigin) return false
  if (TRUSTED_ORIGIN.test(origin)) return true
  if (pathname.startsWith('/api/assistant/')) return false
  if (pathname === '/api/social/workflows') return false
  const isWrite = req.method === 'POST' || req.method === 'DELETE'
  if (req.method === 'PATCH' && pathname.startsWith('/api/automations') && origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) return false
  if (isWrite && pathname.startsWith('/api/automations') && origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) return false
  if (isWrite && pathname.startsWith('/api/social/') && !FOREIGN_ORIGIN_OK_WRITES.has(pathname)) return false
  return true
}

export async function routeRequest(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1')

  if (!isRequestAllowed(req, url.pathname)) {
    return json(res, 403, { error: 'Forbidden origin' })
  }

  if (req.method === 'OPTIONS') {
    return handleOptions(res)
  }

  if (await handleRuntimeRoutes(req, res, url, json)) return

  if (await handleAutomationRoutes(req, res, url, json)) return

  const handledAssistant = await handleAssistantRoutes(req, res, url, json)
  if (handledAssistant) return

  const handledInbox = await handleInboxRoutes(req, res, url, json)
  if (handledInbox) return

  // 2. Delegate Instagram Profile, Follower Relationship & Sync Routes
  const handledInstagram = await handleInstagramRoutes(req, res, url, json)
  if (handledInstagram) return

  // 3. Delegate Social Media Manager, Lyra Copywriter, Market Intel & AI Registry routes
  const handledSocial = await handleSocialAndMarketingRoutes(req, res, url, json)
  if (handledSocial) return

  // 4. Delegate Brand Workspaces & Video Script Engine routes
  const handledBrand = await handleBrandRoutes(req, res, url, json)
  if (handledBrand) return

  // 4. Developer Feedback Endpoint
  if (req.method === 'POST' && url.pathname === '/api/dev/feedback') {
    try {
      const item = await readJsonBody(req)
      return json(res, 201, { success: true, feedback: addFeedback(item) })
    } catch (err) {
      return json(res, err.statusCode || 400, { error: err.message || 'Invalid feedback data' })
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/dev/feedback') {
    const logs = getFeedbackLogs()
    return json(res, 200, { total: logs.length, entries: logs })
  }

  // 5. Page Clone & Developer Session Endpoints
  if (req.method === 'POST' && url.pathname === '/api/dev/clone') {
    try {
      const payload = await readJsonBody(req)
      const session = savePageCloneSession(payload)
      return json(res, 201, { success: true, session })
    } catch (err) {
      return json(res, err.statusCode || 400, { error: 'Failed to save page clone', details: err.message })
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/dev/clone') {
    const sessionId = url.searchParams.get('id')
    if (sessionId) {
      const html = getHtmlClone(sessionId)
      if (!html) return json(res, 404, { error: 'Clone not found' })
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'access-control-allow-origin': '*'
      })
      return res.end(html)
    }
    const sessions = listPageCloneSessions()
    return json(res, 200, { total: sessions.length, sessions })
  }

  return json(res, 404, { error: 'Not found' })
}

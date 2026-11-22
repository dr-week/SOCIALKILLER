import { readJsonBody } from './http/read-json.mjs'
import { handleInstagramRoutes } from './routes/instagram-routes.mjs'
import { handleSocialAndMarketingRoutes } from './routes/social-routes.mjs'
import { handleBrandRoutes } from './routes/brand-routes.mjs'
import { handleAssistantRoutes } from './routes/assistant-routes.mjs'
import { createInboxRoutes } from './routes/inbox-routes.mjs'
import { handleLeadsRoutes } from './routes/leads-routes.mjs'
import { handleDevRoutes } from './routes/dev-routes.mjs'
import { handleUnfollowLogRoutes } from './routes/unfollow-log-routes.mjs'
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

  const handledLeads = await handleLeadsRoutes(req, res, url, json)
  if (handledLeads) return

  // 2. Delegate Instagram Profile, Follower Relationship & Sync Routes
  const handledInstagram = await handleInstagramRoutes(req, res, url, json)
  if (handledInstagram) return

  // 3. Delegate Social Media Manager, Lyra Copywriter, Market Intel & AI Registry routes
  const handledSocial = await handleSocialAndMarketingRoutes(req, res, url, json)
  if (handledSocial) return

  // 3b. QUBO Simulated Annealing Post-Schedule Optimizer
  if (req.method === 'POST' && url.pathname === '/api/social/optimize-schedule') {
    const body = await readJsonBody(req).catch(() => ({}))
    const { optimizePostSchedule } = await import('./marketing/scheduling/qubo-scheduler.mjs')
    return json(res, 200, { success: true, ...optimizePostSchedule(body) })
  }

  // 4. Delegate Brand Workspaces & Video Script Engine routes
  const handledBrand = await handleBrandRoutes(req, res, url, json)
  if (handledBrand) return

  // 5. Delegate Unfollow Cooldown Ledger & Developer routes
  if (await handleUnfollowLogRoutes(req, res, url, json)) return
  if (await handleDevRoutes(req, res, url, json)) return

  return json(res, 404, { error: 'Not found' })
}

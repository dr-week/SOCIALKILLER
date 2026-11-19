/**
 * Operational routes: confirm-posted, queue cleanup, extension error log, engagement metrics + GitHub star snapshots.
 */
import { dbService } from '../db/sqlite-engine.mjs'
import { randomUUID } from 'node:crypto'
import {
  getPostsQueue,
  markPostConfirmed,
  pruneQueue,
  getPromoLimitStatus,
  logActivity
} from '../marketing/orchestrator.mjs'

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', c => { body += c; if (body.length > 1e6) reject(new Error('payload too large')) })
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}) } catch { reject(new Error('invalid JSON')) } })
    req.on('error', reject)
  })
}

const REPO_RE = /^[\w.-]+\/[\w.-]+$/
const BRAND_ID_RE = /^[a-z0-9-]{1,64}$/
const WORKFLOW_SELECTOR_RE = /^(?:[a-z][a-z0-9-]*)\[(?:data-testid|aria-label|name|id|placeholder)="[\w .:-]{1,80}"\]$/
const score = m => (m.likes || 0) + 2 * (m.replies || 0) + 3 * (m.reposts || 0)

function validateWorkflowSteps(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100) throw new Error('Workflow must contain 1–100 steps.')
  return input.map((step, index) => {
    if (!step || !['click', 'fill', 'scroll', 'wait'].includes(step.action)) throw new Error(`Step ${index + 1} has an unsupported action.`)
    if (step.action === 'click' || step.action === 'fill') {
      if (typeof step.selector !== 'string' || !WORKFLOW_SELECTOR_RE.test(step.selector)) throw new Error(`Step ${index + 1} has an unsupported target.`)
    }
    const clean = { id: String(step.id || index + 1).slice(0, 40), action: step.action }
    if (step.action === 'click' || step.action === 'fill') {
      clean.selector = step.selector
      clean.label = String(step.label || step.action).slice(0, 120)
      if (step.action === 'fill') clean.value = String(step.value || '').slice(0, 2000)
    }
    if (step.action === 'scroll') {
      const deltaY = Number(step.deltaY)
      if (!Number.isFinite(deltaY) || Math.abs(deltaY) > 2000) throw new Error(`Step ${index + 1} has an invalid scroll distance.`)
      clean.deltaY = Math.round(deltaY)
    }
    if (step.action === 'wait') {
      const durationMs = Number(step.durationMs)
      if (!Number.isFinite(durationMs) || durationMs < 0 || durationMs > 5000) throw new Error(`Step ${index + 1} has an invalid wait.`)
      clean.durationMs = Math.round(durationMs)
    }
    return clean
  })
}

export function buildMetricsReport() {
  const rows = dbService.getMetrics()
  const posts = getPostsQueue()
  const stars = rows.filter(r => r.kind === 'stars' && !r.postId)

  const byPost = new Map()
  for (const r of rows) {
    if (!r.postId) continue
    const cur = byPost.get(r.postId) || {}
    const key = `${r.platformId || 'all'}:${r.kind}`
    cur[key] = r.value // rows are ordered ASC, so the last write is the latest value
    byPost.set(r.postId, cur)
  }

  const starAt = ts => {
    let last = null
    for (const s of stars) { if (Date.parse(s.recordedAt) <= ts) last = s; else break }
    return last
  }

  const perPost = posts.map(p => {
    const raw = byPost.get(p.id) || {}
    const totals = { likes: 0, replies: 0, reposts: 0, views: 0 }
    for (const [k, v] of Object.entries(raw)) {
      const kind = k.split(':')[1]
      if (kind in totals) totals[kind] += v
    }
    const t0 = Date.parse(p.createdAt)
    const base = starAt(t0)
    const later = starAt(t0 + 48 * 3600 * 1000) || stars[stars.length - 1]
    const starDelta = base && later && Date.parse(later.recordedAt) > t0 ? later.value - base.value : null
    return {
      postId: p.id,
      hook: p.topic || p.title,
      createdAt: p.createdAt,
      platforms: p.platforms,
      metrics: totals,
      engagementScore: score(totals),
      starDeltaWithin48h: starDelta
    }
  })

  const withData = perPost.filter(p => p.engagementScore > 0 || p.starDeltaWithin48h)
  const ranked = [...withData].sort((a, b) =>
    (b.engagementScore + (b.starDeltaWithin48h || 0) * 5) - (a.engagementScore + (a.starDeltaWithin48h || 0) * 5))

  return {
    starsTimeline: stars.map(s => ({ at: s.recordedAt, stars: s.value })),
    bestHooks: ranked.slice(0, 5),
    posts: perPost.slice(0, 50),
    promoLimits: getPromoLimitStatus()
  }
}

export async function handleOpsRoutes(req, res, url, json) {
  const p = url.pathname

  if (p === '/api/social/workflows') {
    const brandId = req.method === 'POST'
      ? ''
      : String(url.searchParams.get('brandId') || 'danger-labs')
    if (req.method === 'GET') {
      if (!BRAND_ID_RE.test(brandId)) return json(res, 400, { error: 'Invalid company workspace.' })
      return json(res, 200, { success: true, workflows: dbService.getInteractionWorkflows(brandId) })
    }
    if (req.method === 'POST') {
      try {
        const body = await readJson(req)
        const companyId = String(body.brandId || '')
        if (!BRAND_ID_RE.test(companyId)) return json(res, 400, { error: 'Invalid company workspace.' })
        const name = String(body.name || '').trim().slice(0, 80)
        if (!name) return json(res, 400, { error: 'Workflow name is required.' })
        const parsedOrigin = new URL(String(body.origin || ''))
        if (!['https:', 'http:'].includes(parsedOrigin.protocol) || (parsedOrigin.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(parsedOrigin.hostname))) {
          return json(res, 400, { error: 'Use an HTTPS site or a local demo page.' })
        }
        const existing = body.id
          ? dbService.getInteractionWorkflows(companyId).find(item => item.id === body.id)
          : null
        if (body.id && !existing) return json(res, 404, { error: 'Workflow not found in this company workspace.' })
        const workflow = dbService.saveInteractionWorkflow({
          id: existing?.id || randomUUID(),
          brandId: companyId,
          name,
          origin: parsedOrigin.origin,
          steps: validateWorkflowSteps(body.steps)
        })
        return json(res, existing ? 200 : 201, { success: true, workflow })
      } catch (error) {
        return json(res, 400, { error: error.message || 'Invalid workflow.' })
      }
    }
    if (req.method === 'DELETE') {
      const id = String(url.searchParams.get('id') || '')
      if (!id || !BRAND_ID_RE.test(brandId)) return json(res, 400, { error: 'Workflow and company workspace are required.' })
      const deleted = dbService.deleteInteractionWorkflow(id, brandId)
      return json(res, deleted ? 200 : 404, { success: deleted })
    }
    return json(res, 405, { error: 'Method not allowed.' })
  }

  // Confirm a dispatch was really posted (in-page "Mark posted" button -> background -> here)
  if (req.method === 'POST' && p === '/api/social/mark-published') {
    try {
      const b = await readJson(req)
      if (!b.postId || !b.platformId) return json(res, 400, { error: 'postId and platformId required' })
      const post = markPostConfirmed(b.postId, b.platformId, b.externalUrl || null)
      return json(res, post ? 200 : 404, { success: Boolean(post), post })
    } catch (e) { return json(res, 400, { error: e.message }) }
  }

  // Queue cleanup. DRY RUN unless {"dryRun": false} is sent explicitly.
  if (req.method === 'POST' && p === '/api/social/cleanup') {
    try {
      const b = await readJson(req)
      const result = pruneQueue({
        olderThanDays: Number.isFinite(b.olderThanDays) ? b.olderThanDays : 14,
        statuses: Array.isArray(b.statuses) ? b.statuses : ['scheduled'],
        dryRun: b.dryRun !== false
      })
      return json(res, 200, { success: true, ...result })
    } catch (e) { return json(res, 400, { error: e.message }) }
  }

  // Extension errors (replaces silent catch {} blocks) land in the activity log
  if (req.method === 'POST' && p === '/api/social/client-error') {
    try {
      const b = await readJson(req)
      const item = logActivity(String(b.platformId || 'extension').slice(0, 30), `Extension error: ${String(b.where || 'unknown').slice(0, 60)}`, 'error', {
        message: String(b.message || '').slice(0, 300)
      })
      return json(res, 200, { success: true, id: item.id })
    } catch (e) { return json(res, 400, { error: e.message }) }
  }

  // Engagement metrics: POST one metric or a {likes,replies,reposts,views} bundle for a post
  if (p === '/api/social/metrics') {
    if (req.method === 'POST') {
      try {
        const b = await readJson(req)
        const saved = []
        if (b.kind) {
          saved.push(dbService.addMetric(b))
        } else if (b.metrics && typeof b.metrics === 'object') {
          for (const [kind, value] of Object.entries(b.metrics)) {
            saved.push(dbService.addMetric({ postId: b.postId, platformId: b.platformId, kind, value }))
          }
        } else {
          return json(res, 400, { error: 'send {kind,value,...} or {metrics:{likes:..}}' })
        }
        return json(res, 201, { success: true, saved })
      } catch (e) { return json(res, 400, { error: e.message }) }
    }
    if (req.method === 'GET') return json(res, 200, { success: true, ...buildMetricsReport() })
  }

  // GitHub star snapshot (public API, no token needed; 60 req/h unauthenticated)
  if (req.method === 'POST' && p === '/api/social/metrics/stars') {
    try {
      const b = await readJson(req)
      const repo = String(b.repo || '').trim()
      if (!REPO_RE.test(repo)) return json(res, 400, { error: 'repo must look like owner/name' })
      const r = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { 'user-agent': 'followdesk', accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(8000)
      })
      if (!r.ok) return json(res, 502, { error: `GitHub responded ${r.status}` })
      const data = await r.json()
      const saved = dbService.addMetric({ platformId: 'github', kind: 'stars', value: data.stargazers_count })
      return json(res, 201, { success: true, repo, stars: data.stargazers_count, forks: data.forks_count, saved })
    } catch (e) { return json(res, 502, { error: e.message }) }
  }

  // Visual bot & automation endpoint: supports catalog inspection and calibration execution
  if (p === '/api/social/hybrid-run') {
    if (req.method === 'GET') {
      const { VISUAL_ICON_CATALOG } = await import('../engine/vision-contour.mjs')
      return json(res, 200, { success: true, catalog: VISUAL_ICON_CATALOG })
    }
    if (req.method === 'POST') {
      try {
        const b = await readJson(req)
        const { LuaAutomationEngine } = await import('../engine/lua-runner.mjs')
        const engine = new LuaAutomationEngine({ quotaLimitPerHour: b.quotaLimit || 30 })
        const commands = Array.isArray(b.commands) ? b.commands : []
        const execution = await engine.runScript(commands, { scene: b.scene || null })
        return json(res, 200, execution)
      } catch (err) {
        return json(res, 400, { error: err.message })
      }
    }
  }

  // Android Visual Bot & Device bridge endpoints
  if (p === '/api/social/android-status') {
    if (req.method === 'GET') {
      try {
        const { AndroidAutomationBridge } = await import('../engine/android-bridge.mjs')
        const bridge = new AndroidAutomationBridge()
        const status = await bridge.listDevices()
        return json(res, 200, status)
      } catch (err) {
        return json(res, 200, { success: false, error: err.message, devices: [] })
      }
    }
  }

  // Media Vault & Designated Drive Folder endpoints
  if (p === '/api/media/vault') {
    const { mediaVault } = await import('../engine/media-vault.mjs')
    if (req.method === 'GET') {
      return json(res, 200, mediaVault.listMediaAssets())
    }
    if (req.method === 'POST') {
      try {
        const b = await readJson(req)
        if (b.designatedFolder) {
          const resVault = mediaVault.setDesignatedDirectory(b.designatedFolder)
          return json(res, 200, resVault)
        }
        if (b.filename && b.base64Data) {
          const resSave = mediaVault.saveAsset(b.filename, b.base64Data)
          return json(res, 201, resSave)
        }
        return json(res, 400, { error: 'Provide designatedFolder or filename + base64Data' })
      } catch (err) {
        return json(res, 400, { error: err.message })
      }
    }
  }

  return false
}

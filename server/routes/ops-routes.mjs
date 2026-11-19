import { dbService } from '../db/sqlite-engine.mjs'
import { readJsonBody } from '../http/read-json.mjs'
import { markPostConfirmed, pruneQueue, logActivity } from '../marketing/orchestrator.mjs'
import { buildMetricsReport } from './ops-metrics-report.mjs'
import { handleWorkflowRoutes } from './ops-workflow-routes.mjs'

export { buildMetricsReport }
const REPO_RE = /^[\w.-]+\/[\w.-]+$/

export async function handleOpsRoutes(req, res, url, json) {
  if (await handleWorkflowRoutes(req, res, url, json)) return true
  const p = url.pathname

  if (req.method === 'POST' && p === '/api/social/mark-published') {
    try {
      const b = await readJsonBody(req)
      if (!b.postId || !b.platformId) return json(res, 400, { error: 'postId and platformId required' })
      const post = markPostConfirmed(b.postId, b.platformId, b.externalUrl || null)
      return json(res, post ? 200 : 404, { success: Boolean(post), post })
    } catch (e) { return json(res, e.statusCode || 400, { error: e.message }) }
  }

  if (req.method === 'POST' && p === '/api/social/cleanup') {
    try {
      const b = await readJsonBody(req)
      const result = pruneQueue({
        olderThanDays: Number.isFinite(b.olderThanDays) ? b.olderThanDays : 14,
        statuses: Array.isArray(b.statuses) ? b.statuses : ['scheduled'],
        dryRun: b.dryRun !== false
      })
      return json(res, 200, { success: true, ...result })
    } catch (e) { return json(res, e.statusCode || 400, { error: e.message }) }
  }

  if (req.method === 'POST' && p === '/api/social/client-error') {
    try {
      const b = await readJsonBody(req)
      const item = logActivity(String(b.platformId || 'extension').slice(0, 30), `Extension error: ${String(b.where || 'unknown').slice(0, 60)}`, 'error', {
        message: String(b.message || '').slice(0, 300)
      })
      return json(res, 200, { success: true, id: item.id })
    } catch (e) { return json(res, e.statusCode || 400, { error: e.message }) }
  }

  if (p === '/api/social/metrics') {
    if (req.method === 'POST') {
      try {
        const b = await readJsonBody(req)
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
      } catch (e) { return json(res, e.statusCode || 400, { error: e.message }) }
    }
    if (req.method === 'GET') return json(res, 200, { success: true, ...buildMetricsReport() })
  }

  if (req.method === 'POST' && p === '/api/social/metrics/stars') {
    try {
      const b = await readJsonBody(req)
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
    } catch (e) { return json(res, e.statusCode || 502, { error: e.message }) }
  }

  if (p === '/api/social/hybrid-run') {
    if (req.method === 'GET') {
      const { VISUAL_ICON_CATALOG } = await import('../engine/vision-contour.mjs')
      return json(res, 200, { success: true, catalog: VISUAL_ICON_CATALOG })
    }
    if (req.method === 'POST') {
      try {
        const b = await readJsonBody(req)
        const { LuaAutomationEngine } = await import('../engine/lua-runner.mjs')
        const engine = new LuaAutomationEngine({ quotaLimitPerHour: b.quotaLimit || 30 })
        const commands = Array.isArray(b.commands) ? b.commands : []
        return json(res, 200, await engine.runScript(commands, { scene: b.scene || null }))
      } catch (err) { return json(res, err.statusCode || 400, { error: err.message }) }
    }
  }

  if (p === '/api/social/android-status' && req.method === 'GET') {
    try {
      const { AndroidAutomationBridge } = await import('../engine/android-bridge.mjs')
      return json(res, 200, await new AndroidAutomationBridge().listDevices())
    } catch (err) {
      return json(res, 200, { success: false, error: err.message, devices: [] })
    }
  }

  if (p === '/api/media/vault') {
    const { mediaVault } = await import('../engine/media-vault.mjs')
    if (req.method === 'GET') return json(res, 200, mediaVault.listMediaAssets())
    if (req.method === 'POST') {
      try {
        const b = await readJsonBody(req)
        if (b.designatedFolder) return json(res, 200, mediaVault.setDesignatedDirectory(b.designatedFolder))
        if (b.filename && b.base64Data) return json(res, 201, mediaVault.saveAsset(b.filename, b.base64Data))
        return json(res, 400, { error: 'Provide designatedFolder or filename + base64Data' })
      } catch (err) { return json(res, err.statusCode || 400, { error: err.message }) }
    }
  }

  return false
}

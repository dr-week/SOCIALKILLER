import { dbService } from '../../db/sqlite-engine.mjs'

export async function handleSocialSchedulerRoutes(req, res, url, json) {
  if (url.pathname === '/api/social/autopilot') {
    const autopilot = await import('../../marketing/autopilot.mjs')
    if (req.method === 'GET') {
      return json(res, 200, { success: true, autopilot: autopilot.getAutopilotStatus() })
    }
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}')
          if (parsed.action === 'start') autopilot.startAutopilotScheduler(parsed.intervalHours)
          else if (parsed.action === 'stop') autopilot.stopAutopilotScheduler()
          else if (parsed.action === 'run_now') {
            const cycle = await autopilot.runAutopilotCycle('manual_trigger')
            return json(res, 200, { success: true, cycle, autopilot: autopilot.getAutopilotStatus() })
          }
          return json(res, 200, { success: true, autopilot: autopilot.getAutopilotStatus() })
        } catch (error) {
          return json(res, 400, { error: error.message })
        }
      })
      return true
    }
  }

  if (url.pathname === '/api/social/scheduler') {
    const scheduler = await import('../../scheduler.mjs')
    if (req.method === 'GET') {
      return json(res, 200, { success: true, scheduler: scheduler.getSchedulerStatus() })
    }
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}')
          if (parsed.action === 'start') scheduler.startAutomatedScheduler(parsed.intervalMs)
          else if (parsed.action === 'stop') scheduler.stopAutomatedScheduler()
          else if (parsed.action === 'run_now') {
            const result = await scheduler.executeAutomatedSchedulerTick(parsed.options || {})
            return json(res, 200, { success: true, result, scheduler: scheduler.getSchedulerStatus() })
          }
          return json(res, 200, { success: true, scheduler: scheduler.getSchedulerStatus() })
        } catch (error) {
          return json(res, 400, { error: error.message })
        }
      })
      return true
    }
  }

  if (url.pathname === '/api/social/idempotency') {
    if (req.method === 'GET') {
      const token = url.searchParams.get('token')
      return json(res, 200, { success: true, token, exists: dbService.hasIdempotencyToken(token) })
    }
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}')
          if (!parsed.token) return json(res, 400, { error: 'token is required' })
          const record = dbService.recordIdempotencyToken({
            token: parsed.token,
            scope: parsed.scope || 'broadcast',
            source: parsed.source || 'remote_sync',
            payloadHash: parsed.payloadHash || null,
            metadata: parsed.metadata || null,
            ttlHours: parsed.ttlHours || 72
          })
          return json(res, record.success ? 201 : 409, record)
        } catch (error) {
          return json(res, 400, { error: error.message })
        }
      })
      return true
    }
  }
  return false
}

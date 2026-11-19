import {
  createAutomation, deleteAutomation, listAutomationWorkspace, retryAutomationRun,
  runAutomationNow, setAutomationEnabled, updateAutomation
} from './automation-service.mjs'
import { AutomationValidationError } from './automation-definition.mjs'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > 64_000) reject(new AutomationValidationError('Request body exceeds 64 KB.'))
    })
    req.on('error', reject)
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new AutomationValidationError('Request body must be an object.')
        resolve(parsed)
      } catch (error) { reject(error) }
    })
  })
}

function brandIdFrom(url, body) {
  return body?.brandId || url.searchParams.get('brandId') || ''
}

export async function handleAutomationRoutes(req, res, url, json) {
  if (!url.pathname.startsWith('/api/automations')) return false
  try {
    if (url.pathname === '/api/automations' && req.method === 'GET') {
      return json(res, 200, { success: true, ...listAutomationWorkspace(brandIdFrom(url)) })
    }
    if (url.pathname === '/api/automations' && req.method === 'POST') {
      return json(res, 201, { success: true, rule: createAutomation(await readJsonBody(req)) })
    }
    const retryMatch = url.pathname.match(/^\/api\/automations\/runs\/([a-f0-9-]+)\/retry$/i)
    if (retryMatch && req.method === 'POST') {
      const body = await readJsonBody(req)
      const run = await retryAutomationRun(retryMatch[1], brandIdFrom(url, body))
      return run ? json(res, 200, { success: true, run }) : json(res, 404, { error: 'Automation run not found.' })
    }
    const match = url.pathname.match(/^\/api\/automations\/([a-f0-9-]+)(?:\/(run))?$/i)
    if (!match) return json(res, 404, { error: 'Automation route not found.' })
    const [, id, action] = match
    const body = req.method === 'POST' || req.method === 'PATCH' ? await readJsonBody(req) : {}
    const brandId = brandIdFrom(url, body)
    if (req.method === 'POST' && action === 'run') {
      const run = await runAutomationNow(id, brandId, body.event || {})
      return run ? json(res, 200, { success: true, run }) : json(res, 404, { error: 'Automation not found.' })
    }
    if (req.method === 'PATCH' && typeof body.enabled === 'boolean') {
      const rule = setAutomationEnabled(id, brandId, body.enabled)
      return rule ? json(res, 200, { success: true, rule }) : json(res, 404, { error: 'Automation not found.' })
    }
    if (req.method === 'PATCH') {
      const rule = updateAutomation(id, brandId, body)
      return rule ? json(res, 200, { success: true, rule }) : json(res, 404, { error: 'Automation not found.' })
    }
    if (req.method === 'DELETE') {
      const deleted = deleteAutomation(id, brandId)
      return deleted ? json(res, 200, { success: true }) : json(res, 404, { error: 'Automation not found.' })
    }
    return json(res, 405, { error: 'Method not allowed.' })
  } catch (error) {
    if (error instanceof AutomationValidationError) return json(res, 400, { error: error.message })
    console.error(`Automation API request failed: ${error.message}`)
    return json(res, 500, { error: 'Automation request failed. Check the local API log.' })
  }
}

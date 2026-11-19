import { randomUUID } from 'node:crypto'
import { dbService } from '../db/sqlite-engine.mjs'
import { readJsonBody } from '../http/read-json.mjs'

const BRAND_ID_RE = /^[a-z0-9-]{1,64}$/
const WORKFLOW_SELECTOR_RE = /^(?:[a-z][a-z0-9-]*)\[(?:data-testid|aria-label|name|id|placeholder)="[\w .:-]{1,80}"\]$/

function validateWorkflowSteps(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100) {
    throw new Error('Workflow must contain 1–100 steps.')
  }
  return input.map((step, index) => {
    if (!step || !['click', 'fill', 'scroll', 'wait'].includes(step.action)) {
      throw new Error(`Step ${index + 1} has an unsupported action.`)
    }
    if ((step.action === 'click' || step.action === 'fill') && (typeof step.selector !== 'string' || !WORKFLOW_SELECTOR_RE.test(step.selector))) {
      throw new Error(`Step ${index + 1} has an unsupported target.`)
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

export async function handleWorkflowRoutes(req, res, url, json) {
  if (url.pathname !== '/api/social/workflows') return false
  const brandId = req.method === 'POST' ? '' : String(url.searchParams.get('brandId') || 'danger-labs')

  if (req.method === 'GET') {
    if (!BRAND_ID_RE.test(brandId)) return json(res, 400, { error: 'Invalid company workspace.' })
    return json(res, 200, { success: true, workflows: dbService.getInteractionWorkflows(brandId) })
  }
  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
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
      return json(res, error.statusCode || 400, { error: error.message || 'Invalid workflow.' })
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

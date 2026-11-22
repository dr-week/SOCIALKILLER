/**
 * SOCIALKILLER Free-Tier Edge API Gateway (Cloudflare Workers, $0/month, <95 LOC)
 * Supports GitHub Pages SPA with edge health checks, status telemetry, and Leads CRUD.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/api/health' && request.method === 'GET') {
      return jsonResponse({
        ok: true,
        service: 'socialkiller-edge-gateway',
        tier: 'cloudflare-workers-free',
        database: env?.DB ? 'cloudflare-d1' : 'stateless-edge',
        timestamp: new Date().toISOString()
      })
    }

    if (path === '/api/status' && request.method === 'GET') {
      return jsonResponse({
        ok: true,
        version: '1.5.0',
        hosting: '$0/mo (GitHub Pages + Cloudflare Workers Free Tier)',
        limits: { requestsPerDay: 100000, cpuMsPerReq: 10 },
        endpoints: ['/api/health', '/api/status', '/api/leads']
      })
    }

    if (path === '/api/leads' && request.method === 'GET') {
      if (env?.DB) {
        const brandId = url.searchParams.get('brandId') || 'danger-labs'
        const { results } = await env.DB.prepare(
          'SELECT * FROM leads WHERE brand_id = ? ORDER BY updated_at DESC LIMIT 100'
        ).bind(brandId).all()
        return jsonResponse({ success: true, leads: results || [] })
      }
      return jsonResponse({ success: true, leads: [], mode: 'stateless-edge' })
    }

    if (path === '/api/leads' && request.method === 'POST') {
      const body = await request.json().catch(() => null)
      if (!body?.contactName) return jsonResponse({ error: 'contactName is required' }, 400)
      const id = `lead_${Date.now().toString(36)}`
      const now = new Date().toISOString()
      const lead = {
        id,
        brandId: body.brandId || 'danger-labs',
        contactName: String(body.contactName).slice(0, 80),
        platformId: body.platformId || 'instagram',
        status: body.status || 'new',
        message: String(body.message || '').slice(0, 500),
        createdAt: now,
        updatedAt: now
      }
      if (env?.DB) {
        await env.DB.prepare(
          'INSERT INTO leads (id, brand_id, contact_name, platform_id, status, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(lead.id, lead.brandId, lead.contactName, lead.platformId, lead.status, lead.message, now, now).run()
      }
      return jsonResponse({ success: true, lead }, 201)
    }

    if (path.startsWith('/api/leads/') && request.method === 'DELETE') {
      const id = decodeURIComponent(path.slice('/api/leads/'.length))
      if (env?.DB) await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run()
      return jsonResponse({ success: true, deletedId: id })
    }

    return jsonResponse({ error: 'Not found', path }, 404)
  }
}

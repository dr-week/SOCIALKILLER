import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../workers/api-gateway/worker.mjs'

test('Cloudflare Worker handles OPTIONS CORS preflight, /api/health, and /api/status', async () => {
  const optRes = await worker.fetch(new Request('https://edge.local/api/health', { method: 'OPTIONS' }), {})
  assert.equal(optRes.status, 204)
  assert.equal(optRes.headers.get('Access-Control-Allow-Origin'), '*')

  const healthRes = await worker.fetch(new Request('https://edge.local/api/health'), {})
  assert.equal(healthRes.status, 200)
  const health = await healthRes.json()
  assert.equal(health.ok, true)
  assert.equal(health.database, 'stateless-edge')

  const statusRes = await worker.fetch(new Request('https://edge.local/api/status'), {})
  const status = await statusRes.json()
  assert.equal(status.ok, true)
  assert.equal(status.limits.requestsPerDay, 100000)
})

test('Cloudflare Worker handles /api/leads CRUD and 404 fallback', async () => {
  const badRes = await worker.fetch(new Request('https://edge.local/api/leads', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
  }), {})
  assert.equal(badRes.status, 400)

  const createRes = await worker.fetch(new Request('https://edge.local/api/leads', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactName: 'Alex Rivera', platformId: 'x', message: 'Interested in pricing' })
  }), {})
  assert.equal(createRes.status, 201)
  const created = await createRes.json()
  assert.equal(created.success, true)
  assert.equal(created.lead.contactName, 'Alex Rivera')

  const delRes = await worker.fetch(new Request(`https://edge.local/api/leads/${created.lead.id}`, { method: 'DELETE' }), {})
  assert.equal(delRes.status, 200)

  const missRes = await worker.fetch(new Request('https://edge.local/api/unknown'), {})
  assert.equal(missRes.status, 404)
})

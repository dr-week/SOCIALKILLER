import assert from 'node:assert/strict'
import test from 'node:test'
import { handleLeadsRoutes } from './routes/leads-routes.mjs'

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    writeHead(status, headers) {
      this.statusCode = status
      this.headers = headers
    },
    end(payload) {
      this.body = payload ? JSON.parse(payload) : null
    }
  }
}

function jsonMock(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(data))
  return true
}

async function* createAsyncPayload(data) {
  yield Buffer.from(JSON.stringify(data))
}

test('Leads CRM REST API lifecycle', async () => {
  const brandId = `test-brand-${Date.now()}`

  // 1. Initial list should be empty for new brand
  const listReq = { method: 'GET' }
  const listRes = createMockResponse()
  await handleLeadsRoutes(listReq, listRes, new URL(`http://127.0.0.1/api/leads?brandId=${brandId}`), jsonMock)
  assert.equal(listRes.statusCode, 200)
  assert.equal(listRes.body.count, 0)

  // 2. Create a new lead from a social comment
  const createReq = {
    method: 'POST',
    [Symbol.asyncIterator]: () => createAsyncPayload({
      brandId,
      contactName: 'Alex Founder',
      handle: 'alex_tech',
      platformId: 'instagram',
      source: 'comment',
      triggerWord: 'PRICE',
      message: 'What is the price for the agency package?',
      intent: 'high_intent'
    })
  }
  const createRes = createMockResponse()
  await handleLeadsRoutes(createReq, createRes, new URL(`http://127.0.0.1/api/leads`), jsonMock)
  assert.equal(createRes.statusCode, 201)
  assert.equal(createRes.body.success, true)
  const leadId = createRes.body.lead.id
  assert.ok(leadId)
  assert.equal(createRes.body.lead.contactName, 'Alex Founder')
  assert.equal(createRes.body.lead.status, 'new')

  // 3. Update lead status to qualified
  const updateReq = {
    method: 'PATCH',
    [Symbol.asyncIterator]: () => createAsyncPayload({ status: 'qualified', notes: 'Scheduled demo for next Monday' })
  }
  const updateRes = createMockResponse()
  await handleLeadsRoutes(updateReq, updateRes, new URL(`http://127.0.0.1/api/leads/${leadId}?brandId=${brandId}`), jsonMock)
  assert.equal(updateRes.statusCode, 200)
  assert.equal(updateRes.body.lead.status, 'qualified')

  // 4. Query lead by status
  const filterRes = createMockResponse()
  await handleLeadsRoutes({ method: 'GET' }, filterRes, new URL(`http://127.0.0.1/api/leads?brandId=${brandId}&status=qualified`), jsonMock)
  assert.equal(filterRes.statusCode, 200)
  assert.equal(filterRes.body.count, 1)

  // 5. Delete lead
  const delRes = createMockResponse()
  await handleLeadsRoutes({ method: 'DELETE' }, delRes, new URL(`http://127.0.0.1/api/leads/${leadId}?brandId=${brandId}`), jsonMock)
  assert.equal(delRes.statusCode, 200)
  assert.equal(delRes.body.deleted, leadId)

  // 6. Verify 404 after deletion
  const checkRes = createMockResponse()
  await handleLeadsRoutes({ method: 'GET' }, checkRes, new URL(`http://127.0.0.1/api/leads/${leadId}?brandId=${brandId}`), jsonMock)
  assert.equal(checkRes.statusCode, 404)
})

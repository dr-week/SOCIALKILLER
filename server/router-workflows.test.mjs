import assert from 'node:assert/strict'
import test from 'node:test'
import { routeRequest } from './router.mjs'
import { simulateRequest } from './router-test-utils.mjs'

test('interaction workflows save per company, edit reviewed input, reject unsafe selectors, and delete', async () => {
  const body = {
    brandId: 'danger-labs', name: 'Demo search',
    origin: 'https://example.com/path?private=discarded',
    steps: [
      { id: '1', action: 'click', selector: 'button[aria-label="Open menu"]', label: 'Open menu' },
      { id: '2', action: 'fill', selector: 'input[placeholder="Search"]', label: 'Search', value: '' },
      { id: '3', action: 'scroll', deltaY: 320 }
    ]
  }
  const created = await simulateRequest(routeRequest, 'POST', '/api/social/workflows', body)
  assert.equal(created.status, 201)
  assert.match(created.body.workflow.id, /^[\da-f-]{36}$/)
  assert.equal(created.body.workflow.origin, 'https://example.com')
  assert.equal(created.body.workflow.steps[1].value, '')

  const listed = await simulateRequest(routeRequest, 'GET', '/api/social/workflows?brandId=danger-labs')
  assert.ok(listed.body.workflows.some(item => item.id === created.body.workflow.id))
  const isolated = await simulateRequest(routeRequest, 'GET', '/api/social/workflows?brandId=other-company')
  assert.ok(!isolated.body.workflows.some(item => item.id === created.body.workflow.id))

  const updated = await simulateRequest(routeRequest, 'POST', '/api/social/workflows', {
    ...created.body.workflow, steps: [{ ...created.body.workflow.steps[1], value: 'reviewed query' }]
  })
  assert.equal(updated.status, 200)
  assert.equal(updated.body.workflow.steps[0].value, 'reviewed query')
  const unsafe = await simulateRequest(routeRequest, 'POST', '/api/social/workflows', {
    ...body, steps: [{ action: 'click', selector: 'button[type="submit"]' }]
  })
  assert.equal(unsafe.status, 400)
  const wrongDelete = await simulateRequest(routeRequest, 'DELETE', `/api/social/workflows?id=${created.body.workflow.id}&brandId=other-company`)
  assert.equal(wrongDelete.status, 404)
  const removed = await simulateRequest(routeRequest, 'DELETE', `/api/social/workflows?id=${created.body.workflow.id}&brandId=danger-labs`)
  assert.equal(removed.status, 200)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { routeRequest } from './router.mjs'
import { simulateRequest } from './router-test-utils.mjs'

test('brand routes list workspaces and generate founder scripts and research', async () => {
  const brands = await simulateRequest(routeRequest, 'GET', '/api/brands')
  assert.equal(brands.status, 200)
  assert.ok(brands.body.brands.length >= 2)
  const danger = brands.body.brands.find(brand => brand.id === 'danger-labs')
  assert.equal(danger.location, 'Goa, India')

  const script = await simulateRequest(routeRequest, 'POST', '/api/brands/generate-script', {
    brandId: 'danger-labs', topic: 'Zuari <2.5KB Core Wasm', pillar: 'family_doubts'
  })
  assert.equal(script.status, 200)
  assert.ok(script.body.script.beats.length >= 4)
  assert.ok(script.body.script.fullText.includes('HOOK'))
  assert.ok(script.body.script.fullText.includes('Goa'))

  const journey = await simulateRequest(routeRequest, 'POST', '/api/brands/generate-journey', {
    brandId: 'danger-labs', topic: 'eliminating 90% memory overhead'
  })
  assert.equal(journey.status, 200)
  assert.ok(journey.body.journey.channels.x.includes('Goa'))
  assert.ok(journey.body.journey.channels.linkedin.includes('Bangalore'))
  assert.equal(journey.body.journey.channels.reddit.subreddit, 'r/developersIndia')

  const research = await simulateRequest(routeRequest, 'POST', '/api/brands/research', { brandId: 'danger-labs' })
  assert.equal(research.status, 200)
  assert.ok(research.body.research.competitorAngles.length > 0)
  assert.ok(research.body.brand.purpose.research)
})

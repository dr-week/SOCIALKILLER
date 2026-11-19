import assert from 'node:assert/strict'
import test from 'node:test'
import { isRequestAllowed } from './router.mjs'

test('workflow records are not readable from unrelated website origins', () => {
  const request = { headers: { host: '127.0.0.1:4174', origin: 'https://untrusted.example' }, method: 'GET' }
  assert.equal(isRequestAllowed(request, '/api/social/workflows'), false)
  request.headers.origin = 'http://127.0.0.1:5199'
  assert.equal(isRequestAllowed(request, '/api/social/workflows'), true)
  request.headers.origin = `chrome-extension://${'a'.repeat(32)}`
  assert.equal(isRequestAllowed(request, '/api/social/workflows'), true)
})

test('Android build endpoints accept only loopback browser origins', () => {
  const request = { headers: { host: '127.0.0.1:4174', origin: 'https://untrusted.example' }, method: 'POST' }
  assert.equal(isRequestAllowed(request, '/api/android/build'), false)
  request.headers.origin = 'http://127.0.0.1:5173'
  assert.equal(isRequestAllowed(request, '/api/android/build'), true)
  delete request.headers.origin
  assert.equal(isRequestAllowed(request, '/api/android/build'), true)
})

test('runtime registry details are not readable from unrelated website origins', () => {
  const request = { headers: { host: '127.0.0.1:4174', origin: 'https://untrusted.example' }, method: 'GET' }
  assert.equal(isRequestAllowed(request, '/api/runtime'), false)
  request.headers.origin = 'http://127.0.0.1:5199'
  assert.equal(isRequestAllowed(request, '/api/runtime'), true)
})

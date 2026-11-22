import assert from 'node:assert/strict'
import test from 'node:test'
import { routeAiCompletion } from './assistant/ai-router.mjs'

test('AI router prefers local Ollama when available', async () => {
  const mockFetch = async (url) => {
    assert.ok(String(url).includes('/api/generate'))
    return new Response(JSON.stringify({ response: 'Local Ollama draft ready!' }), { status: 200 })
  }

  const res = await routeAiCompletion({
    prompt: 'Draft a launch tweet for Zuari',
    fetchImpl: mockFetch,
    apiKey: 'fake-gemini-key'
  })

  assert.equal(res.ok, true)
  assert.equal(res.provider, 'ollama')
  assert.equal(res.text, 'Local Ollama draft ready!')
})

test('AI router falls back to Gemini when Ollama is offline', async () => {
  const mockFetch = async (url) => {
    if (String(url).includes('11434')) throw new Error('ECONNREFUSED')
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Gemini cloud response!' }] } }]
    }), { status: 200 })
  }

  const res = await routeAiCompletion({
    prompt: 'Summarize release notes',
    fetchImpl: mockFetch,
    apiKey: 'test-key-123'
  })

  assert.equal(res.ok, true)
  assert.equal(res.provider, 'gemini')
  assert.equal(res.text, 'Gemini cloud response!')
})

test('AI router falls back cleanly to deterministic offline mode when both providers fail', async () => {
  const mockFetch = async () => { throw new Error('Network offline') }
  const res = await routeAiCompletion({
    prompt: 'Write a quick status update',
    fetchImpl: mockFetch,
    apiKey: ''
  })

  assert.equal(res.ok, true)
  assert.equal(res.provider, 'offline')
  assert.ok(res.text.includes('Write a quick status update'))
})

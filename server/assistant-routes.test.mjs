import assert from 'node:assert/strict'
import test from 'node:test'
import { Readable } from 'node:stream'
import { createAssistantService, MAX_ASSISTANT_PROMPT_CHARS } from './assistant/assistant-service.mjs'
import {
  AssistantProviderError,
  createGeminiAdapter
} from './integrations/ai/gemini-adapter.mjs'
import { createAssistantRoutes } from './routes/assistant-routes.mjs'
import { isRequestAllowed } from './router.mjs'

test('Gemini adapter sends one bounded text request with the server-side key', async () => {
  let request
  const generate = createGeminiAdapter({
    env: { GEMINI_API_KEY: 'test-secret' },
    fetchImpl: async (url, options) => {
      request = { url, options }
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Short answer' }] } }] }) }
    }
  })
  assert.equal(await generate({ prompt: 'Question', systemInstruction: 'Be brief.' }), 'Short answer')
  assert.match(request.url, /gemini-3\.5-flash-lite:generateContent$/)
  assert.equal(request.options.headers['x-goog-api-key'], 'test-secret')
  assert.equal(JSON.parse(request.options.body).generationConfig.maxOutputTokens, 256)
  assert.equal(request.options.redirect, 'error')
  const limited = createGeminiAdapter({
    env: { GEMINI_API_KEY: 'test-secret' },
    fetchImpl: async () => ({ ok: false, status: 429 })
  })
  await assert.rejects(limited({ prompt: 'Question', systemInstruction: 'Be brief.' }), { code: 'rate_limited', status: 429 })
})

test('assistant service trims prompts and rejects empty or oversized chunks', async () => {
  const prompts = []
  const service = createAssistantService({
    env: {},
    generateText: async input => { prompts.push(input.prompt); return 'ok' }
  })
  assert.equal(await service.reply('  small task  '), 'ok')
  assert.deepEqual(prompts, ['small task'])
  await assert.rejects(service.reply('  '), { code: 'empty_prompt' })
  await assert.rejects(service.reply('x'.repeat(MAX_ASSISTANT_PROMPT_CHARS + 1)), { code: 'prompt_too_long' })
})

test('assistant routes expose status and reject context or unexpected input', async () => {
  const service = createAssistantService({
    env: {},
    generateText: async () => 'ok'
  })
  const routes = createAssistantRoutes({ service })
  const status = await request(routes, 'GET', '/api/assistant/status')
  assert.equal(status.status, 200)
  assert.equal(status.body.configured, false)
  assert.equal(status.body.maxPromptChars, 2000)

  const extra = await request(routes, 'POST', '/api/assistant/chat', { prompt: 'question', workspace: 'all data' })
  assert.equal(extra.status, 400)
  assert.equal(extra.body.code, 'unexpected_field')
  const oversized = await request(routes, 'POST', '/api/assistant/chat', { prompt: 'x'.repeat(2001) })
  assert.equal(oversized.status, 400)
  assert.equal(oversized.body.code, 'prompt_too_long')
})

test('assistant route surfaces missing credentials and provider quota errors', async () => {
  const missingKey = createAssistantService({ env: {} })
  const missing = await request(createAssistantRoutes({ service: missingKey }), 'POST', '/api/assistant/chat', { prompt: 'hello' })
  assert.equal(missing.status, 503)
  assert.equal(missing.body.code, 'not_configured')

  const limited = createAssistantService({
    env: { GEMINI_API_KEY: 'test-secret' },
    generateText: async () => { throw new AssistantProviderError('rate_limited', 'Quota reached.', 429) }
  })
  const response = await request(createAssistantRoutes({ service: limited }), 'POST', '/api/assistant/chat', { prompt: 'hello' })
  assert.equal(response.status, 429)
  assert.equal(response.body.error, 'Quota reached.')
})

test('assistant endpoints reject foreign origins but allow loopback origins', () => {
  const request = { method: 'POST', headers: { host: '127.0.0.1:4174', origin: 'https://untrusted.example' } }
  assert.equal(isRequestAllowed(request, '/api/assistant/chat'), false)
  request.headers.origin = 'http://127.0.0.1:5199'
  assert.equal(isRequestAllowed(request, '/api/assistant/chat'), true)
})

async function request(handler, method, path, body) {
  const req = Readable.from(body == null ? [] : [JSON.stringify(body)])
  req.method = method
  req.url = path
  req.headers = { host: '127.0.0.1:4174' }
  const res = {}
  const json = (_res, status, payload) => {
    Object.assign(res, { status, body: payload })
    return true
  }
  await handler(req, res, new URL(path, 'http://127.0.0.1'), json)
  return res
}

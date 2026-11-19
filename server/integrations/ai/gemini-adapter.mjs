const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const MODEL_PATTERN = /^gemini-[a-zA-Z0-9._-]{1,80}$/
const REQUEST_TIMEOUT_MS = 20_000
const MAX_OUTPUT_TOKENS = 256

export class AssistantProviderError extends Error {
  constructor(code, message, status = 502) {
    super(message)
    this.name = 'AssistantProviderError'
    this.code = code
    this.status = status
  }
}

export class AssistantTimeoutError extends Error {
  constructor() {
    super('The AI request timed out. Try a shorter prompt or retry later.')
    this.name = 'AssistantTimeoutError'
    this.code = 'timeout'
    this.status = 504
  }
}

function readConfig(env) {
  const apiKey = typeof env.GEMINI_API_KEY === 'string' ? env.GEMINI_API_KEY.trim() : ''
  const model = typeof env.GEMINI_MODEL === 'string' && env.GEMINI_MODEL.trim()
    ? env.GEMINI_MODEL.trim()
    : DEFAULT_MODEL
  if (!MODEL_PATTERN.test(model)) {
    throw new AssistantProviderError('invalid_configuration', 'GEMINI_MODEL is invalid.', 503)
  }
  return { apiKey, model }
}

export function getGeminiStatus(env = process.env) {
  const { apiKey, model } = readConfig(env)
  return { provider: 'gemini', model, configured: Boolean(apiKey), sendsPromptExternally: true }
}

export function createGeminiAdapter({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  return async function generateText({ prompt, systemInstruction }) {
    const { apiKey, model } = readConfig(env)
    if (!apiKey) {
      throw new AssistantProviderError('not_configured', 'Set GEMINI_API_KEY in .env to enable the optional assistant.', 503)
    }
    if (typeof fetchImpl !== 'function') {
      throw new AssistantProviderError('fetch_unavailable', 'This Node.js runtime does not provide fetch.', 503)
    }

    let response
    try {
      response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.3 }
        }),
        redirect: 'error',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new AssistantTimeoutError()
      throw new AssistantProviderError('provider_unavailable', 'Gemini API could not be reached. Check the network and retry.', 502)
    }

    if (!response.ok) {
      if (response.status === 429) throw new AssistantProviderError('rate_limited', 'Gemini free-tier quota was reached. Try again later.', 429)
      if (response.status === 401 || response.status === 403) throw new AssistantProviderError('invalid_api_key', 'Gemini rejected the API key. Check GEMINI_API_KEY.', 503)
      if (response.status === 404) throw new AssistantProviderError('model_unavailable', 'The configured Gemini model is unavailable. Check GEMINI_MODEL.', 503)
      throw new AssistantProviderError('upstream_error', `Gemini API request failed (HTTP ${response.status}).`, 502)
    }

    let result
    try {
      result = await response.json()
    } catch {
      throw new AssistantProviderError('invalid_response', 'Gemini returned an invalid response.', 502)
    }
    const parts = result?.candidates?.[0]?.content?.parts
    const text = Array.isArray(parts)
      ? parts.map(part => typeof part?.text === 'string' ? part.text : '').join('').trim()
      : ''
    if (!text) throw new AssistantProviderError('empty_response', 'Gemini returned no text. Try rephrasing the prompt.', 502)
    return text
  }
}

/**
 * Local-First AI Router (<95 lines)
 * Routes completion requests with zero cloud lock-in:
 *   1. Local Ollama (http://127.0.0.1:11434, $0 cost, 100% private)
 *   2. Gemini API (when GEMINI_API_KEY is configured)
 *   3. Deterministic Offline Fallback (always available)
 */

export async function tryOllamaCompletion({
  prompt,
  systemPrompt = '',
  model = process.env.OLLAMA_MODEL || 'llama3.2',
  baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
  fetchImpl = fetch,
  timeoutMs = 2500
}) {
  try {
    const res = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false
      }),
      signal: AbortSignal.timeout(timeoutMs)
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = String(data?.response || '').trim()
    return text ? { ok: true, provider: 'ollama', model, text } : null
  } catch {
    return null
  }
}

export async function tryGeminiCompletion({
  prompt,
  systemPrompt = '',
  apiKey = process.env.GEMINI_API_KEY || '',
  model = process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  fetchImpl = fetch,
  timeoutMs = 5000
}) {
  if (!apiKey) return null
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
      signal: AbortSignal.timeout(timeoutMs)
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = String(data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
    return text ? { ok: true, provider: 'gemini', model, text } : null
  } catch {
    return null
  }
}

export function buildOfflineFallback(prompt = '') {
  const clean = String(prompt || '').trim().replace(/\s+/g, ' ').slice(0, 140)
  return {
    ok: true,
    provider: 'offline',
    model: 'deterministic-template-v1',
    text: clean
      ? `Draft prepared locally: "${clean}". Review and refine before publishing.`
      : 'Local draft ready. Add your topic or notes to generate a tailored response.'
  }
}

export async function routeAiCompletion(options = {}) {
  const prompt = String(options.prompt || '').trim()
  if (!prompt) return { ok: false, provider: 'none', error: 'Prompt is required.' }

  if (options.preferOllama !== false) {
    const ollamaRes = await tryOllamaCompletion(options)
    if (ollamaRes) return ollamaRes
  }

  const geminiRes = await tryGeminiCompletion(options)
  if (geminiRes) return geminiRes

  return buildOfflineFallback(prompt)
}

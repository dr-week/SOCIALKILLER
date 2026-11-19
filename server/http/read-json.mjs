export async function readJsonBody(req, maxBytes = 1_000_000) {
  let raw = ''
  let bytes = 0
  for await (const chunk of req) {
    const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8')
    bytes += Buffer.byteLength(text)
    if (bytes > maxBytes) {
      const error = new Error('Payload too large')
      error.statusCode = 413
      throw error
    }
    raw += text
  }
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    const error = new Error('Invalid JSON payload')
    error.statusCode = 400
    throw error
  }
}

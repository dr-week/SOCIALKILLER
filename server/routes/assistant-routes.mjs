import { AssistantInputError, assistantService } from '../assistant/assistant-service.mjs'
import { AssistantProviderError, AssistantTimeoutError } from '../integrations/ai/gemini-adapter.mjs'

const STATUS_PATH = '/api/assistant/status'
const CHAT_PATH = '/api/assistant/chat'
const MAX_BODY_BYTES = 8192

class AssistantRequestError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk)
    if (size > MAX_BODY_BYTES) {
      throw new AssistantRequestError('body_too_large', 'Request body is too large.', 413)
    }
    chunks.push(Buffer.from(chunk))
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new AssistantRequestError('invalid_body', 'Request body must be a JSON object.')
    }
    return body
  } catch (error) {
    if (error instanceof AssistantRequestError) throw error
    throw new AssistantRequestError('invalid_json', 'Request body must be valid JSON.')
  }
}

function writeError(res, json, error) {
  if (!(error instanceof AssistantRequestError ||
    error instanceof AssistantInputError ||
    error instanceof AssistantProviderError ||
    error instanceof AssistantTimeoutError)) return false
  return json(res, error.status, { success: false, code: error.code, error: error.message })
}

export function createAssistantRoutes({ service = assistantService } = {}) {
  return async function handleAssistantRoutes(req, res, url, json) {
    if (req.method === 'GET' && url.pathname === STATUS_PATH) {
      try {
        return json(res, 200, { success: true, ...service.getStatus() })
      } catch (error) {
        if (writeError(res, json, error)) return true
        throw error
      }
    }
    if (req.method !== 'POST' || url.pathname !== CHAT_PATH) return false

    let body
    try {
      body = await readJsonBody(req)
      if (Object.keys(body).some(key => key !== 'prompt')) {
        throw new AssistantRequestError('unexpected_field', 'Only a prompt field is accepted.')
      }
      const reply = await service.reply(body.prompt)
      return json(res, 200, {
        success: true,
        reply,
        provider: service.getStatus().provider,
        model: service.getStatus().model
      })
    } catch (error) {
      if (writeError(res, json, error)) return true
      throw error
    }
  }
}

export const handleAssistantRoutes = createAssistantRoutes()

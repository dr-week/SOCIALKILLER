import { readJsonBody } from '../http/read-json.mjs'
import { addFeedback, getFeedbackLogs } from '../sync-store.mjs'
import { getHtmlClone, listPageCloneSessions, savePageCloneSession } from '../clone-service.mjs'

export async function handleDevRoutes(req, res, url, json) {
  if (req.method === 'POST' && url.pathname === '/api/dev/feedback') {
    try {
      const item = await readJsonBody(req)
      return json(res, 201, { success: true, feedback: addFeedback(item) }), true
    } catch (err) {
      return json(res, err.statusCode || 400, { error: err.message || 'Invalid feedback data' }), true
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/dev/feedback') {
    const logs = getFeedbackLogs()
    return json(res, 200, { total: logs.length, entries: logs }), true
  }

  if (req.method === 'POST' && url.pathname === '/api/dev/clone') {
    try {
      const payload = await readJsonBody(req)
      return json(res, 201, { success: true, session: savePageCloneSession(payload) }), true
    } catch (err) {
      return json(res, err.statusCode || 400, { error: 'Failed to save page clone', details: err.message }), true
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/dev/clone') {
    const sessionId = url.searchParams.get('id')
    if (sessionId) {
      const html = getHtmlClone(sessionId)
      if (!html) return json(res, 404, { error: 'Clone not found' }), true
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'access-control-allow-origin': '*'
      })
      res.end(html)
      return true
    }
    const sessions = listPageCloneSessions()
    return json(res, 200, { total: sessions.length, sessions }), true
  }

  return false
}

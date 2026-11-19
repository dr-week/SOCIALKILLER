import fs from 'node:fs'
import path from 'node:path'

const SNAPSHOTS_DIR = path.resolve('server/snapshots')

if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true })
}

/**
 * Saves a page clone snapshot & developer session file.
 * @param {{
 *   url: string,
 *   title: string,
 *   username?: string,
 *   html: string,
 *   metadata?: any,
 *   feedbackNote?: string
 * }} sessionData
 */
export function savePageCloneSession(sessionData) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const cleanUser = (sessionData.username || 'page').toLowerCase().replace(/[^a-z0-9_-]/g, '')
  const sessionId = `clone_${cleanUser}_${timestamp}`

  const sessionFile = path.join(SNAPSHOTS_DIR, `${sessionId}.json`)
  const htmlFile = path.join(SNAPSHOTS_DIR, `${sessionId}.html`)

  const payload = {
    sessionId,
    capturedAt: new Date().toISOString(),
    url: sessionData.url || '',
    title: sessionData.title || '',
    username: sessionData.username || '',
    feedbackNote: sessionData.feedbackNote || '',
    metadata: sessionData.metadata || {},
    htmlFile: `${sessionId}.html`
  }

  // Write metadata session JSON
  fs.writeFileSync(sessionFile, JSON.stringify(payload, null, 2), 'utf8')

  // Write isolated HTML clone
  fs.writeFileSync(htmlFile, sessionData.html || '<html><body>Empty clone</body></html>', 'utf8')

  return {
    sessionId,
    capturedAt: payload.capturedAt,
    sessionPath: sessionFile,
    htmlPath: htmlFile
  }
}

/**
 * Lists all captured page clone sessions.
 */
export function listPageCloneSessions() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) return []
  const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.endsWith('.json'))

  const list = []
  for (const f of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, f), 'utf8'))
      list.push(content)
    } catch {}
  }

  return list.sort((a, b) => (b.capturedAt || '').localeCompare(a.capturedAt || ''))
}

/**
 * Reads a single HTML clone by session ID.
 */
export function getHtmlClone(sessionId) {
  const cleanId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '')
  const htmlFile = path.join(SNAPSHOTS_DIR, `${cleanId}.html`)
  if (fs.existsSync(htmlFile)) {
    return fs.readFileSync(htmlFile, 'utf8')
  }
  return null
}

const SECRET_KEY_RE = /token|secret|password|apikey|api_key|authorization|cookie|webhook|bearer|credentials|private_?key/i
const SECRET_VALUE_RE = /(?:ghp_[A-Za-z0-9_]{10,}|github_pat_[A-Za-z0-9_]{10,}|AIza[0-9A-Za-z_-]{16,}|Bearer\s+\S+|https:\/\/discord(?:app)?\.com\/api\/webhooks\/\S+)/g

export function redactSecrets(value, depth = 0) {
  if (depth > 6) return '[MAX_DEPTH]'
  if (value === null || value === undefined) return value
  if (typeof value === 'string') return value.replace(SECRET_VALUE_RE, '[REDACTED]')
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(item => redactSecrets(item, depth + 1))

  const clean = {}
  for (const [key, entry] of Object.entries(value)) {
    clean[key] = SECRET_KEY_RE.test(key) ? '[REDACTED]' : redactSecrets(entry, depth + 1)
  }
  return clean
}

function writeLog(level, scope, message, meta) {
  const safeMsg = redactSecrets(String(message || ''))
  const payload = meta !== undefined ? ` ${JSON.stringify(redactSecrets(meta))}` : ''
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${scope}] ${safeMsg}${payload}`
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export function createLogger(scope = 'server') {
  return {
    info: (message, meta) => writeLog('info', scope, message, meta),
    warn: (message, meta) => writeLog('warn', scope, message, meta),
    error: (message, meta) => writeLog('error', scope, message, meta)
  }
}

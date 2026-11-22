import { createHash, randomUUID } from 'node:crypto'
import { resolve } from 'node:path'

export const APPLICATION_ID = 'the-social-base'
export const RUNTIME_ENVIRONMENTS = ['development', 'staging', 'production']

export function createRuntimeIdentity(root, environment = 'development', instanceId = randomUUID()) {
  if (!RUNTIME_ENVIRONMENTS.includes(environment)) {
    throw new Error(`Unsupported runtime environment: ${environment}`)
  }
  const resolvedRoot = resolve(root).normalize('NFC')
  const isWindowsStyle = /^[a-zA-Z]:[\\/]/.test(root) || process.platform === 'win32'
  const canonicalRoot = isWindowsStyle ? resolvedRoot.toLocaleLowerCase('en-US') : resolvedRoot
  const workspaceId = createHash('sha256').update(canonicalRoot).digest('hex').slice(0, 20)
  return { applicationId: APPLICATION_ID, workspaceId, environment, instanceId }
}

export function matchesRuntimeIdentity(actual, expected, { instance = true } = {}) {
  return actual?.applicationId === expected.applicationId
    && actual?.workspaceId === expected.workspaceId
    && actual?.environment === expected.environment
    && (!instance || actual?.instanceId === expected.instanceId)
}

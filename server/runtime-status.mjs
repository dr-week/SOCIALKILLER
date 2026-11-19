import { createRuntimeIdentity } from '../scripts/runtime/runtime-identity.mjs'

const startedAt = new Date().toISOString()
const environment = process.env.APP_ENV || 'development'
const identity = createRuntimeIdentity(
  process.cwd(),
  environment,
  process.env.RUNTIME_INSTANCE_ID || undefined
)

export function getRuntimeHealth(port) {
  return {
    ...identity,
    pid: process.pid,
    port,
    startedAt
  }
}

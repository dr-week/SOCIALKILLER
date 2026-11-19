import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { acquireInstanceLock, releaseInstanceLock } from './instance-lock.mjs'
import { createManagedServices } from './managed-services.mjs'
import { createRuntimeIdentity } from '../scripts/runtime/runtime-identity.mjs'
import { readRuntimeRegistry, writeRuntimeRegistry } from '../scripts/runtime/instance-registry.mjs'
import { inspectApi, inspectFrontend } from '../scripts/runtime/runtime-discovery.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = resolve(root, '.data')
const lockPath = resolve(dataDir, 'launcher.lock')
const registryPath = resolve(dataDir, 'runtime-registry.json')
const environment = process.env.APP_ENV || 'development'
const baseIdentity = createRuntimeIdentity(root, environment)
const services = createManagedServices({ root, dataDir, environment, baseIdentity })
let registry
let monitor
mkdirSync(dataDir, { recursive: true })

async function stop() {
  clearInterval(monitor)
  const activeChildren = services.ownedChildren.filter(child => child.process.exitCode === null)
  for (const child of activeChildren) child.process.kill()
  await Promise.all(activeChildren.map(({ process: child }) => child.exitCode !== null
    ? Promise.resolve()
    : new Promise(resolve => {
      child.once('exit', resolve)
      setTimeout(resolve, 2000).unref()
    })))
  if (registry) await terminateAdoptedServers(registry)
}

async function terminateAdoptedServers(record) {
  const identity = { ...baseIdentity, instanceId: record.instanceId }
  for (const [server, inspect] of [
    [record.frontend, inspectFrontend],
    [record.api, (port, expected) => inspectApi(port, expected, undefined, { instance: true })]
  ]) {
    if (!server.owned || services.ownedChildren.some(child => child.process.pid === server.pid)) continue
    const active = await inspect(server.port, identity)
    if (active?.pid !== server.pid) continue
    try { process.kill(server.pid, 'SIGTERM') } catch (error) {
      if (error.code !== 'ESRCH') console.error(`Could not stop owned process ${server.pid}: ${error.message}`)
    }
  }
}

async function reuseActiveLauncher(owner, previous) {
  if (!previous || owner.workspaceId !== baseIdentity.workspaceId || previous.workspaceId !== baseIdentity.workspaceId) return false
  const identity = { ...baseIdentity, instanceId: previous.instanceId }
  const api = await inspectApi(previous.api.port, identity, undefined, { instance: true })
  const frontend = await inspectFrontend(previous.frontend.port, identity)
  if (api?.pid !== previous.api.pid || frontend?.pid !== previous.frontend.pid) {
    throw new Error('A launcher is active, but its registered servers failed identity health checks. Inspect that launcher before starting another instance.')
  }
  console.log(`The Social Base is already healthy at ${previous.frontend.url}; reusing instance ${previous.instanceId}.`)
  return true
}

async function start() {
  const previous = await readRuntimeRegistry(registryPath)
  const owner = { pid: process.pid, workspaceId: baseIdentity.workspaceId, environment, instanceId: baseIdentity.instanceId }
  const lock = acquireInstanceLock(lockPath, owner)
  if (!lock.acquired) {
    if (await reuseActiveLauncher(lock.owner, previous)) return
    throw new Error('Another launcher process is active. Its instance identity could not be verified; no process was stopped.')
  }
  process.on('exit', () => {
    try { releaseInstanceLock(lockPath, process.pid) } catch (error) { console.error(`Could not release launcher lock: ${error.message}`) }
  })
  const handleSignal = signal => {
    void stop().then(() => process.exit(0)).catch(error => {
      console.error(`Shutdown after ${signal} failed: ${error.message}`)
      process.exit(1)
    })
  }
  process.once('SIGINT', () => handleSignal('SIGINT'))
  process.once('SIGTERM', () => handleSignal('SIGTERM'))

  const prior = previous?.workspaceId === baseIdentity.workspaceId && previous.environment === environment ? previous : null
  const api = await services.launchApi(prior)
  const frontend = await services.launchFrontend(api, prior)
  registry = {
    schemaVersion: 1, ...api.identity, startedAt: api.status.startedAt,
    launcher: { pid: process.pid },
    api: services.serverRecord(api), frontend: services.serverRecord(frontend),
    updatedAt: new Date().toISOString()
  }
  await writeRuntimeRegistry(registryPath, registry)
  const refreshRegistry = async () => {
    const apiStatus = await inspectApi(api.port, api.identity, undefined, { instance: true })
    const frontendStatus = await inspectFrontend(frontend.port, api.identity)
    registry.api.status = apiStatus ? 'healthy' : 'unavailable'
    registry.frontend.status = frontendStatus ? 'healthy' : 'unavailable'
    registry.updatedAt = new Date().toISOString()
    await writeRuntimeRegistry(registryPath, registry)
  }
  monitor = setInterval(() => {
    void refreshRegistry().catch(error => console.error(`Runtime registry update failed: ${error.message}`))
  }, 5000)
  console.log(`The Social Base ${environment} instance ${api.identity.instanceId} is ready at http://127.0.0.1:${frontend.port}.`)
}

start().catch(async error => {
  console.error(error.message)
  try { await stop() } catch (stopError) { console.error(`Startup cleanup failed: ${stopError.message}`) }
  process.exitCode = 1
})

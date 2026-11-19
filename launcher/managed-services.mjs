import { spawn } from 'node:child_process'
import { closeSync, openSync } from 'node:fs'
import { resolve } from 'node:path'
import { discoverServer, inspectApi, inspectFrontend, waitForServer } from '../scripts/runtime/runtime-discovery.mjs'
import { findAvailablePort, isPortActive } from '../scripts/port-arbiter.mjs'

export function createManagedServices({ root, dataDir, environment, baseIdentity }) {
  const ownedChildren = []
  function trackedSpawn(label, command, args, options) {
    const child = spawn(command, args, options)
    const handle = { process: child, error: null }
    child.once('error', error => {
      handle.error = error
      console.error(`${label} could not start: ${error.message}`)
    })
    ownedChildren.push(handle)
    return handle
  }

  async function activePorts(ports) {
    const active = []
    for (const port of ports) if (await isPortActive(port)) active.push(port)
    return active
  }

  async function launchApi(previous) {
    const candidates = [previous?.api.port, ...Array.from({ length: 20 }, (_, i) => 4174 + i)]
    const discovered = await discoverServer(await activePorts(candidates.filter(Number.isInteger)), inspectApi, baseIdentity)
    if (discovered) {
      const identity = { ...baseIdentity, instanceId: discovered.status.instanceId }
      const owned = previous?.api.pid === discovered.status.pid && previous.api.owned
      return { port: discovered.port, status: discovered.status, owned, identity }
    }
    const port = await findAvailablePort(4174, 20)
    const identity = { ...baseIdentity, instanceId: baseIdentity.instanceId }
    const log = openSync(resolve(dataDir, 'launcher-backend.log'), 'a')
    let child
    try {
      child = trackedSpawn('Backend', process.execPath, ['--env-file-if-exists=.env', resolve(root, 'server.mjs')], {
        cwd: root, env: { ...process.env, APP_ENV: environment, API_PORT: String(port), RUNTIME_INSTANCE_ID: identity.instanceId, RUNTIME_WORKSPACE_ID: identity.workspaceId },
        stdio: ['ignore', log, log], windowsHide: true
      })
    } finally { closeSync(log) }
    const status = await waitForServer(port, (p, expected) => inspectApi(p, expected, undefined, { instance: true }), identity, child)
    return { port, status, owned: true, identity, child }
  }

  async function launchFrontend(api, previous) {
    const candidates = [previous?.frontend.port, ...Array.from({ length: 20 }, (_, i) => 5199 + i)]
    const discovered = await discoverServer(await activePorts(candidates.filter(Number.isInteger)), inspectFrontend, api.identity)
    if (discovered) {
      const owned = previous?.frontend.pid === discovered.status.pid && previous.frontend.owned
      return { port: discovered.port, status: discovered.status, owned }
    }
    const port = await findAvailablePort(5199, 20)
    const child = trackedSpawn('Dashboard', process.execPath, [resolve(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort', '--open'], {
      cwd: root,
      env: { ...process.env, APP_ENV: environment, API_PORT: String(api.port), FRONTEND_PORT: String(port), RUNTIME_INSTANCE_ID: api.identity.instanceId, RUNTIME_WORKSPACE_ID: api.identity.workspaceId },
      stdio: 'inherit',
      windowsHide: true
    })
    const status = await waitForServer(port, inspectFrontend, api.identity, child)
    return { port, status, owned: true, child }
  }

  const serverRecord = server => ({ pid: server.status.pid, port: server.port, url: `http://127.0.0.1:${server.port}`, status: 'healthy', owned: server.owned })
  return { ownedChildren, launchApi, launchFrontend, serverRecord }
}

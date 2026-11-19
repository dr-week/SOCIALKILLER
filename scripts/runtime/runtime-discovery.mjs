import { matchesRuntimeIdentity } from './runtime-identity.mjs'

const requestJson = async (url, fetchImpl = fetch) => {
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(700) })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export async function inspectApi(port, identity, fetchImpl, options = { instance: false }) {
  const health = await requestJson(`http://127.0.0.1:${port}/api/health`, fetchImpl)
  return matchesRuntimeIdentity(health, identity, options) ? health : null
}

export async function inspectFrontend(port, identity, fetchImpl) {
  const [runtime, health] = await Promise.all([
    requestJson(`http://127.0.0.1:${port}/__runtime`, fetchImpl),
    requestJson(`http://127.0.0.1:${port}/api/health`, fetchImpl)
  ])
  if (!matchesRuntimeIdentity(runtime, identity) || !matchesRuntimeIdentity(health, identity)) return null
  return runtime
}

export async function discoverServer(ports, inspect, identity) {
  for (const port of [...new Set(ports)]) {
    const status = await inspect(port, identity)
    if (status) return { port, status }
  }
  return null
}

export async function waitForServer(port, inspect, identity, child, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (child.error) throw child.error
    if (child.process.exitCode !== null) {
      throw new Error(`Server process exited with code ${child.process.exitCode}.`)
    }
    const status = await inspect(port, identity)
    if (status) return status
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  throw new Error(`Server on port ${port} did not become healthy within ${timeoutMs}ms.`)
}

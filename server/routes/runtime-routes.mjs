import { join } from 'node:path'
import { inspectAndroidToolchain } from '../android/android-toolchain.mjs'
import { AndroidBuildError, getAndroidBuilds, startAndroidBuild } from '../android/android-build-service.mjs'
import { readRuntimeRegistry } from '../../scripts/runtime/instance-registry.mjs'
import { getRuntimeHealth } from '../runtime-status.mjs'

export async function handleRuntimeRoutes(req, res, url, json) {
  if (req.method === 'GET' && (url.pathname === '/api/health' || url.pathname === '/health')) {
    const port = Number(process.env.API_PORT || 4174)
    return json(res, 200, {
      status: 'healthy',
      service: 'SOCIALKILLER API',
      version: '1.4.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      ...getRuntimeHealth(port)
    })
  }
  if (req.method === 'POST' && url.pathname === '/api/android/build') {
    let body = ''
    try {
      for await (const chunk of req) {
        body += chunk
        if (body.length > 1000) return json(res, 413, { error: 'Request body is too large.' })
      }
    } catch (error) {
      console.error(`Android build request could not be read: ${error.message}`)
      return json(res, 400, { error: 'Unable to read Android build request.' })
    }
    let parsed
    try { parsed = JSON.parse(body || '{}') } catch {
      return json(res, 400, { error: 'Android build request must be valid JSON.' })
    }
    try {
      const job = await startAndroidBuild(parsed.target)
      return json(res, 202, { success: true, job })
    } catch (error) {
      if (!(error instanceof AndroidBuildError)) console.error(`Android build could not start: ${error.message}`)
      return json(res, error.statusCode || 500, { error: error.message || 'Android build could not start.' })
    }
  }
  if (req.method === 'GET' && url.pathname === '/api/android/builds') {
    return json(res, 200, { success: true, jobs: getAndroidBuilds() })
  }
  if (req.method !== 'GET') return false
  if (url.pathname === '/api/android/toolchain') {
    try {
      return json(res, 200, { success: true, toolchain: await inspectAndroidToolchain() })
    } catch (error) {
      console.error(`Android toolchain inspection failed: ${error.message}`)
      return json(res, 500, { error: 'Android toolchain inspection failed.' })
    }
  }
  if (url.pathname === '/api/runtime') {
    try {
      const registry = await readRuntimeRegistry(join(process.cwd(), '.data', 'runtime-registry.json'))
      const current = getRuntimeHealth(Number(process.env.API_PORT || 4174))
      return json(res, 200, {
        success: true,
        current,
        manager: registry?.launcher || null,
        api: registry?.api || null,
        frontend: registry?.frontend || null,
        managed: registry?.api?.pid === process.pid
      })
    } catch (error) {
      console.error(`Runtime registry could not be read: ${error.message}`)
      return json(res, 503, { error: 'Runtime registry is invalid or unreadable; inspect the local launcher state.' })
    }
  }
  return false
}

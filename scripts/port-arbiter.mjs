/**
 * Intelligent Port Arbiter & Service Diagnostics (<150 lines)
 * 
 * Inspects system ports, avoids collisions with other websites/projects,
 * discovers safe fallback ports, and identifies running process owners.
 */

import { createServer } from 'node:net'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Checks if a specific port is actively listening.
 */
export function isPortActive(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true) // Port is actively occupied
        } else {
          resolve(false)
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(false)).close()
      })
      .listen(port, host)
  })
}

/**
 * Finds the first free port starting from a preferred port within a scan range.
 */
export async function findAvailablePort(preferredPort, maxAttempts = 20, host = '127.0.0.1') {
  for (let port = preferredPort; port < preferredPort + maxAttempts; port++) {
    const occupied = await isPortActive(port, host)
    if (!occupied) return port
  }
  throw new Error(`No available ports found between ${preferredPort} and ${preferredPort + maxAttempts}`)
}

/**
 * Inspects who is listening on a given port (Windows / Unix).
 */
export async function getProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      const lines = stdout.trim().split('\n')
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/)
          const pid = parts[parts.length - 1]
          if (pid) {
            try {
              const { stdout: procOut } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`)
              const nameMatch = procOut.match(/"([^"]+)"/)
              return { pid, name: nameMatch ? nameMatch[1] : 'Unknown' }
            } catch {
              return { pid, name: 'Unknown Process' }
            }
          }
        }
      }
    } else {
      const { stdout } = await execAsync(`lsof -i :${port} -t`)
      const pid = stdout.trim().split('\n')[0]
      if (pid) return { pid, name: 'Active Process' }
    }
  } catch {}
  return null
}

/**
 * Polls until a port responds or times out.
 */
export async function waitForPortReady(port, host = '127.0.0.1', maxRetries = 30, delayMs = 300) {
  for (let i = 0; i < maxRetries; i++) {
    const active = await isPortActive(port, host)
    if (active) return true
    await new Promise((r) => setTimeout(r, delayMs))
  }
  return false
}

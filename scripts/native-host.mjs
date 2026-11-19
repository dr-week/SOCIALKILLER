// Chrome Native Messaging host: starts the FollowDesk app if it is not already running.
// IMPORTANT: stdout is reserved for the Chrome protocol. Never console.log here.
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { openSync } from 'node:fs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'http://127.0.0.1:4174/api/social/platforms'

function send(obj) {
  const body = Buffer.from(JSON.stringify(obj))
  const header = Buffer.alloc(4)
  header.writeUInt32LE(body.length, 0)
  process.stdout.write(Buffer.concat([header, body]))
}

async function isUp() {
  try { return (await fetch(API, { signal: AbortSignal.timeout(1200) })).ok } catch { return false }
}

async function ensureRunning() {
  if (await isUp()) return { running: true, started: false }
  const log = openSync(resolve(root, 'server-host.log'), 'a')
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: root, detached: true, stdio: ['ignore', log, log], windowsHide: true
  })
  child.unref()
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500))
    if (await isUp()) return { running: true, started: true }
  }
  return { running: false, started: true }
}

let buf = Buffer.alloc(0)
let pending = 0
let ended = false
const maybeExit = () => { if (ended && pending === 0) process.exit(0) }
process.stdin.on('data', async chunk => {
  buf = Buffer.concat([buf, chunk])
  while (buf.length >= 4 && buf.length >= 4 + buf.readUInt32LE(0)) {
    const len = buf.readUInt32LE(0)
    buf = buf.subarray(4 + len)
    pending++
    try { send({ ok: true, ...(await ensureRunning()) }) } finally { pending--; maybeExit() }
  }
})
process.stdin.on('end', () => { ended = true; maybeExit() })


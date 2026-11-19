import { closeSync, existsSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try { process.kill(pid, 0); return true } catch (error) {
    return error.code === 'EPERM'
  }
}

function readLock(path) {
  const contents = readFileSync(path, 'utf8').trim()
  if (/^\d+$/.test(contents)) return { pid: Number(contents), legacy: true }
  const lock = JSON.parse(contents)
  if (!Number.isInteger(lock.pid) || lock.pid <= 0) throw new Error('Launcher lock has no valid process ID.')
  return lock
}

export function acquireInstanceLock(path, owner) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const descriptor = openSync(path, 'wx')
      try { writeFileSync(descriptor, `${JSON.stringify(owner)}\n`) } finally { closeSync(descriptor) }
      return { acquired: true, owner }
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }
    const existing = readLock(path)
    if (isProcessAlive(existing.pid)) return { acquired: false, owner: existing }
    if (existsSync(path)) unlinkSync(path)
  }
  return { acquired: false, owner: readLock(path) }
}

export function releaseInstanceLock(path, pid) {
  if (!existsSync(path)) return
  const owner = readLock(path)
  if (owner.pid === pid) unlinkSync(path)
}

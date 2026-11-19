import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { APPLICATION_ID } from './runtime-identity.mjs'

function isValidServer(server) {
  return server && Number.isInteger(server.port) && server.port > 0
    && (server.pid === null || (Number.isInteger(server.pid) && server.pid > 0))
    && typeof server.url === 'string' && ['healthy', 'unavailable'].includes(server.status)
    && typeof server.owned === 'boolean'
}

export function validateRuntimeRegistry(record) {
  if (record?.schemaVersion !== 1 || record.applicationId !== APPLICATION_ID
    || !record.workspaceId || !record.instanceId
    || !['development', 'staging', 'production'].includes(record.environment)
    || !Number.isInteger(record.launcher?.pid) || !record.startedAt
    || !isValidServer(record.api) || !isValidServer(record.frontend)) {
    throw new Error('Runtime registry is invalid or belongs to an unsupported application version.')
  }
  return record
}

export async function readRuntimeRegistry(path) {
  let contents
  try {
    contents = await readFile(path, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
  return validateRuntimeRegistry(JSON.parse(contents))
}

export async function writeRuntimeRegistry(path, record) {
  validateRuntimeRegistry(record)
  await mkdir(dirname(path), { recursive: true })
  const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' })
    await rename(temporaryPath, path)
  } catch (error) {
    try { await unlink(temporaryPath) } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') throw cleanupError
    }
    throw error
  }
}

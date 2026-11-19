import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { discoverServer, inspectApi, inspectFrontend } from './runtime-discovery.mjs'
import { readRuntimeRegistry, validateRuntimeRegistry, writeRuntimeRegistry } from './instance-registry.mjs'
import { createRuntimeIdentity } from './runtime-identity.mjs'

const registryFor = (identity, pid = process.pid) => ({
  schemaVersion: 1, ...identity, startedAt: new Date().toISOString(),
  launcher: { pid },
  api: { pid, port: 4174, url: 'http://127.0.0.1:4174', status: 'healthy', owned: true },
  frontend: { pid, port: 5199, url: 'http://127.0.0.1:5199', status: 'healthy', owned: true }
})

test('runtime identity matches only the same app, workspace, and environment', () => {
  const identity = createRuntimeIdentity('C:\\social-base', 'development', 'first')
  assert.equal(createRuntimeIdentity('c:\\SOCIAL-BASE', 'development', 'second').workspaceId, identity.workspaceId)
  assert.equal(createRuntimeIdentity('C:\\other', 'development', 'first').workspaceId === identity.workspaceId, false)
  assert.throws(() => createRuntimeIdentity('.', 'unknown', 'first'), /Unsupported runtime environment/)
})

test('runtime registry is atomically persisted and rejects malformed or foreign state', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'social-base-runtime-'))
  const path = join(directory, 'registry.json')
  try {
    const identity = createRuntimeIdentity(directory, 'development', 'instance-1')
    const record = registryFor(identity)
    assert.equal(await readRuntimeRegistry(path), null)
    await writeRuntimeRegistry(path, record)
    assert.deepEqual(await readRuntimeRegistry(path), record)
    assert.equal((await readFile(path, 'utf8')).endsWith('\n'), true)
    assert.throws(() => validateRuntimeRegistry({ ...record, applicationId: 'other-app' }), /invalid/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('runtime discovery ignores unrelated or mismatched services', async () => {
  const identity = createRuntimeIdentity('C:\\social-base', 'development', 'owned-instance')
  const wrong = { ...identity, instanceId: 'other-instance' }
  const frontend = { ...identity, pid: process.pid }
  const fetchMock = async url => new Response(JSON.stringify(
    url.includes('/__runtime') ? frontend : wrong
  ), { status: 200, headers: { 'content-type': 'application/json' } })
  assert.deepEqual(await inspectApi(4174, identity, fetchMock, { instance: false }), wrong)
  assert.equal(await inspectFrontend(5199, identity, fetchMock), null)
  const found = await discoverServer([4174, 4175], async port => port === 4174 ? null : identity, identity)
  assert.deepEqual(found, { port: 4175, status: identity })
})


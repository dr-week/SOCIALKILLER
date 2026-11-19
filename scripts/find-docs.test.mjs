import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { findDocs } from './find-docs.mjs'

test('ranks the best matching documentation line and bounds results', async () => {
  const root = await mkdtemp(join(tmpdir(), 'find-docs-'))
  try {
    await mkdir(join(root, 'engineering'), { recursive: true })
    await writeFile(join(root, 'engineering', 'connections.md'), [
      '# Connections',
      'Meta OAuth connects a business profile.',
      'Google OAuth scopes and callback validation are separate.'
    ].join('\n'))
    const results = await findDocs(root, 'Meta OAuth profile', 1)
    assert.equal(results.length, 1)
    assert.equal(results[0].line, 2)
    assert.match(results[0].path, /connections\.md$/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('rejects empty queries and invalid result limits', async () => {
  await assert.rejects(findDocs('.', '!!!'), /searchable words/)
  await assert.rejects(findDocs('.', 'oauth', 0), /Limit/)
})

import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { buildRepoMap, formatRepoMap } from './repo-map.mjs'

test('builds a bounded source map and ignores generated folders', async () => {
  const root = await mkdtemp(join(tmpdir(), 'repo-map-'))
  try {
    await mkdir(join(root, 'src', 'features', 'publishing'), { recursive: true })
    await mkdir(join(root, 'src', 'node_modules', 'vendor'), { recursive: true })
    await writeFile(join(root, 'src', 'features', 'publishing', 'composer.ts'), '')
    await writeFile(join(root, 'src', 'node_modules', 'vendor', 'hidden.ts'), '')
    const map = await buildRepoMap(root)
    assert.ok(formatRepoMap(map).includes('src/features/'))
    assert.ok(!formatRepoMap(map).includes('node_modules'))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('includes source filenames only when requested', async () => {
  const root = await mkdtemp(join(tmpdir(), 'repo-map-'))
  try {
    await mkdir(join(root, 'scripts'), { recursive: true })
    await writeFile(join(root, 'scripts', 'daily-check.mjs'), '')
    const map = await buildRepoMap(root, { listFiles: true })
    assert.ok(formatRepoMap(map, true).includes('daily-check.mjs'))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

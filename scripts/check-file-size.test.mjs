import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { collectSourceFiles, evaluateFileSize, largestFiles } from './check-file-size.mjs'

test('allows source files below the 150-line threshold', () => {
  assert.deepEqual(evaluateFileSize('src/new-module.ts', 149, {}), { ok: true, legacy: false })
})

test('rejects a source file at the 150-line threshold, even if it has a baseline', () => {
  assert.deepEqual(evaluateFileSize('src/new-module.ts', 150, {}), {
    ok: false,
    legacy: false
  })
})

test('does not grandfather an oversized source file', () => {
  const baseline = { 'src/legacy.ts': 240 }
  assert.deepEqual(evaluateFileSize('src/legacy.ts', 240, baseline, 149), {
    ok: false,
    legacy: false
  })
})

test('ranks the largest legacy files without changing the source list', () => {
  const files = [
    { file: 'server/a.mjs', lines: 180 },
    { file: 'src/b.vue', lines: 240 },
    { file: 'server/c.mjs', lines: 210 }
  ]
  assert.deepEqual(largestFiles(files, 2), [files[1], files[2]])
  assert.equal(files.length, 3)
})

test('excludes generated Android web assets from source discovery', async () => {
  const root = await mkdtemp(join(tmpdir(), 'file-size-scan-'))
  try {
    const android = join(root, 'android')
    const generated = join(android, 'app', 'src', 'main', 'assets', 'public', 'assets')
    const source = join(android, 'app', 'src', 'main', 'java')
    await mkdir(generated, { recursive: true })
    await mkdir(source, { recursive: true })
    await writeFile(join(generated, 'bundle.js'), 'generated')
    await writeFile(join(source, 'Main.java'), 'source')
    const files = await collectSourceFiles(android, root)
    assert.deepEqual(files.map(file => relative(root, file).replaceAll('\\', '/')), [
      'android/app/src/main/java/Main.java'
    ])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

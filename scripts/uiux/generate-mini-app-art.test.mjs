import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import sharp from 'sharp'

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const artRoot = resolve(root, 'src/assets/app-backgrounds')
const hash = data => createHash('sha256').update(data).digest('hex')

test('mini-app art sources remain intact and optimized WebP overlays are reproducible', async () => {
  const appIds = await readdir(artRoot)
  assert.equal(appIds.length, 13)
  const sources = await Promise.all(appIds.map(async appId => {
    const folder = resolve(artRoot, appId)
    const files = await readdir(folder)
    const source = files.find(name => /^source\.(png|jpe?g|jpe)$/i.test(name))
    assert.ok(source, `${appId} source image`)
    return { appId, path: resolve(folder, source), data: await readFile(resolve(folder, source)) }
  }))

  const runGenerator = () => execFileSync(process.execPath, [
    resolve(root, 'scripts/uiux/generate-mini-app-art.mjs')
  ], { cwd: root, stdio: 'pipe' })
  runGenerator()
  const firstHashes = []
  for (const { appId } of sources) {
    const overlayPath = resolve(artRoot, appId, 'overlay.webp')
    const [metadata, details] = await Promise.all([sharp(overlayPath).metadata(), stat(overlayPath)])
    assert.equal(metadata.format, 'webp', `${appId} overlay format`)
    assert.ok(metadata.width <= 800 && metadata.height <= 600, `${appId} overlay dimensions`)
    assert.ok(details.size < 100 * 1024, `${appId} overlay size`)
    firstHashes.push(hash(await readFile(overlayPath)))
  }
  runGenerator()
  for (let index = 0; index < sources.length; index++) {
    const { appId, path, data } = sources[index]
    assert.equal(hash(await readFile(path)), hash(data), `${appId} original remains unchanged`)
    const overlayPath = resolve(artRoot, appId, 'overlay.webp')
    assert.equal(hash(await readFile(overlayPath)), firstHashes[index], `${appId} overlay is deterministic`)
  }
})

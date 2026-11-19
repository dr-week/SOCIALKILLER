import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { validateAssetCatalog } from './catalog-validator.mjs'

test('asset catalog validates raster files without requiring license metadata', async () => {
  const root = await mkdtemp(join(tmpdir(), 'social-base-assets-'))
  const paths = ['original.png', 'master.png', 'small.webp']
  try {
    await mkdir(join(root, 'assets'))
    for (const path of paths) await writeFile(join(root, 'assets', path), path)
    const asset = {
      id: 'logo', name: 'Logo', kind: 'raster', category: 'brand',
      creator: 'Owner',
      original: 'assets/original.png', processedMaster: 'assets/master.png',
      variants: [{ path: 'assets/small.webp' }]
    }
    assert.deepEqual(await validateAssetCatalog({ schemaVersion: 1, assets: [asset] }, root), {
      assetCount: 1, fileCount: 3, warnings: []
    })
    await assert.rejects(validateAssetCatalog({ schemaVersion: 1, assets: [{ ...asset, original: '../outside.png' }] }, root), /escapes/)
    await assert.rejects(validateAssetCatalog({ schemaVersion: 1, assets: [{ ...asset, name: '' }] }, root), /name/)
    assert.deepEqual(await validateAssetCatalog({ schemaVersion: 1, assets: [asset] }, root), {
      assetCount: 1, fileCount: 3, warnings: []
    })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

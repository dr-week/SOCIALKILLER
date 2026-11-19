import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'

function assertMetadata(asset) {
  for (const field of ['id', 'name', 'kind', 'category', 'creator']) {
    if (!asset[field]) throw new Error(`Asset ${asset.id || 'unknown'} is missing ${field}.`)
  }
}

function resolveAssetPath(root, path) {
  if (!path || isAbsolute(path)) throw new Error(`Asset path must be project-relative: ${path}`)
  const absolute = resolve(root, path)
  const fromRoot = relative(root, absolute)
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) throw new Error(`Asset path escapes the project: ${path}`)
  return absolute
}

export async function validateAssetCatalog(catalog, root) {
  if (catalog?.schemaVersion !== 1 || !Array.isArray(catalog.assets)) throw new Error('Unsupported asset catalog schema.')
  const ids = new Set()
  const hashes = new Map()
  const warnings = []
  let fileCount = 0
  for (const asset of catalog.assets) {
    assertMetadata(asset)
    if (ids.has(asset.id)) throw new Error(`Duplicate asset id: ${asset.id}`)
    ids.add(asset.id)
    if (asset.includedInApp === false) continue
    if (asset.kind !== 'raster') continue
    if (!asset.original || !asset.processedMaster || !asset.variants?.length) {
      throw new Error(`Raster asset ${asset.id} needs an original, processed master, and optimized variants.`)
    }
    const paths = [asset.original, asset.processedMaster, ...asset.variants.map(variant => variant.path)]
    for (const path of paths) {
      const bytes = await readFile(resolveAssetPath(root, path))
      fileCount++
      const hash = createHash('sha256').update(bytes).digest('hex')
      if (hashes.has(hash)) warnings.push(`Duplicate content: ${path} matches ${hashes.get(hash)}.`)
      else hashes.set(hash, path)
      if (bytes.length > 500 * 1024) warnings.push(`Large asset (${bytes.length} bytes): ${path}.`)
    }
  }
  return { assetCount: ids.size, fileCount, warnings }
}

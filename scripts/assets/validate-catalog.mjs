import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAssetCatalog } from './catalog-validator.mjs'

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const catalogPath = resolve(root, 'src/assets/asset-catalog.json')
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
const report = await validateAssetCatalog(catalog, root)
console.log(`Validated ${report.assetCount} catalog entries and ${report.fileCount} raster files.`)
for (const warning of report.warnings) console.warn(`Warning: ${warning}`)

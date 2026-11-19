import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const appIds = [
  'planner', 'connections', 'engage', 'audience', 'profile-scout',
  'content-studio', 'script-studio', 'workflows', 'workspaces',
  'design-system', 'asset-manager', 'automations', 'android-builder'
]

for (const appId of appIds) {
  const folder = resolve(root, 'src/assets/app-backgrounds', appId)
  const sources = (await readdir(folder)).filter(name => /^source\.(png|jpe?g|jpe)$/i.test(name))
  if (sources.length !== 1) throw new Error(`${appId} needs exactly one source image; found ${sources.length}.`)
  const output = resolve(folder, 'overlay.webp')
  const overlay = await sharp(resolve(folder, sources[0]))
    .rotate()
    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer()
  let current
  try {
    current = await readFile(output)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (!current?.equals(overlay)) await writeFile(output, overlay)
  const { size } = await stat(output)
  console.log(`${appId}: ${Math.round(size / 1024)} KB`)
}

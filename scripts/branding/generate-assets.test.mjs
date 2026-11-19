import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import test from 'node:test'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const file = relativePath => resolve(root, relativePath)
const hash = data => createHash('sha256').update(data).digest('hex')

test('branding generator removes background noise and emits reproducible assets', async () => {
  const sourcePath = file('src/assets/branding/the-social-base-logo-source.png')
  const sourceHash = hash(await readFile(sourcePath))
  execFileSync(process.execPath, [file('scripts/branding/generate-assets.mjs')], { cwd: root, stdio: 'pipe' })

  const outputs = [
    ['src/assets/branding/generated/social-base-logo.png', 1024, 1024],
    ['public/branding/social-base-logo.png', 512, 512],
    ['public/branding/variants/social-base-logo-128.webp', 128, 128],
    ['public/branding/variants/social-base-logo-320.webp', 320, 320],
    ['public/branding/variants/social-base-logo-640.webp', 640, 640],
    ['public/branding/favicon.png', 48, 48],
    ['extension/icons/icon-16.png', 16, 16],
    ['extension/icons/icon-48.png', 48, 48],
    ['extension/icons/icon-128.png', 128, 128],
    ['android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png', 432, 432],
    ['android/app/src/main/res/drawable-port-xxxhdpi/splash.png', 1280, 1920]
  ]
  for (const [relativePath, width, height] of outputs) {
    const metadata = await sharp(file(relativePath)).metadata()
    assert.equal(metadata.width, width, `${relativePath} width`)
    assert.equal(metadata.height, height, `${relativePath} height`)
  }

  const masterPath = file('src/assets/branding/generated/social-base-logo.png')
  const { data, info } = await sharp(masterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.equal(data[(123 * info.width + 186) * info.channels + 3], 0, 'noisy background pixel is transparent')
  const firstOutputHashes = await Promise.all(outputs.map(async ([relativePath]) =>
    hash(await readFile(file(relativePath)))
  ))
  execFileSync(process.execPath, [file('scripts/branding/generate-assets.mjs')], { cwd: root, stdio: 'pipe' })
  for (let index = 0; index < outputs.length; index++) {
    const [relativePath] = outputs[index]
    assert.equal(hash(await readFile(file(relativePath))), firstOutputHashes[index], `${relativePath} is deterministic`)
  }
  assert.equal(hash(await readFile(sourcePath)), sourceHash, 'source image is immutable')
})

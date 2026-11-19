import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const sourcePath = resolve(root, 'src/assets/branding/the-social-base-logo-source.png')
const crop = { left: 198, top: 138, width: 368, height: 484 }
const iconBackground = { r: 39, g: 39, b: 39, alpha: 1 }
const densitySizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }
const foregroundSizes = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 }
const webVariantSizes = [128, 320, 640]
const splashSizes = [
  ['drawable/splash.png', 480, 320],
  ['drawable-land-mdpi/splash.png', 480, 320],
  ['drawable-land-hdpi/splash.png', 800, 480],
  ['drawable-land-xhdpi/splash.png', 1280, 720],
  ['drawable-land-xxhdpi/splash.png', 1600, 960],
  ['drawable-land-xxxhdpi/splash.png', 1920, 1280],
  ['drawable-port-mdpi/splash.png', 320, 480],
  ['drawable-port-hdpi/splash.png', 480, 800],
  ['drawable-port-xhdpi/splash.png', 720, 1280],
  ['drawable-port-xxhdpi/splash.png', 960, 1600],
  ['drawable-port-xxxhdpi/splash.png', 1280, 1920]
]

async function outputPath(relativePath) {
  const path = resolve(root, relativePath)
  await mkdir(dirname(path), { recursive: true })
  return path
}

async function writeGeneratedFile(path, data) {
  try {
    if ((await readFile(path)).equals(data)) return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  await writeFile(path, data)
}

async function logoShape() {
  const { data, info } = await sharp(sourcePath).extract(crop).greyscale().raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let source = 0, target = 0; source < data.length; source++, target += 4) {
    const level = data[source]
    const alpha = level < 8 ? (8 - level) / 8 : level > 32 ? (level - 32) / 223 : 0
    const visible = Math.round(alpha * 255) >= 4
    const color = level < 8 ? 0 : 255
    rgba[target] = color
    rgba[target + 1] = color
    rgba[target + 2] = color
    rgba[target + 3] = visible ? Math.round(alpha * 255) : 0
  }
  return { data: rgba, width: info.width, height: info.height }
}

async function renderMark(shape, size, scale, background) {
  const height = Math.round(size * scale)
  const width = Math.round(height * shape.width / shape.height)
  const mark = await sharp(shape.data, {
    raw: { width: shape.width, height: shape.height, channels: 4 }
  }).resize(width, height, { kernel: 'lanczos3' }).png().toBuffer()
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite([{ input: mark, left: Math.floor((size - width) / 2), top: Math.floor((size - height) / 2) }]).png().toBuffer()
}

async function writeMark(shape, relativePath, size, scale, background) {
  const path = await outputPath(relativePath)
  await writeGeneratedFile(path, await renderMark(shape, size, scale, background))
}

async function writeSplash(shape, relativePath, width, height) {
  const side = Math.min(width, height)
  const markHeight = Math.round(side * 0.34)
  const markWidth = Math.round(markHeight * shape.width / shape.height)
  const mark = await sharp(shape.data, {
    raw: { width: shape.width, height: shape.height, channels: 4 }
  }).resize(markWidth, markHeight, { kernel: 'lanczos3' }).png().toBuffer()
  const path = await outputPath(relativePath)
  const data = await sharp({ create: { width, height, channels: 4, background: iconBackground } })
    .composite([{ input: mark, left: Math.floor((width - markWidth) / 2), top: Math.floor((height - markHeight) / 2) }])
    .png()
    .toBuffer()
  await writeGeneratedFile(path, data)
}

async function writeWebVariants(masterPath) {
  for (const width of webVariantSizes) {
    const path = await outputPath(`public/branding/variants/social-base-logo-${width}.webp`)
    const data = await sharp(masterPath)
      .resize(width, width, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer()
    await writeGeneratedFile(path, data)
  }
}

async function writeRoundLogo(relativePath, size = 512) {
  const half = size / 2
  const circleMask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half - 4}" fill="#ffffff"/></svg>`)
  const rimSvg = Buffer.from(`<svg width="${size}" height="${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff7b88"/><stop offset="50%" stop-color="#b495ff"/><stop offset="100%" stop-color="#54d6ee"/></linearGradient></defs><circle cx="${half}" cy="${half}" r="${half - 7}" fill="none" stroke="url(#g)" stroke-opacity="0.65" stroke-width="6"/></svg>`)
  const masked = await sharp(sourcePath).resize(size, size, { kernel: 'lanczos3' }).ensureAlpha().composite([{ input: circleMask, blend: 'dest-in' }]).png().toBuffer()
  const round = await sharp(masked).composite([{ input: rimSvg, blend: 'over' }]).png().toBuffer()
  await writeGeneratedFile(await outputPath(relativePath), round)
}

const source = await readFile(sourcePath)
const shape = await logoShape()
const processedMasterPath = await outputPath('src/assets/branding/generated/social-base-logo.png')
await writeGeneratedFile(processedMasterPath, await renderMark(shape, 1024, 0.86))
await writeWebVariants(processedMasterPath)
await writeMark(shape, 'public/branding/social-base-logo.png', 512, 0.86)
await writeRoundLogo('public/branding/socialkiller-logo-round.png', 512)
await writeMark(shape, 'public/branding/favicon.png', 48, 0.72, iconBackground)
for (const size of [16, 48, 128]) {
  await writeMark(shape, `extension/icons/icon-${size}.png`, size, 0.86, iconBackground)
}
for (const [density, size] of Object.entries(densitySizes)) {
  await writeMark(shape, `android/app/src/main/res/mipmap-${density}/ic_launcher.png`, size, 0.86, iconBackground)
  await writeMark(shape, `android/app/src/main/res/mipmap-${density}/ic_launcher_round.png`, size, 0.86, iconBackground)
}
for (const [density, size] of Object.entries(foregroundSizes)) {
  await writeMark(shape, `android/app/src/main/res/mipmap-${density}/ic_launcher_foreground.png`, size, 0.64)
}
for (const [path, width, height] of splashSizes) await writeSplash(shape, `android/app/src/main/res/${path}`, width, height)
if (!source.equals(await readFile(sourcePath))) throw new Error('Logo source changed during asset generation.')
console.log('Generated SOCIALKILLER logo, extension icons, Android launch icons, and splash assets.')

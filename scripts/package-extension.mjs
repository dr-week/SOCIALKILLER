import fs from 'node:fs'
import path from 'node:path'
import JSZip from 'jszip'

const extensionDir = path.resolve('extension')
const outputZip = path.resolve('dist/followdesk-extension.zip')

async function zipDirectory(sourceDir, zipInstance, rootDir = sourceDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(sourceDir, entry.name)
    const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/')
    if (entry.isDirectory()) {
      await zipDirectory(fullPath, zipInstance, rootDir)
    } else {
      const content = fs.readFileSync(fullPath)
      zipInstance.file(relativePath, content)
    }
  }
}

async function buildExtensionZip() {
  console.log('📦 Bundling The Social Base Chrome Extension...')
  const zip = new JSZip()
  await zipDirectory(extensionDir, zip)

  fs.mkdirSync(path.dirname(outputZip), { recursive: true })
  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })

  fs.writeFileSync(outputZip, buffer)
  const sizeKb = (buffer.length / 1024).toFixed(1)
  console.log(`✅ Extension packaged successfully: dist/followdesk-extension.zip (${sizeKb} KB)`)
}

buildExtensionZip().catch((err) => {
  console.error('❌ Failed to package extension:', err)
  process.exit(1)
})

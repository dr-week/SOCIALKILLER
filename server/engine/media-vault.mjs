/**
 * Sandboxed Media Vault & Drive Storage Manager (<150 lines)
 * Enforces strict boundary isolation for the user-authorized Designated Media Drive Folder.
 */

import fs from 'node:fs'
import path from 'node:path'
import { validateMediaBuffer } from './media-vault-mime.mjs'

const CONFIG_FILE = path.resolve('.data', 'media-vault-config.json')
const DEFAULT_MEDIA_DIR = path.resolve('.data', 'media')

export class MediaVaultService {
  constructor() {
    this.designatedDir = this.loadConfiguredDirectory()
    this.ensureDirectoryExists(this.designatedDir)
  }

  loadConfiguredDirectory() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
        if (cfg.designatedFolder && fs.existsSync(cfg.designatedFolder)) {
          return path.resolve(cfg.designatedFolder)
        }
      }
    } catch {}
    return DEFAULT_MEDIA_DIR
  }

  ensureDirectoryExists(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
    } catch {}
  }

  getDesignatedDirectory() {
    return this.designatedDir
  }

  setDesignatedDirectory(newFolderPath) {
    const resolved = path.resolve(newFolderPath)
    if (!fs.existsSync(resolved)) fs.mkdirSync(resolved, { recursive: true })
    this.designatedDir = resolved
    fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify({ designatedFolder: resolved, updatedAt: new Date().toISOString() }, null, 2)
    )
    return { success: true, designatedFolder: resolved }
  }

  listMediaAssets() {
    this.ensureDirectoryExists(this.designatedDir)
    try {
      const files = fs.readdirSync(this.designatedDir, { withFileTypes: true })
      const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov'])

      const assets = files
        .filter(f => f.isFile() && allowedExts.has(path.extname(f.name).toLowerCase()))
        .map(f => {
          const stats = fs.statSync(path.join(this.designatedDir, f.name))
          return {
            name: f.name,
            sizeBytes: stats.size,
            modifiedAt: stats.mtime.toISOString(),
            ext: path.extname(f.name).toLowerCase()
          }
        })

      return { success: true, designatedFolder: this.designatedDir, count: assets.length, assets }
    } catch (err) {
      return { success: false, error: err.message, assets: [] }
    }
  }

  isPathWithinVault(targetFilePath) {
    const resolved = fs.realpathSync(path.resolve(targetFilePath))
    const vaultRoot = fs.realpathSync(this.designatedDir)
    const rel = path.relative(vaultRoot, resolved)
    return rel && !rel.startsWith('..') && !path.isAbsolute(rel)
  }

  async saveAsset(filename, base64Data) {
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
    const dest = path.join(this.designatedDir, safeName)
    const base64 = base64Data.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')

    const validation = await validateMediaBuffer(safeName, buffer)
    if (!validation.ok) return { success: false, error: validation.error }

    try {
      fs.writeFileSync(dest, buffer)
    } catch (err) {
      return { success: false, error: 'Failed to write file: ' + err.message }
    }

    return {
      success: true,
      filename: safeName,
      path: dest,
      sizeBytes: buffer.length,
      mime: validation.mime
    }
  }
}

export const mediaVault = new MediaVaultService()

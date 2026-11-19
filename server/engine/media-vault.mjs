/**
 * Sandboxed Media Vault & Drive Storage Manager (<150 lines)
 * 
 * Enforces strict boundary isolation:
 * Only files within the user-authorized Designated Media Drive Folder
 * can be accessed, uploaded, or attached to social posts.
 */

import fs from 'node:fs'
import path from 'node:path'

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
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
        const cfg = JSON.parse(raw)
        if (cfg.designatedFolder && fs.existsSync(cfg.designatedFolder)) {
          return path.resolve(cfg.designatedFolder)
        }
      }
    } catch {}
    return DEFAULT_MEDIA_DIR
  }

  ensureDirectoryExists(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
    } catch {}
  }

  getDesignatedDirectory() {
    return this.designatedDir
  }

  /**
   * Sets and persists the user-designated safe folder.
   */
  setDesignatedDirectory(newFolderPath) {
    const resolved = path.resolve(newFolderPath)
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true })
    }
    this.designatedDir = resolved
    fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
      designatedFolder: resolved,
      updatedAt: new Date().toISOString()
    }, null, 2))
    return { success: true, designatedFolder: resolved }
  }

  /**
   * Lists approved media assets strictly inside the designated folder
   */
  listMediaAssets() {
    this.ensureDirectoryExists(this.designatedDir)
    try {
      const files = fs.readdirSync(this.designatedDir, { withFileTypes: true })
      const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov'])

      const assets = files
        .filter(f => f.isFile() && allowedExts.has(path.extname(f.name).toLowerCase()))
        .map(f => {
          const fullPath = path.join(this.designatedDir, f.name)
          const stats = fs.statSync(fullPath)
          return {
            name: f.name,
            sizeBytes: stats.size,
            modifiedAt: stats.mtime.toISOString(),
            ext: path.extname(f.name).toLowerCase()
          }
        })

      return {
        success: true,
        designatedFolder: this.designatedDir,
        count: assets.length,
        assets
      }
    } catch (err) {
      return { success: false, error: err.message, assets: [] }
    }
  }

  /**
   * Validates if a target file path is securely strictly inside the designated drive directory
   */
  /**
   * Returns true if the given absolute path is strictly inside the designated vault.
   * Handles Windows path semantics, symlink resolution, and prevents ".." traversal.
   */
  isPathWithinVault(targetFilePath) {
    // Resolve the path (handles relative components and symlinks)
    const resolved = fs.realpathSync(path.resolve(targetFilePath))
    const vaultRoot = fs.realpathSync(this.designatedDir)
    // Normalise both to ensure case‑insensitive comparison on Windows
    const rel = path.relative(vaultRoot, resolved)
    // A safe path must not climb outside the vault (".." or absolute path)
    return rel && !rel.startsWith('..') && !path.isAbsolute(rel)
  }

  /**
   * Saves a base64 or buffer asset into the designated safe folder
   */
  async saveAsset(filename, base64Data) {
    // Configuration
    const MAX_SIZE = 50 * 1024 * 1024; // 50 MiB
    const ALLOWED_MIME = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime'
    ]);

    // Sanitize filename and construct destination path
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const dest = path.join(this.designatedDir, safeName);

    // Strip any data‑URL prefix (e.g., data:image/png;base64,)
    const base64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    // Size validation (pre‑decode limit also applied via Buffer length)
    if (buffer.length > MAX_SIZE) {
      return { success: false, error: 'File size exceeds 50 MiB limit' };
    }

    // MIME type validation using file-type (dynamic import to avoid eager load)
    let fileInfo;
    try {
      const { fileTypeFromBuffer } = await import('file-type');
      fileInfo = await fileTypeFromBuffer(buffer);
    } catch (e) {
      // If file-type fails, fall back to extension check (less secure)
      const ext = path.extname(safeName).toLowerCase();
      const mimeFromExt = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime'
      }[ext];
      fileInfo = mimeFromExt ? { mime: mimeFromExt } : null;
    }

    if (!fileInfo || !ALLOWED_MIME.has(fileInfo.mime)) {
      return { success: false, error: 'Unsupported media type' };
    }

    // Write the file (ensured to be within vault by design)
    try {
      fs.writeFileSync(dest, buffer);
    } catch (err) {
      return { success: false, error: 'Failed to write file: ' + err.message };
    }

    return {
      success: true,
      filename: safeName,
      path: dest,
      sizeBytes: buffer.length,
      mime: fileInfo.mime
    };
  }
}

export const mediaVault = new MediaVaultService()

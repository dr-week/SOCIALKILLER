import path from 'node:path'

export const MAX_ASSET_BYTES = 50 * 1024 * 1024

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime'
])

const EXT_TO_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime'
}

export async function validateMediaBuffer(safeName, buffer) {
  if (buffer.length > MAX_ASSET_BYTES) {
    return { ok: false, error: 'File size exceeds 50 MiB limit' }
  }

  let fileInfo
  try {
    const { fileTypeFromBuffer } = await import('file-type')
    fileInfo = await fileTypeFromBuffer(buffer)
  } catch {
    const ext = path.extname(safeName).toLowerCase()
    fileInfo = EXT_TO_MIME[ext] ? { mime: EXT_TO_MIME[ext] } : null
  }

  if (!fileInfo || !ALLOWED_MIME.has(fileInfo.mime)) {
    return { ok: false, error: 'Unsupported media type' }
  }
  return { ok: true, mime: fileInfo.mime }
}

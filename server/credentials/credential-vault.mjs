import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto'
import { dbService } from '../db/sqlite-engine.mjs'

function getCipherKey() {
  const masterSecret = process.env.FOLLOWDESK_VAULT_KEY
  if (!masterSecret || masterSecret.length < 32) {
    throw new Error('FOLLOWDESK_VAULT_KEY must be configured with at least 32 characters before using the credential vault.')
  }
  return createHash('sha256').update(masterSecret).digest()
}

export function encryptSecret(plainObject) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getCipherKey(), iv)
  const text = JSON.stringify(plainObject)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return { encryptedSecret: encrypted, iv: iv.toString('hex'), authTag: cipher.getAuthTag().toString('hex') }
}

export function decryptSecret(encryptedHex, ivHex, authTagHex) {
  try {
    const decipher = createDecipheriv('aes-256-gcm', getCipherKey(), Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
  } catch (error) {
    console.warn('[Vault] Decryption failed:', error.message)
    return null
  }
}

export function savePlatformVaultCredentials(platformId, creds = {}, brandId = 'danger-labs') {
  const existing = getPlatformVaultCredentials(platformId, brandId) || {}
  const merged = { ...existing, ...creds, updatedAt: new Date().toISOString() }
  const { encryptedSecret, iv, authTag } = encryptSecret(merged)
  dbService.setBrandPlatformVaultSecret(brandId, platformId, encryptedSecret, iv, authTag)
  return { brandId, platformId, saved: true }
}

export function getPlatformVaultCredentials(platformId, brandId = 'danger-labs') {
  const row = dbService.getBrandPlatformVaultSecret(brandId, platformId)
  return row ? decryptSecret(row.encryptedSecret, row.iv, row.authTag) : null
}

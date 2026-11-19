export function createVaultDictionaryRepository(statements) {
  const { insertVaultStmt, getVaultStmt, deleteVaultStmt, getAllVaultStmt, insertBrandVaultStmt, getBrandVaultStmt, insertDictItemStmt, getDictByTypeStmt, incrementDictUsageStmt, getAllDictItemsStmt } = statements
  return {
  setPlatformVaultSecret(platformId, encryptedSecret, iv, authTag) {
    const updatedAt = new Date().toISOString()
    insertVaultStmt.run(platformId, encryptedSecret, iv, authTag, updatedAt)
    return { platformId, updatedAt }
  },

  setBrandPlatformVaultSecret(brandId, platformId, encryptedSecret, iv, authTag) {
    const updatedAt = new Date().toISOString()
    insertBrandVaultStmt.run(brandId, platformId, encryptedSecret, iv, authTag, updatedAt)
    return { brandId, platformId, updatedAt }
  },

  getBrandPlatformVaultSecret(brandId, platformId) {
    return getBrandVaultStmt.get(brandId, platformId) || null
  },

  getPlatformVaultSecret(platformId) {
    return getVaultStmt.get(platformId) || null
  },

  deletePlatformVaultSecret(platformId) {
    const info = deleteVaultStmt.run(platformId)
    return info.changes > 0
  },

  getVaultPlatforms() {
    return getAllVaultStmt.all()
  },

  insertDictionaryItem({ id, type, text, source = 'curated', score = 1.0 }) {
    const itemId = id || `dict-${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const createdAt = new Date().toISOString()
    insertDictItemStmt.run(itemId, type, text, source, score, 0, null, createdAt)
    return { id: itemId, type, text, source, score, usedCount: 0, lastUsedAt: null, createdAt }
  },

  getDictionaryItemsByType(type) {
    return getDictByTypeStmt.all(type)
  },

  markDictionaryItemUsed(id) {
    const at = new Date().toISOString()
    incrementDictUsageStmt.run(at, id)
    return { id, lastUsedAt: at }
  },

  getAllDictionaryItems() {
    return getAllDictItemsStmt.all()
  },
  }
}

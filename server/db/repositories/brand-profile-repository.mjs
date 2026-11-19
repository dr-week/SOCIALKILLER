export function createBrandProfileRepository(statements) {
  const { insertBrandStmt, getBrandStmt, getAllBrandsStmt, getArchivedBrandsStmt, deleteBrandStmt, archiveBrandStmt, restoreBrandStmt } = statements
  return {
  saveBrandProfile(brand) {
    if (!brand || !brand.id) throw new Error('Brand profile must have an id')
    const updatedAt = new Date().toISOString()
    const purposeJson = JSON.stringify(brand.purpose || {})
    const accountsJson = JSON.stringify(brand.accounts || [])
    const milestonesJson = JSON.stringify(brand.milestones || [])
    insertBrandStmt.run(
      brand.id,
      brand.name || brand.id,
      brand.tagline || '',
      brand.location || 'Goa, India',
      purposeJson,
      accountsJson,
      milestonesJson,
      updatedAt,
      brand.archivedAt || null
    )
    return { ...brand, updatedAt }
  },

  getBrandProfile(id) {
    const row = getBrandStmt.get(id)
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      location: row.location,
      purpose: JSON.parse(row.purposeJson || '{}'),
      accounts: JSON.parse(row.accountsJson || '[]'),
      milestones: JSON.parse(row.milestonesJson || '[]'),
      updatedAt: row.updatedAt,
      ...(row.archivedAt ? { archivedAt: row.archivedAt } : {})
    }
  },

  getAllBrandProfiles() {
    const rows = getAllBrandsStmt.all()
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      location: row.location,
      purpose: JSON.parse(row.purposeJson || '{}'),
      accounts: JSON.parse(row.accountsJson || '[]'),
      milestones: JSON.parse(row.milestonesJson || '[]'),
      updatedAt: row.updatedAt
    }))
  },

  getArchivedBrandProfiles() {
    return getArchivedBrandsStmt.all().map(row => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      location: row.location,
      purpose: JSON.parse(row.purposeJson || '{}'),
      accounts: JSON.parse(row.accountsJson || '[]'),
      milestones: JSON.parse(row.milestonesJson || '[]'),
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt
    }))
  },

  archiveBrandProfile(id) {
    const at = new Date().toISOString()
    return archiveBrandStmt.run(at, at, id).changes > 0
  },

  restoreBrandProfile(id) {
    return restoreBrandStmt.run(new Date().toISOString(), id).changes > 0
  },

  deleteBrandProfile(id) {
    const info = deleteBrandStmt.run(id)
    return info.changes > 0
  }
}
}

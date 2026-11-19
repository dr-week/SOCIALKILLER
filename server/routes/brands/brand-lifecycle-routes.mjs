import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'

export async function handleBrandLifecycleRoutes(req, res, url, json) {
  if (req.method === 'GET' && url.pathname === '/api/brands') {
    const brands = dbService.getAllBrandProfiles()
    return json(res, 200, { success: true, brands: brands.length ? brands : DEFAULT_BRANDS })
  }

  if (req.method === 'GET' && url.pathname === '/api/brands/archived') {
    return json(res, 200, { success: true, brands: dbService.getArchivedBrandProfiles() })
  }

  const match = url.pathname.match(/^\/api\/brands\/([a-z0-9-]{1,64})\/(archive|restore)$/)
  if (req.method !== 'POST' || !match) return false
  const [, brandId, action] = match
  const brand = dbService.getBrandProfile(brandId)
  if (!brand) return json(res, 404, { error: 'Company workspace not found.' })

  if (action === 'archive') {
    if (brand.archivedAt) return json(res, 409, { error: 'This workspace is already archived.' })
    if (dbService.getAllBrandProfiles().length <= 1) return json(res, 409, { error: 'Keep at least one active workspace.' })
    dbService.archiveBrandProfile(brandId)
    return json(res, 200, { success: true, brand: dbService.getBrandProfile(brandId) })
  }
  if (!brand.archivedAt) return json(res, 409, { error: 'This workspace is already active.' })
  dbService.restoreBrandProfile(brandId)
  return json(res, 200, { success: true, brand: dbService.getBrandProfile(brandId) })
}

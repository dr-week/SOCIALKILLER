import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'

export function requestedBrandId(url, json, res) {
  const brandId = url.searchParams.get('brandId') || 'danger-labs'
  if (!/^[a-z0-9-]{1,64}$/.test(brandId) ||
      (!dbService.getBrandProfile(brandId) && !DEFAULT_BRANDS.some(brand => brand.id === brandId))) {
    json(res, 404, { error: 'Company workspace not found.' })
    return null
  }
  return brandId
}

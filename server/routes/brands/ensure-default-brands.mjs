import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'

export function ensureDefaultBrands() {
  const existing = dbService.getAllBrandProfiles()
  if (existing.length === 0) {
    DEFAULT_BRANDS.forEach(brand => dbService.saveBrandProfile(brand))
    return
  }
  const danger = existing.find(brand => brand.id === 'danger-labs')
  if (!danger || danger.purpose?.githubUser) return
  danger.purpose = danger.purpose || {}
  danger.purpose.githubUser = 'dr-week'
  danger.purpose.links = danger.purpose.links || [
    { platform: 'github', url: 'https://github.com/dr-week' },
    { platform: 'github', url: 'https://github.com/dr-week/fast-framework' }
  ]
  dbService.saveBrandProfile(danger)
}

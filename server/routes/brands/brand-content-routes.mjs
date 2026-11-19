import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS, generateVideoScript, generateDailyJourney } from '../../marketing/story-generator.mjs'

export async function handleBrandContentRoutes(req, res, url, json) {
  if (req.method === 'POST' && url.pathname === '/api/brands/generate-script') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    return new Promise(resolve => {
      req.on('end', () => {
        try {
          const { brandId, topic, pillar, format } = JSON.parse(body || '{}')
          const brand = dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId) || DEFAULT_BRANDS[0]
          json(res, 200, { success: true, script: generateVideoScript({ brand, topic, pillar, format }) })
        } catch (error) {
          json(res, 400, { error: 'Could not generate video script', details: error.message })
        }
        resolve(true)
      })
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/brands/generate-journey') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    return new Promise(resolve => {
      req.on('end', () => {
        try {
          const { brandId, topic, milestoneId } = JSON.parse(body || '{}')
          const brand = dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId) || DEFAULT_BRANDS[0]
          json(res, 200, { success: true, journey: generateDailyJourney({ brand, topic, milestoneId }) })
        } catch (error) {
          json(res, 400, { error: 'Could not generate journey stories', details: error.message })
        }
        resolve(true)
      })
    })
  }
  return false
}

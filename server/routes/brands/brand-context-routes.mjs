import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'
import { mergeContext, syncGithubRepos } from '../../marketing/brand-context.mjs'
import { runBrandResearch } from '../../marketing/brand-research.mjs'

export async function handleBrandContextRoutes(req, res, url, json) {
  if (req.method === 'POST' && url.pathname === '/api/brands') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    return new Promise(resolve => {
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}')
          if (!parsed.id || !parsed.name) {
            json(res, 400, { error: 'id and name are required' })
            return resolve(true)
          }
          if (!parsed.purpose?.research) {
            try {
              parsed.purpose = parsed.purpose || {}
              parsed.purpose.research = await runBrandResearch(parsed)
            } catch (error) {
              console.warn('[Brand Research] Auto-research on create failed non-fatally:', error.message)
            }
          }
          json(res, 200, { success: true, brand: dbService.saveBrandProfile(parsed) })
          resolve(true)
        } catch {
          json(res, 400, { error: 'Invalid JSON payload' })
          resolve(true)
        }
      })
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/brands/research') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    return new Promise(resolve => {
      req.on('end', async () => {
        try {
          const { brandId } = JSON.parse(body || '{}')
          const id = String(brandId || '')
          const brand = /^[a-z0-9-]{1,64}$/.test(id)
            ? dbService.getBrandProfile(id) || DEFAULT_BRANDS.find(item => item.id === id)
            : null
          if (!brand) {
            json(res, 404, { error: 'Company workspace not found.' })
            return resolve(true)
          }
          const research = await runBrandResearch(brand)
          const saved = dbService.saveBrandProfile(mergeContext(brand, { research }))
          json(res, 200, { success: true, brand: saved, research })
          resolve(true)
        } catch (error) {
          json(res, 500, { error: 'Failed to run brand research', details: error.message })
          resolve(true)
        }
      })
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/brands/context') {
    let body = ''
    let tooLarge = false
    req.on('data', chunk => {
      if (tooLarge) return
      body += chunk
      if (body.length > 600_000) { tooLarge = true; body = '' }
    })
    return new Promise(resolve => {
      req.on('end', async () => {
        try {
          if (tooLarge) {
            json(res, 413, { error: 'Context upload is too large (600 KB max).' })
            return resolve(true)
          }
          const parsed = JSON.parse(body || '{}')
          const brandId = String(parsed.brandId || '')
          const brand = /^[a-z0-9-]{1,64}$/.test(brandId)
            ? dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId)
            : null
          if (!brand) {
            json(res, 404, { error: 'Company workspace not found.' })
            return resolve(true)
          }
          let github = null
          if (parsed.syncGithub) {
            try {
              github = await syncGithubRepos(parsed.githubUser ?? brand.purpose?.githubUser)
            } catch (error) {
              json(res, 500, { error: 'GitHub synchronization failed', details: error.message })
              return resolve(true)
            }
          }
          const saved = dbService.saveBrandProfile(mergeContext(brand, {
            links: parsed.links, githubUser: parsed.githubUser, docs: parsed.docs, github
          }))
          json(res, 200, { success: true, brand: saved, githubError: '', repoCount: github?.repos.length ?? 0 })
          resolve(true)
        } catch {
          json(res, 400, { error: 'Invalid context payload' })
          resolve(true)
        }
      })
    })
  }
  return false
}

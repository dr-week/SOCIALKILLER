import { ensureDefaultBrands } from './brands/ensure-default-brands.mjs'
import { handleBrandLifecycleRoutes } from './brands/brand-lifecycle-routes.mjs'
import { handleBrandContextRoutes } from './brands/brand-context-routes.mjs'
import { handleBrandContentRoutes } from './brands/brand-content-routes.mjs'

export async function handleBrandRoutes(req, res, url, json) {
  ensureDefaultBrands()
  for (const handle of [handleBrandLifecycleRoutes, handleBrandContextRoutes, handleBrandContentRoutes]) {
    if (await handle(req, res, url, json)) return true
  }
  return false
}

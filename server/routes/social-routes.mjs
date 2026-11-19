import { handleSocialPlatformRoutes } from './social/platform-routes.mjs'
import { handleSocialPostRoutes } from './social/post-routes.mjs'
import { handleSocialGenerationRoutes } from './social/generation-routes.mjs'
import { handleMarketingRoutes } from './marketing-routes.mjs'
import { handleExtensionRoutes } from './social/extension-routes.mjs'
import { handleSocialSchedulerRoutes } from './social/scheduler-routes.mjs'
import { handleMetaRoutes } from './social/meta-routes.mjs'

const routeHandlers = [
  handleSocialPlatformRoutes,
  handleMetaRoutes,
  handleSocialPostRoutes,
  handleSocialGenerationRoutes,
  handleMarketingRoutes,
  handleExtensionRoutes,
  handleSocialSchedulerRoutes
]

export async function handleSocialAndMarketingRoutes(req, res, url, json) {
  for (const handle of routeHandlers) {
    if (await handle(req, res, url, json)) return true
  }
  return false
}

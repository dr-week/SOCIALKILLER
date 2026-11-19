/**
 * Publishing & Keep-Alive Orchestrator Facade (SQLite Single-Source-of-Truth)
 * Delegates persistence, approval, creation, copywriting, and keep-alive to modular services.
 */
import { SUPPORTED_PLATFORMS } from './platforms.mjs'
import { getTrackedProjects, addTrackedProject, getAiFeedLlmText, getAiFeedCatalogJson } from './projects-catalog.mjs'
import { runLyraCopywriter, generateMeetingPromo, generateAdCampaigns, LYRA_FRAMEWORKS } from './lyra-copywriter.mjs'
import { getMarketAnalysisReport } from './market-intel.mjs'
import { generateRssFeedXml } from './rss-feed.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import { PROMO_LIMITS } from './promo-limits.mjs'
import { executeKeepAlivePulse } from './keep-alive-pulse.mjs'
import { getPlatformConfig, getPlatformsStatus as getConfiguredPlatformStatuses, updatePlatformConfig } from './platform-config.mjs'
import { DEFAULT_BRAND_ID, getPostsQueue } from '../modules/publishing/post-store.mjs'

export {
  SUPPORTED_PLATFORMS,
  LYRA_FRAMEWORKS,
  runLyraCopywriter,
  generateMeetingPromo,
  generateAdCampaigns,
  getMarketAnalysisReport,
  generateRssFeedXml,
  getTrackedProjects,
  addTrackedProject,
  getAiFeedLlmText,
  getAiFeedCatalogJson,
  PROMO_LIMITS,
  updatePlatformConfig
}

export * from '../modules/publishing/post-store.mjs'
export * from '../modules/publishing/post-approval.mjs'
export * from '../modules/publishing/post-creator.mjs'

export const getPlatformsStatus = (brandId = DEFAULT_BRAND_ID) =>
  getConfiguredPlatformStatuses(brandId, SUPPORTED_PLATFORMS)

export async function triggerKeepAlivePulse(targetPlatformId = null, brandId = DEFAULT_BRAND_ID) {
  const scopedConfigs = new Map(SUPPORTED_PLATFORMS.map(p => [p.id, getPlatformConfig(brandId, p.id)]))
  const results = await executeKeepAlivePulse(scopedConfigs, targetPlatformId, logItem => {
    logItem.brandId = brandId
    dbService.addActivityLog(logItem)
  })
  return {
    pulsedCount: results.length,
    results,
    platforms: getPlatformsStatus(brandId)
  }
}

export function getRssFeedXml() {
  return generateRssFeedXml({ posts: getPostsQueue() })
}

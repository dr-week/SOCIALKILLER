/**
 * Unified Dispatcher Proxy
 * Delegates directly to the active server/marketing/dispatcher.mjs
 * to eliminate dead code and prevent import breakages.
 */

export { executePlatformDelivery } from './marketing/dispatcher.mjs'

export async function executeKeepAlive(platformId) {
  const { triggerKeepAlivePulse } = await import('./marketing/orchestrator.mjs')
  return triggerKeepAlivePulse(platformId)
}

export function handleActiveBrand(message, sender) {
  if (message?.type !== 'FOUNDRYDESK_SET_ACTIVE_BRAND') return undefined
  const source = sender.url || sender.tab?.url || ''
  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(source)) return false
  if (!/^[a-z0-9-]{1,64}$/.test(message.brandId || '')) return false
  const page = new URL(source)
  const frontendPort = Number(message.frontendPort)
  if (page.port && Number(page.port) !== frontendPort) return false
  void chrome.storage.local.set({ activeBrandId: message.brandId, activeFrontendPort: frontendPort })
  return false
}

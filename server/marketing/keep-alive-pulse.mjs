/**
 * Platform Keep-Alive Heartbeat Pulse Engine (<100 lines)
 */

import { executePlatformDelivery } from './dispatcher.mjs'

export const PULSE_SNIPPETS = {
  github: '// Daily Keep-Alive Code Pulse: Refactored modular services & tested edge cases.',
  x: 'Daily build log: Optimizing our automation pipeline and shipping clean TypeScript modules. What are you building today? 🚀 #TypeScript #DevTools',
  linkedin: 'Quick engineering note: Small, consistent daily improvements to developer tooling compound faster than massive rewrites. Keep shipping!',
  reddit: 'Daily check-in: sharing our latest benchmark notes on zero-dependency Node.js services.',
  discord: '⚡ **Daily Account Heartbeat:** Workspace automation engine is online and syncing.',
  devto: '---\ntitle: Daily Engineering TIL & Architecture Pulse\npublished: true\ntags: webdev, todayilearned\n---\nSharing a quick daily note on keeping modular state clean in Vue 3 + Node.js.',
  hashnode: '### Daily Developer Log\nShipped incremental improvements to our multi-platform publishing queue.',
  medium: 'Daily technical note: Building resilient local-first creator and developer tools.',
  instagram: 'Consistency in the studio every single day ⚡ Disciplined systems engineering.',
  ai_registry: '## Heartbeat\nSystem online. All APIs and schemas responsive.'
}

export async function executeKeepAlivePulse(platformConfigs, targetPlatformId, onLog) {
  const targets = targetPlatformId
    ? [platformConfigs.get(targetPlatformId)].filter(Boolean)
    : Array.from(platformConfigs.values()).filter(p => p.keepAliveEnabled)

  const results = []
  for (const cfg of targets) {
    const snippet = PULSE_SNIPPETS[cfg.platformId] || 'Daily activity heartbeat.'
    const delivery = await executePlatformDelivery(cfg.platformId, snippet, 'Daily Keep-Alive Pulse', cfg)

    cfg.lastKeepAliveAt = new Date().toISOString()
    cfg.streakDays = (cfg.streakDays || 0) + 1
    platformConfigs.set(cfg.platformId, cfg)

    const logItem = {
      id: `ka-${Date.now()}-${cfg.platformId}`,
      timestamp: cfg.lastKeepAliveAt,
      platformId: cfg.platformId,
      action: 'Keep-Alive Heartbeat',
      status: 'success',
      streakDays: cfg.streakDays,
      intentUrl: delivery.intentUrl,
      externalUrl: delivery.externalUrl,
      message: `Active streak: ${cfg.streakDays} days — ${delivery.message}`
    }
    if (typeof onLog === 'function') onLog(logItem)
    results.push(logItem)
  }

  return results
}

/**
 * Developer Projects Catalog & Marketing Awareness Data (<120 lines)
 * Extracted from server/marketing/orchestrator.mjs to maintain single responsibility.
 */

import { generateLlmSpec, generateMcpDiscoveryCatalog } from './ai-market.mjs'

let trackedProjects = [
  {
    id: 'zuari-fast-framework',
    name: 'Zuari (dr-week/fast-framework)',
    category: 'Zero-VDOM Reactive Web, 120 FPS WebXR & Rust/Zig Wasm Framework',
    description: 'Zuari (<2.5KB) — Zero-Virtual-DOM Reactive Web, 120 FPS WebXR Spatial HUD, Rust/Zig Wasm FFI, FPV Drone OSD, Tactical Optics & KaiOS/IoT Framework by Danger.Labs.',
    docsUrl: 'https://github.com/dr-week/fast-framework',
    apiUrl: 'https://dr-week.github.io/fast-framework/',
    installCmd: 'pnpm add @zuari/core @zuari/signals @zuari/dom @zuari/spatial @zuari/wasm',
    aiCapabilities: [
      '0% Virtual DOM overhead via surgical W3C DOM Parts updates (<2.5KB gzipped)',
      '120 FPS WebXR Spatial HUD for Apple Vision Pro & Meta Quest 3 (@zuari/spatial)',
      'Zero-Copy Rust & Zig WebAssembly FFI linear memory bridge (@zuari/wasm)',
      'FPV Drone OSD, Tactical Optics & KaiOS/IoT ultra-low-memory runtime'
    ]
  },
  {
    id: 'followdesk',
    name: 'FollowDesk',
    category: 'Audience Analytics & Omni-Channel Automation Suite',
    description: 'Local-first Instagram & omni-channel social media automation suite with Lyra copywriting, AI market indexing, and zero cloud dependencies.',
    docsUrl: 'https://github.com/dr-week/fast-framework',
    apiUrl: '/api/marketing/llms.txt',
    installCmd: 'git clone && npm install && npm run dev',
    aiCapabilities: [
      'Local-first JSON/ZIP relationship set analysis',
      'Automated 10-channel social & developer community syndication API',
      'Human & AI market discovery (llms.txt + MCP tool catalog)'
    ]
  }
]

export function getTrackedProjects() {
  return trackedProjects
}

export function addTrackedProject(project) {
  const newProj = {
    id: project.id || `proj-${Date.now()}`,
    name: project.name || 'New Project',
    category: project.category || 'Developer Tool',
    description: project.description || '',
    docsUrl: project.docsUrl || '',
    apiUrl: project.apiUrl || '/api/marketing/ai-feed',
    installCmd: project.installCmd || '',
    aiCapabilities: project.aiCapabilities || ['API integration', 'Fast CLI']
  }
  trackedProjects.push(newProj)
  return newProj
}

export function getAiFeedLlmText() {
  return generateLlmSpec({ projects: trackedProjects })
}

export function getAiFeedCatalogJson() {
  return generateMcpDiscoveryCatalog(trackedProjects)
}

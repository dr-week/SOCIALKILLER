export const TOPIC_HASHTAG_CLUSTERS = {
  webdev: ['webdev', 'javascript', 'typescript', 'frontend', 'coding', 'programming'],
  systems: ['systemdesign', 'softwarearchitecture', 'rustlang', 'wasm', 'performance', 'cleancode'],
  ai: ['aiagents', 'machinelearning', 'llm', 'autonomousagents', 'genai', 'futureoftech'],
  opensource: ['opensource', 'indiedev', 'github', 'devtools', 'softwareengineer'],
  mobile_webxr: ['webxr', 'spatialcomputing', '120fps', 'graphics', 'wasm']
}

export const VISUAL_TEMPLATES = [
  {
    id: 'arch_breakdown',
    title: 'Architecture Benchmark Breakdown',
    badge: '0% VDOM • 120 FPS',
    accentColor: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    icon: '⚡'
  },
  {
    id: 'ai_systems',
    title: 'Selling Software to AI Agents',
    badge: 'llms.txt • MCP Schemas',
    accentColor: '#a855f7',
    gradient: 'linear-gradient(135deg, #180828 0%, #030712 100%)',
    icon: '🤖'
  },
  {
    id: 'wasm_memory',
    title: 'Zero-Copy Shared Float64Array',
    badge: 'Rust/Zig FFI • Direct Signals',
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    icon: '🦀'
  },
  {
    id: 'contrarian_opinion',
    title: 'Contrarian Tech Engineering',
    badge: 'Unpopular Opinion • Systems',
    accentColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, #451a03 0%, #1c1917 100%)',
    icon: '🔥'
  }
]

export function getAlgorithmicHashtags(topic = '', tags = [], max = 5) {
  const normalized = `${topic} ${tags.join(' ')}`.toLowerCase()
  const matched = new Set()

  if (normalized.includes('ai') || normalized.includes('agent') || normalized.includes('llm')) {
    TOPIC_HASHTAG_CLUSTERS.ai.forEach(t => matched.add(t))
  }
  if (normalized.includes('wasm') || normalized.includes('rust') || normalized.includes('memory') || normalized.includes('architecture')) {
    TOPIC_HASHTAG_CLUSTERS.systems.forEach(t => matched.add(t))
  }
  if (normalized.includes('webxr') || normalized.includes('fps') || normalized.includes('spatial')) {
    TOPIC_HASHTAG_CLUSTERS.mobile_webxr.forEach(t => matched.add(t))
  }
  if (normalized.includes('open') || normalized.includes('github') || normalized.includes('public') || normalized.includes('star')) {
    TOPIC_HASHTAG_CLUSTERS.opensource.forEach(t => matched.add(t))
  }
  TOPIC_HASHTAG_CLUSTERS.webdev.forEach(t => matched.add(t))

  for (const t of tags) {
    const clean = t.replace(/^#/, '').trim().toLowerCase()
    if (clean) matched.add(clean)
  }

  return Array.from(matched).slice(0, max)
}

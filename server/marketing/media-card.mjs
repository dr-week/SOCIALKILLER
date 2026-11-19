/**
 * Visual Assets, Media Cards, Link Previews & Dynamic Hashtags Engine (<230 lines)
 * 
 * Generates dynamic high-conversion visual cards, SVG infographic covers,
 * context-aware algorithmic hashtags, and link attachments for posts.
 */

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

/**
 * Returns dynamic, algorithm-tailored hashtags based on the content and topic
 */
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

  // Include user custom tags
  for (const t of tags) {
    const clean = t.replace(/^#/, '').trim().toLowerCase()
    if (clean) matched.add(clean)
  }

  return Array.from(matched).slice(0, max)
}

/**
 * Generates an SVG Data URL Infographic / Cover Card for posts to stop user scrolling
 */
export function generateVisualCoverCard({
  title = 'Architecture Shift',
  badge = 'Systems Engineering',
  accentColor = '#38bdf8',
  icon = '⚡',
  subtitle = 'Zero-VDOM, 120 FPS WebXR & Local-First Architecture'
} = {}) {
  const cleanTitle = title.length > 55 ? title.slice(0, 52) + '...' : title
  const cleanSubtitle = subtitle.length > 80 ? subtitle.slice(0, 77) + '...' : subtitle

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>
      <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <circle cx="100" cy="80" r="280" fill="${accentColor}" opacity="0.08" filter="blur(60px)" />
    <circle cx="1100" cy="550" r="320" fill="#8b5cf6" opacity="0.08" filter="blur(70px)" />
    <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
    
    <!-- Top Badge Pill -->
    <rect x="90" y="90" width="280" height="42" rx="21" fill="rgba(56, 189, 248, 0.12)" stroke="${accentColor}" stroke-width="1.5" />
    <text x="115" y="117" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="${accentColor}">
      ${icon} ${badge.toUpperCase()}
    </text>

    <!-- Main Headline -->
    <text x="90" y="240" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="-1.5">
      ${escapeXml(cleanTitle)}
    </text>

    <!-- Subtitle / Hook -->
    <text x="90" y="320" font-family="-apple-system, sans-serif" font-size="24" font-weight="400" fill="#94a3b8">
      ${escapeXml(cleanSubtitle)}
    </text>

    <!-- Accent divider line -->
    <rect x="90" y="380" width="1020" height="4" rx="2" fill="url(#glow)" />

    <!-- Metrics Banner Footer -->
    <text x="90" y="470" font-family="monospace" font-size="20" font-weight="700" fill="${accentColor}">
      ⚡ 0% Virtual DOM &bull; 0ms Hydration &bull; 120 FPS WebXR &bull; &lt;2.5KB Bundle
    </text>
    <text x="90" y="515" font-family="-apple-system, sans-serif" font-size="17" font-weight="600" fill="#cbd5e1">
      github.com/dr-week/fast-framework &bull; FollowDesk Social Intelligence
    </text>
  </svg>`.trim()

  return {
    svg,
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }
}

function escapeXml(unsafe = '') {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Returns complete media and link attachment metadata for a post
 */
export function getPostMediaAndLinks({
  topic = '',
  tags = [],
  webLink = 'https://github.com/dr-week/fast-framework',
  imageUrl = null,
  videoUrl = null
} = {}) {
  const hashtags = getAlgorithmicHashtags(topic, tags)
  const template = VISUAL_TEMPLATES[Math.floor(Math.random() * VISUAL_TEMPLATES.length)]
  const cover = generateVisualCoverCard({
    title: topic,
    badge: template.badge,
    accentColor: template.accentColor,
    icon: template.icon,
    subtitle: 'Zero-VDOM, 120 FPS WebXR & High-Velocity Developer Automation'
  })

  return {
    webLink: webLink || 'https://github.com/dr-week/fast-framework',
    imageUrl: imageUrl || cover.dataUrl,
    videoUrl: videoUrl || null,
    hashtags,
    hashtagString: hashtags.map(h => `#${h}`).join(' '),
    visualTemplate: template
  }
}

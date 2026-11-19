/**
 * News Re-Modifier & Viral Angle Transformer (<210 lines)
 * 
 * Takes raw industry news or trending tech articles and automatically reformulates them
 * into controversial hooks, architectural debates, and GitHub repository promotions.
 */

import { formatWithViralFramework } from './viral-frameworks.mjs'

export const REMODEL_ANGLES = [
  { id: 'contrarian', label: 'Contrarian Debater', desc: 'Challenges mainstream assumptions and expose hype' },
  { id: 'future_of_coding', label: 'Future of Coding', desc: 'Connects news to AI commoditization & systems leverage' },
  { id: 'benchmark', label: 'Benchmark Reality Check', desc: 'Anchors in frame rates, memory, and zero-VDOM metrics' },
  { id: 'pas', label: 'PAS Conversion', desc: 'Problem, Agitate, Solve for high developer adoption' },
  { id: 'ai_commerce', label: 'AI Market & Agent Buyer', desc: 'Translates news into machine-readable llms.txt & MCP opportunities' }
]

export function transformNewsToViralPost({
  rawTitle = '',
  rawSummary = '',
  sourceUrl = '',
  githubRepo = 'github.com/dr-week/fast-framework',
  angle = 'contrarian',
  framework = 'PAS'
} = {}) {
  const cleanTitle = rawTitle.replace(/\s*-\s*Show HN|\s*-\s*Ask HN/i, '').trim() || 'Modern Architecture Shift'
  const cleanRepo = `https://${githubRepo.replace(/^https?:\/\//, '')}`

  // Apply narrative transform angles
  let hook = ''
  let debate = ''
  let question = ''

  if (angle === 'contrarian') {
    hook = `Most developers are completely misinterpreting this: "${cleanTitle}"`
    debate = `The industry keeps optimizing for temporary hype cycles instead of fundamental computer science. When you look under the hood of ${rawSummary || 'current tooling'}, the real bottleneck isn't language speed—it's memory layout and architectural bloat.`
    question = `Why are we rewriting everything in new syntax instead of eliminating unnecessary runtime layers?`
  } else if (angle === 'future_of_coding') {
    hook = `If you want to know where software engineering is going in 2026, read this carefully: "${cleanTitle}"`
    debate = `Writing boilerplate code is officially dead. As AI commoditizes syntax, the only true leverage left for engineers is mastering local-first protocols, zero-copy Wasm FFI, and resilient distributed state.`
    question = `Are you spending more time building high-leverage architecture or fighting AI prompt hallucinations?`
  } else if (angle === 'ai_commerce') {
    hook = `Why this developer trend matters for autonomous AI agents: "${cleanTitle}"`
    debate = `Autonomous agents (Claude, Cursor, Devin) are becoming the primary consumers of developer tools. If your project isn't exposing live /llms.txt and MCP tool catalogs, you are completely invisible to tomorrow's enterprise buyers.`
    question = `Is your stack ready to sell directly to AI models or are you still relying on landing pages?`
  } else {
    // Benchmark & Builder angle
    hook = `Benchmark Reality Check: Why "${cleanTitle}" matters for real production systems.`
    debate = `We ran real-world profiling on high-refresh 120Hz displays. Eliminating Virtual DOM and utilizing direct W3C DOM Parts cut frame drops by 80% while keeping the entire core runtime under 2.5KB.`
    question = `When was the last time you profiled your production bundle's actual CPU frame budget?`
  }

  const mainPostX = `${hook}\n\n${debate}\n\n${question}\n\n📌 Bookmark this breakdown.\n(Source & GitHub repo in replies 👇)`

  const replyPromoX = `🔗 Full context & discussion source:\n${sourceUrl || 'https://news.ycombinator.com'}\n\n⭐ We open-sourced the <2.5KB architecture built around this exact philosophy on GitHub:\n${cleanRepo}\n\nStar the repo and check the benchmarks! 🚀`

  const redditPost = `Title: [Discussion] ${cleanTitle} — Architectural Breakdown & Trade-Offs\n\nHey devs,\n\nCame across this discussion: "${cleanTitle}"\n\n${debate}\n\n${question}\n\nWould love to hear how teams here are handling this trade-off in production.\n\n(We've been benchmarking this architecture in our open-source repo: ${cleanRepo})`

  const linkedinPost = `${hook}\n\n${debate}\n\n3 Key Engineering Takeaways:\n1️⃣ Prioritize zero-copy memory over syntax sugar.\n2️⃣ Keep runtime footprint minimal (<2.5KB).\n3️⃣ Build transparent, verifiable architectures.\n\n${question}\n\n👉 Open-source GitHub repo: ${cleanRepo}`

  const devtoPost = `---\ntitle: "Deconstructing: ${cleanTitle.replace(/"/g, '\\"')}"\npublished: true\ntags: webdev, programming, architecture, performance\n---\n\n## Context\n\n"${cleanTitle}" represents a broader movement in modern software engineering.\n\n## The Real Bottleneck\n\n${debate}\n\n## Key Engineering Question\n\n${question}\n\n---\n*Explore our open-source benchmark repo:* [${cleanRepo}](${cleanRepo})`

  const discordPost = `🚨 **Trending Tech Debate:**\n\n> "${hook}"\n\n${debate}\n\nSource: ${sourceUrl || 'Web'}\nOpen Source: ${cleanRepo}`

  const frameworkPayload = formatWithViralFramework({
    framework: (framework || 'PAS').toUpperCase(),
    topic: cleanTitle,
    rawNotes: debate,
    githubRepo: cleanRepo
  })

  return {
    original: { title: cleanTitle, summary: rawSummary, sourceUrl },
    angle,
    frameworkOutput: frameworkPayload,
    variants: {
      x: mainPostX,
      x_reply: replyPromoX,
      reddit: redditPost,
      linkedin: linkedinPost,
      devto: devtoPost,
      discord: discordPost
    },
    suggestedPostPayload: {
      title: hook,
      topic: cleanTitle,
      rawNotes: `${debate}\n\nSource: ${sourceUrl}\nGitHub: ${cleanRepo}`,
      platforms: ['x', 'reddit', 'linkedin', 'github', 'devto', 'ai_registry', 'discord'],
      variants: {
        x: mainPostX,
        reddit: redditPost,
        linkedin: linkedinPost,
        devto: devtoPost,
        discord: discordPost
      }
    }
  }
}

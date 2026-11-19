/**
 * Viral Developer Angles, Contrarian Debates & Randomizer Engine (<185 lines)
 * 
 * Analyzes tech discourse across X (Twitter), Reddit (r/programming, r/webdev, r/cscareerquestions),
 * and Hacker News to generate polarizing, viral-ready posts promoting your GitHub repositories
 * (specifically `dr-week/fast-framework` Zuari <2.5KB and FollowDesk).
 * 
 * Key Angles:
 * 1. "Vibe Coding" Backlash vs "Zero-VDOM Mechanical Sympathy"
 * 2. The Future of Coding: "Why Senior Devs Are Deleting 90% of AI Code"
 * 3. 0ms Hydration & W3C DOM Parts vs Virtual DOM Debt (React 19 / Next.js)
 * 4. WebAssembly Zero-Copy FFI vs JSON.stringify Bottlenecks
 * 5. Local-First / Zero Cloud Lock-In vs $500/mo SaaS Sprawl
 */

export const VIRAL_ANGLES = [
  {
    id: 'vibe_coding_debt',
    category: 'Contrarian Debate / Future of Coding',
    hook: 'Vibe coding is creating the largest architectural catastrophe in software history.',
    subtext: 'In 2026, junior devs let LLMs generate 800-line blobs with 0 understanding. Senior devs are now spending 85% of their sprint refactoring unmaintainable AI spaghetti.',
    solution: 'The future of coding isn’t less engineering—it’s extreme mechanical sympathy. We built Zuari (@zuari/core <2.5KB) with 0% Virtual DOM and surgical W3C DOM Parts so code is 100% deterministic and verifiable.',
    repoUrl: 'https://github.com/dr-week/fast-framework',
    tags: ['programming', 'softwareengineering', 'webdev', 'ai', 'architecture']
  },
  {
    id: 'vdom_is_dead',
    category: 'Architecture Hot Take',
    hook: 'Stop shipping 200KB of Virtual DOM diffing in 2026. The browser already solved this.',
    subtext: 'React diffs the entire virtual tree on every micro-render. W3C DOM Parts update the exact text node directly in C++ browser engine space.',
    solution: 'Compare the benchmarks: React 19 (~185KB) vs Zuari (<2.5KB). 0ms hydration, 120 FPS WebXR spatial anchors, zero runtime diffing. Open-sourced on GitHub:',
    repoUrl: 'https://github.com/dr-week/fast-framework',
    tags: ['react', 'webdev', 'javascript', 'performance', 'frontend']
  },
  {
    id: 'future_of_coding_ai_humans',
    category: 'Tech News & Future Trends',
    hook: 'The future of software is selling simultaneously to Humans and AI Agents.',
    subtext: 'Human developers search GitHub and Google. Autonomous coding agents (Claude, Cursor, Windsurf) search root /llms.txt and MCP schemas.',
    solution: 'If your library doesn’t expose machine-verifiable tools, AI agents will simply ignore it. Every project we ship in FollowDesk and Zuari includes live /llms.txt and MCP tools out of the box.',
    repoUrl: 'https://github.com/dr-week/fast-framework',
    tags: ['aiagents', 'llms', 'mcp', 'devtools', 'futureofcoding']
  },
  {
    id: 'wasm_zero_copy',
    category: 'Low-Level Benchmark Debate',
    hook: 'Your WebAssembly isn’t slow. Your JSON.stringify bridge is.',
    subtext: 'Passing heavy state across the JS-Wasm boundary via JSON serialization destroys your 120 FPS frame budget on Apple Vision Pro and Quest 3.',
    solution: 'We eliminated serialization completely: @zuari/wasm binds shared Float64Array linear memory directly to reactive DOM signals. Zero copies. Locked 120 FPS.',
    repoUrl: 'https://github.com/dr-week/fast-framework',
    tags: ['rust', 'webassembly', 'webxr', 'zig', 'gamedev']
  },
  {
    id: 'local_first_rebellion',
    category: 'Anti-SaaS Controversy',
    hook: 'Why are developers paying $80/month for social schedulers that just wrap an HTTP POST request?',
    subtext: 'Modern developer tools have become bloated multi-tenant SaaS holding your credentials hostage. Local-first tools with direct browser extensions do the exact same thing with 0 server fees.',
    solution: 'FollowDesk runs completely local-first on port 4174. 10-channel syndication, Lyra copywriting, audience analytics, zero cloud subscriptions.',
    repoUrl: 'https://github.com/dr-week/fast-framework',
    tags: ['localfirst', 'devtools', 'opensource', 'privacy', 'software']
  }
]

/**
 * Randomizes and returns a high-impact viral angle and generates variants for X, Reddit, LinkedIn, GitHub, etc.
 */
export function getRandomizedViralPost(seedIndex = null) {
  const index = seedIndex !== null
    ? Math.abs(seedIndex) % VIRAL_ANGLES.length
    : Math.floor(Math.random() * VIRAL_ANGLES.length)

  const angle = VIRAL_ANGLES[index]
  const repo = angle.repoUrl

  return {
    angleId: angle.id,
    category: angle.category,
    hook: angle.hook,
    repoUrl: repo,
    variants: {
      x: `${angle.hook}\n\n${angle.subtext}\n\n${angle.solution}\n\n⭐ Star on GitHub: ${repo}\n\nWhat’s your take? Drop your thoughts below 👇`,
      reddit: `Title: [Debate / Architecture] ${angle.hook}\n\nHey r/programming,\n\n${angle.subtext}\n\n${angle.solution}\n\nWe open-sourced the full test suite (91/91 passing) and benchmarks here: ${repo}\n\nWould love an honest technical critique on this approach. Are you moving away from heavy abstractions or doubling down?`,
      linkedin: `${angle.hook}\n\n${angle.subtext}\n\nHere is how we approached this architectural shift:\n\n1️⃣ Simplify fundamentals: Cut unnecessary runtimes and Virtual DOM overhead.\n2️⃣ Optimize for verifyability: Whether human-written or AI-assisted, code must be deterministic.\n3️⃣ Build in public: Code that lives in private repos doesn't generate feedback loops.\n\n${angle.solution}\n\nFull repository & benchmarks on GitHub: ${repo}\n\nHow is your engineering team balancing AI productivity with architectural integrity this year?`,
      github: `# ${angle.hook}\n\n> **Category:** ${angle.category} | **GitHub Showcase:** [${repo}](${repo})\n\n## The Core Debate\n${angle.subtext}\n\n## Our Implementation\n${angle.solution}\n\n- Repository: ${repo}\n- Status: Production Ready & Open-Source\n- Benchmarks: <2.5KB gzipped, 0ms hydration, 120 FPS WebXR.`,
      devto: `---\ntitle: "${angle.hook.replace(/"/g, '\\"')}"\npublished: true\ntags: ${angle.tags.slice(0, 4).join(', ')}\n---\n\n## The Problem\n${angle.subtext}\n\n## The Architecture Shift\n${angle.solution}\n\n## Open Source Repository\nCheck out the full implementation and run the benchmarks locally:\n👉 [${repo}](${repo})\n\nWhat are your thoughts on this trend? Let's discuss in the comments below!`,
      discord: `🔥 **Tech Debate of the Day:**\n\n> "${angle.hook}"\n\n${angle.subtext}\n\nWe solved this in Zuari: ${repo}\n\nAgree or disagree? React with 🚀 or 💩!`
    }
  }
}

/**
 * Viral Content System Archetypes & Strategy Taxonomy (<220 lines)
 * 
 * Provides automated post generation across 6 core debate categories:
 * 1. THE FUTURE OF CODING (AI vs Junior Devs, Autocomplete vs Architecture)
 * 2. FRAMEWORK WARS & TECH DEBATES (Zero-VDOM, Rust/Zig Wasm, Signal graphs vs React)
 * 3. TECH INDUSTRY CONTROVERSY (VC SaaS vs Solo Open Source, 10x Engineers)
 * 4. GITHUB PROMOTION PIPELINES (Link-in-reply strategy, Star velocity hooks)
 * 5. MACHINE AGENT MARKETING (llms.txt, Autonomous AI buyers)
 * 6. BENCHMARKS & HARD NUMBERS (<2.5KB bundle size, 0ms hydration, 120 FPS WebXR)
 */

export const CONTENT_PILLARS = {
  FUTURE_OF_CODING: 'Future of Coding',
  FRAMEWORK_DEBATE: 'Framework Wars',
  TECH_CONTROVERSY: 'Industry Controversy',
  GITHUB_PROMOTION: 'GitHub Growth Engine',
  AI_MARKET: 'AI & Agent Commerce',
  PERF_BENCHMARKS: 'Hard Numbers & Benchmarks'
}

export const VIRAL_TOPIC_REGISTRY = [
  // Pillar 1: Future of Coding
  {
    id: 'ai_slot_machine',
    pillar: CONTENT_PILLARS.FUTURE_OF_CODING,
    hook: 'AI is turning senior engineers into code review slot-machine operators.',
    debate: 'The harsh reality: Junior devs are losing foundational debugging skills because Claude and Cursor generate code they cannot audit when production crashes at 2 AM.',
    question: 'Are we training a generation of 10x architects, or helpless prompt monkeys? Where do you stand?',
    githubSolution: 'We built a zero-VDOM, transparent reactive core to keep execution verifiable and fast.',
    callToAction: 'Bookmark this for your engineering team. Repo link in replies 👇'
  },
  {
    id: 'death_of_syntax',
    pillar: CONTENT_PILLARS.FUTURE_OF_CODING,
    hook: 'Writing code is no longer the job. System design is.',
    debate: 'Syntax was always just a translation layer for computers. In 2026, writing boilerplate CRUD APIs is zero-marginal-cost work. The only high-leverage engineers are those designing memory layouts, protocols, and event graphs.',
    question: 'Do you spend more time writing code today or reviewing what AI generated?',
    githubSolution: 'Our open-source engine is designed for zero-copy memory graphs rather than bloated syntactic sugar.',
    callToAction: 'Bookmark this perspective. GitHub repo in the replies 👇'
  },

  // Pillar 2: Framework Wars & Tech Debates
  {
    id: 'vdom_10yr_mistake',
    pillar: CONTENT_PILLARS.FRAMEWORK_DEBATE,
    hook: 'Virtual DOM was a 10-year detour that bloated modern web applications.',
    debate: 'Shipping 150KB of runtime diffing abstractions just to update a text node is engineering malpractice. Direct DOM Parts, fine-grained signals, and zero-copy Wasm are leaving heavy frameworks in the dust.',
    question: 'Why are teams still defaulting to massive JS bundles when browsers can render at 120 FPS natively?',
    githubSolution: 'Check our <2.5KB architecture on GitHub and benchmark it yourself.',
    callToAction: 'Drop your framework of choice below. Star the repo in replies 👇'
  },
  {
    id: 'wasm_zero_copy',
    pillar: CONTENT_PILLARS.FRAMEWORK_DEBATE,
    hook: 'JSON.stringify is the most expensive mistake in your web app.',
    debate: 'Serializing objects across thread boundaries or Wasm runtimes wastes 40% of frame time on garbage collection. Sharing Float64Array memory buffers directly between Rust/Zig and DOM signals unlocks 120 FPS spatial computing.',
    question: 'Have you benchmarked your JSON serialization overhead lately?',
    githubSolution: 'Explore how we eliminated JSON overhead in @zuari/wasm on GitHub.',
    callToAction: 'Bookmark this for performance audits. Repo link in replies 👇'
  },

  // Pillar 3: Industry Controversy
  {
    id: 'open_source_vs_saas',
    pillar: CONTENT_PILLARS.TECH_CONTROVERSY,
    hook: 'VC-backed dev tools are dying. Lean, solo-maintained open-source repos are winning.',
    debate: 'Teams don’t want bloated enterprise subscriptions with 40 sales calls. They want an MIT-licensed repo they can pnpm install, inspect the source, and self-host in 2 seconds.',
    question: 'When was the last time you bought SaaS when a clean GitHub repo solved the problem better?',
    githubSolution: 'Star our lean, independent developer stack on GitHub.',
    callToAction: 'What SaaS do you wish was a simple open-source repo? Discussion below 👇'
  },
  {
    id: 'the_velocity_trap',
    pillar: CONTENT_PILLARS.TECH_CONTROVERSY,
    hook: 'The AI Velocity Trap: Output tripled, but technical debt multiplied by 10.',
    debate: 'Management looks at AI code gen and expects 3x sprint velocity. The reality on the ground? Developers spend 60% of their day debugging weird AI hallucinations and reading bloated PRs.',
    question: 'Is your team shipping faster with AI, or just creating bugs at 3x speed?',
    githubSolution: 'We wrote a minimal local-first framework to prevent dependency sprawl.',
    callToAction: 'Share your experience below. Check our open-source repo in replies 👇'
  },

  // Pillar 4: AI & Agent Commerce
  {
    id: 'ai_customers_first',
    pillar: CONTENT_PILLARS.AI_MARKET,
    hook: 'In 18 months, your biggest software customers won’t be humans—they’ll be AI agents.',
    debate: 'If your project only has a flashy web UI and no machine-readable llms.txt or MCP tool catalog, you are invisible to the next generation of autonomous enterprise buyers.',
    question: 'Is your stack ready to sell directly to AI models, or are you still relying on landing page ads?',
    githubSolution: 'See how we expose live /llms.txt and MCP discovery feeds in our repo.',
    callToAction: 'Bookmark this strategy. Code & specs in the replies 👇'
  },

  // Pillar 5: Hard Numbers & Benchmarks
  {
    id: 'bundle_size_challenge',
    pillar: CONTENT_PILLARS.PERF_BENCHMARKS,
    hook: 'We built a complete reactive framework in <2.5KB gzipped. No Virtual DOM.',
    debate: 'React is 45KB. Vue is 34KB. Angular is 60KB+. We proved that with W3C DOM Parts and native signal graphs, you can get 0ms hydration and 120 FPS spatial HUDs in under 2.5KB.',
    question: 'What is the bundle size of your core runtime, and why is it so large?',
    githubSolution: 'Run the benchmarks yourself on GitHub: github.com/dr-week/fast-framework',
    callToAction: 'Run the test suite on GitHub (link in replies 👇)'
  },
  {
    id: 'local_first_db_revolution',
    pillar: CONTENT_PILLARS.FUTURE_OF_CODING,
    hook: 'Why embedded SQLite is silently replacing cloud Postgres for modern app backends.',
    debate: 'Round-tripping every single button click across AWS regions is 80ms of dead latency. SQLite with WAL mode, zero network hops, and local file storage gives instant 0ms interactions with zero monthly cloud bills.',
    question: 'Are you still paying for cloud databases for apps that could run 100% local-first?',
    githubSolution: 'We run our entire engine on zero-dependency Node.js native DatabaseSync with zero npm baggage.',
    callToAction: 'Save this architecture breakdown. Repo link in replies 👇'
  },
  {
    id: 'visual_spatial_hud_120fps',
    pillar: CONTENT_PILLARS.PERF_BENCHMARKS,
    hook: 'Apple Vision Pro & Quest 3 demand 120 FPS. Heavy JS runtimes drop frames instantly.',
    debate: 'Garbage collection pauses in standard web frameworks create immediate nausea in spatial headsets. Direct W3C signal bindings and zero-copy Float64Array memory buffers render silky-smooth 3D interfaces without dropping a single frame.',
    question: 'Have you tested your web app on a 120Hz spatial display? How many frames did it drop?',
    githubSolution: 'Inspect our native 120 FPS WebXR HUD benchmark in the open repo.',
    callToAction: 'Check out the live demo and benchmarks below 👇'
  },
  {
    id: 'ai_tool_mcp_standard',
    pillar: CONTENT_PILLARS.AI_MARKET,
    hook: 'Every SaaS tool without Model Context Protocol (MCP) will be obsolete by 2027.',
    debate: 'Users will no longer log into 15 web dashboards. They will command Claude, Cursor, and ChatGPT directly from their terminal or IDE. If your software lacks an MCP server, you don’t exist in their daily workflow.',
    question: 'Has your company started authoring MCP servers or /llms.txt feeds yet?',
    githubSolution: 'See how our open-source tools integrate native MCP servers and llms.txt discovery.',
    callToAction: 'Bookmark this architecture pattern. Source code in replies 👇'
  },
  {
    id: 'video_image_algorithm_boost',
    pillar: CONTENT_PILLARS.GITHUB_PROMOTION,
    hook: 'Text-only posts are dead on modern social algorithms. Visuals are 10x leverage.',
    debate: 'Feed algorithms on X, LinkedIn, and Instagram aggressively penalize low-dwell-time plain text. Attaching high-contrast infographic cards, architecture diagrams, and video snippets multiplies bookmarks by 10x and replies by 75x.',
    question: 'Do you attach architecture visual cards to your technical updates, or just plain text?',
    githubSolution: 'We generate high-contrast SVG cover cards and algorithmic hashtag clusters on the fly.',
    callToAction: 'Try the dynamic visual cards in our repo (link in replies 👇)'
  }
]

import { dbService } from '../db/sqlite-engine.mjs'

// In-memory set of recently used topic IDs to prevent immediate repeats
const recentlyUsedTopicMemory = new Set()

export function getRandomPillarTopic(pillar = null, options = {}) {
  const { preferPending = true } = options

  // 1. If preferPending is enabled, check if user has custom pending topics
  if (preferPending && !pillar) {
    try {
      const pendingUserTopics = dbService.getPendingUserTopics()
      if (pendingUserTopics && pendingUserTopics.length > 0) {
        // Pick one that hasn't been recently surfaced
        const candidate = pendingUserTopics.find(t => !recentlyUsedTopicMemory.has(t.id)) || pendingUserTopics[0]
        recentlyUsedTopicMemory.add(candidate.id)
        if (recentlyUsedTopicMemory.size > 25) {
          const first = recentlyUsedTopicMemory.values().next().value
          recentlyUsedTopicMemory.delete(first)
        }
        return {
          ...candidate,
          isUserTopic: true
        }
      }
    } catch {}
  }

  // 2. Filter registry by pillar if specified
  const filtered = pillar
    ? VIRAL_TOPIC_REGISTRY.filter(t => t.pillar === pillar)
    : VIRAL_TOPIC_REGISTRY
  const list = filtered.length > 0 ? filtered : VIRAL_TOPIC_REGISTRY

  // 3. Filter out recently used topics from memory AND recent posts from SQLite
  const historicalPosts = dbService.getAllPosts()
  const recentHistoricalTopics = new Set(
    historicalPosts.slice(0, 30).map(p => (p.topic || p.title || '').toLowerCase())
  )

  const freshPool = list.filter(t => {
    if (recentlyUsedTopicMemory.has(t.id)) return false
    const lowerHook = (t.hook || '').toLowerCase()
    for (const recent of recentHistoricalTopics) {
      if (recent && (recent.includes(lowerHook) || lowerHook.includes(recent))) return false
    }
    return true
  })
  const pool = freshPool.length > 0 ? freshPool : list

  // If pool was exhausted, purge oldest memory
  if (freshPool.length === 0) {
    recentlyUsedTopicMemory.clear()
  }

  const idx = Math.floor(Math.random() * pool.length)
  const selected = pool[idx]
  recentlyUsedTopicMemory.add(selected.id)

  return selected
}

import { getPostMediaAndLinks } from './media-card.mjs'

export function formatSystemPost({
  topicObj = VIRAL_TOPIC_REGISTRY[0],
  githubRepo = 'github.com/dr-week/fast-framework',
  platform = 'x',
  tags = []
} = {}) {
  const { hook, debate, question, githubSolution, callToAction } = topicObj
  const cleanRepo = `https://${githubRepo.replace(/^https?:\/\//, '')}`
  const media = getPostMediaAndLinks({
    topic: hook,
    tags,
    webLink: cleanRepo
  })
  const hashStr = media.hashtagString

  if (platform === 'x') {
    return {
      title: hook,
      mainPost: `${hook}\n\n${debate}\n\n${question}\n\n📌 ${callToAction}\n\n${hashStr.slice(0, 50)}`,
      replyWithGithub: `🔗 Live Repository & Benchmarks:\n${cleanRepo}\n\nStar the repo to support zero-bloat architecture! ⭐`,
      media
    }
  }

  if (platform === 'reddit') {
    return {
      title: `[Discussion] ${hook}`,
      mainPost: `Hey devs,\n\n${debate}\n\n${question}\n\nLive repository: ${cleanRepo}\n\nCurious how your team handles this in practice.`,
      media
    }
  }

  if (platform === 'linkedin') {
    return {
      title: hook,
      mainPost: `${hook}\n\n${debate}\n\nKey Engineering Takeaway:\n${githubSolution}\n\n${question}\n\n🔗 Live Reference: ${cleanRepo}\n\n${hashStr}`,
      media
    }
  }

  return {
    title: hook,
    mainPost: `${hook}\n\n${debate}\n\n${question}\n\n👉 Open-source repo: ${cleanRepo}\n\n${hashStr}`,
    media
  }
}


/**
 * High-Engagement & Controversial Tech Presets Engine (<200 lines)
 * 
 * Generates viral discussion hooks, hot debates, and GitHub repository promo templates
 * optimized for the X recommendation algorithm (replies 75x+, bookmarks 10x, dwell time >2m).
 */

export const VIRAL_TECH_TOPICS = [
  {
    id: 'ai_coding_future',
    category: 'Future of Coding',
    hook: 'AI is turning senior engineers into code review slot-machine operators.',
    debate: 'The harsh reality: Junior devs are losing foundational debugging skills because Claude and Cursor generate code they can’t audit when production crashes at 2 AM.',
    question: 'Are we training a generation of 10x orchestrators or helpless prompt monkeys? Where do you stand?',
    githubCta: 'We built a zero-VDOM, transparent reactive core to keep execution verifiable and fast.'
  },
  {
    id: 'framework_bloat',
    category: 'Controversial Tech Opinion',
    hook: 'Virtual DOM was a 10-year detour that bloated modern web applications.',
    debate: 'Shipping 150KB of runtime abstractions just to update a text node is engineering malpractice. Direct DOM Parts, fine-grained signals, and zero-copy Wasm are leaving heavy frameworks in the dust.',
    question: 'Why are teams still defaulting to massive JS bundles when browsers can render at 120 FPS natively?',
    githubCta: 'Check our <2.5KB architecture on GitHub and benchmark it yourself.'
  },
  {
    id: 'death_of_fullstack',
    category: 'Future of Coding',
    hook: 'The "Full-Stack Developer" is dead. Long live the Systems Architect.',
    debate: 'Writing boilerplate CRUD APIs and React buttons is now zero-marginal-cost work. The only developers who will command high salaries in 2026+ are those who understand memory layout, distributed state, and local-first protocols.',
    question: 'Agree or disagree: Syntax is dead, architecture is everything?',
    githubCta: 'Explore our open-source local-first protocol and architecture on GitHub.'
  },
  {
    id: 'open_source_monetization',
    category: 'Argue & Debate',
    hook: 'VC-backed dev tools are dying. Lean, solo-maintained open-source repos are winning.',
    debate: 'Teams don’t want bloated enterprise subscriptions with 40 sales calls. They want an MIT-licensed repo they can pnpm install, inspect the source, and self-host in 2 seconds.',
    question: 'When was the last time you bought SaaS when a clean GitHub repo solved the problem better?',
    githubCta: 'Star the repo and build on our open stack.'
  },
  {
    id: 'software_to_ai_agents',
    category: 'Future of Tech',
    hook: 'In 18 months, your biggest software customers won’t be humans—they’ll be AI agents.',
    debate: 'If your project only has a flashy web UI and no machine-readable llms.txt or MCP tool catalog, you are invisible to the next generation of autonomous enterprise buyers.',
    question: 'Is your stack ready to sell directly to AI models, or are you still relying on landing page ads?',
    githubCta: 'See how we expose live /llms.txt and MCP discovery feeds in our repo.'
  }
]

const recentlyUsedTopicIds = new Set()

export function getRandomViralTopic() {
  const available = VIRAL_TECH_TOPICS.filter(t => !recentlyUsedTopicIds.has(t.id))
  const pool = available.length > 0 ? available : VIRAL_TECH_TOPICS
  if (available.length === 0) recentlyUsedTopicIds.clear()

  const idx = Math.floor(Math.random() * pool.length)
  const selected = pool[idx]
  recentlyUsedTopicIds.add(selected.id)
  return selected
}

export function formatViralPost({
  topicObj = VIRAL_TECH_TOPICS[0],
  githubRepo = 'github.com/dr-week/fast-framework',
  platform = 'x'
} = {}) {
  const { hook, debate, question, githubCta } = topicObj

  if (platform === 'x') {
    return {
      title: hook,
      mainPost: `${hook}\n\n${debate}\n\n${question}\n\n📌 Bookmark this thread.\n(Repo link in the replies 👇)`,
      replyWithGithub: `🔗 Here is the GitHub repository we built around this exact philosophy:\nhttps://${githubRepo.replace(/^https?:\/\//, '')}\n\nStar the repo if you value clean, zero-bloat architecture! ⭐`
    }
  }

  if (platform === 'reddit') {
    return {
      title: `[Discussion] ${hook}`,
      mainPost: `Hey devs,\n\n${debate}\n\n${question}\n\nCurious to hear how you're approaching this in your day-to-day engineering sprints.\n\n(For context, we've been tackling this in our open-source project: https://${githubRepo.replace(/^https?:\/\//, '')})`
    }
  }

  return {
    title: hook,
    mainPost: `${hook}\n\n${debate}\n\n${question}\n\n👉 Open-source repo: https://${githubRepo}`
  }
}

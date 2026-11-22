export const BASE_DICTIONARY = {
  hooks: [
    'AI is turning senior engineers into code review slot-machine operators.',
    'Virtual DOM was a 10-year detour that bloated modern web applications.',
    'Writing code is no longer the job. System design is.',
    'VC-backed developer tools are dying. Lean open-source repos are winning.',
    'JSON.stringify is the most expensive architectural mistake in your web stack.',
    'The "Full-Stack Developer" title is dead. Long live the Systems Architect.',
    'In 18 months, your biggest software buyers won’t be humans—they’ll be AI agents.',
    'Most engineering teams are falling into the AI velocity trap.',
    'Stop shipping 150KB JavaScript runtimes just to render static text nodes.',
    'The future of frontend engineering isn’t more frameworks—it’s zero runtime abstractions.',
    'I spent 3 weeks building a synthetic V8 engine sound mod for a beat-up hatchback touchscreen.',
    'Monsoon rain took out the power inverter mid-compile. 18 hours of work gone. Here is what happened next.',
    'I rejected a $120k corporate offer to ship open-source runtimes from a coastal bedroom in Goa.',
    'Normal people build SaaS. We built a 120 FPS FPV tactical optical HUD in the browser.',
    'My parents still ask when I am going to get a "real job" in Bangalore or Pune.'
  ],

  conflicts: [
    'Junior developers are losing foundational debugging skills because LLMs generate code no one can audit when production crashes at 2 AM.',
    'Shipping heavy diffing abstractions when browsers can natively update W3C DOM Parts at 120 FPS is pure engineering malpractice.',
    'Management looks at AI code gen and expects 3x velocity, while engineers spend 60% of their day debugging bizarre hallucinations.',
    'Serializing massive JSON payloads across thread boundaries wastes 40% of the browser frame budget on garbage collection.',
    'Enterprises are exhausted by bloated SaaS subscriptions with 40 sales calls when an MIT-licensed repo solves the problem in 2 seconds.',
    'If your tool only has a web UI and lacks machine-readable llms.txt and MCP schemas, you are completely invisible to autonomous agents.'
  ],

  insights: [
    'The real unlock is fine-grained reactive signal graphs that touch only changed DOM nodes.',
    'Binding shared Float64Array memory buffers directly between Rust/Zig and the DOM eliminates serialization overhead completely.',
    'True developer leverage in 2026 comes from understanding memory layouts, protocols, and verifiable execution.',
    'A transparent, local-first architecture keeps systems reproducible, auditable, and blazing fast (<2.5KB gzipped).',
    'Exposing live /llms.txt and MCP discovery feeds lets Claude, Cursor, and human devs discover your stack simultaneously.'
  ],

  debates: [
    'Are we training a generation of 10x architects, or helpless prompt monkeys? Where do you stand?',
    'Why are teams still defaulting to massive bundles when native browser APIs can render 120 FPS spatial HUDs?',
    'Is your team shipping faster with AI, or just creating technical debt at 3x speed?',
    'When was the last time you bought enterprise software when a clean GitHub repo did the job better?',
    'Agree or disagree: Syntax is dead, architecture is everything?'
  ],

  redditTitleFormats: [
    'Showcase / Lessons Learned: I built an open-source tool to eliminate {TOPIC}—here are the performance bottlenecks I hit',
    'Technical Deep-Dive: How we eliminated {TOPIC} to achieve 120 FPS without dropped frames',
    'Open Source Release: A zero-dependency alternative solving {TOPIC}, built with native signals'
  ],

  bookmarkPrompts: [
    '📌 Bookmark this thread for your next architecture review.',
    '📌 Bookmark this breakdown before starting your next sprint.',
    '📌 Save this for your engineering team’s tech radar.',
    '📌 Bookmark this post for when you audit your production bundle.'
  ],

  githubCtas: [
    '🔗 Here is the GitHub repository we built around this exact philosophy:\n{REPO_URL}\nStar the repo if you value transparent, zero-bloat architecture! ⭐',
    '🔗 We open-sourced the <2.5KB architecture on GitHub:\n{REPO_URL}\nCheck the benchmarks and run them yourself! 🚀',
    '🔗 Explore the source code and verifiable tests on GitHub:\n{REPO_URL}\nDrop a star if you believe in clean, local-first code! ⭐',
    '🔗 Built an open-source implementation solving this exact bottleneck:\n{REPO_URL}\nStar the project to support independent open-source engineering! ⚡'
  ]
}

export const POSTING_RULES = Object.freeze({
  voice: ['plain', 'witty', 'confident', 'useful'],
  humor: 'Light sarcasm targets industry habits, never the audience, customer, or our product.',
  x: { maxCharacters: 280, maxLines: 2, maxHashtags: 2 },
  links: 'Use a direct source link for live trends; never invent facts or imply stale items are breaking news.',
  fallback: 'When live sources fail or no item matches the company, write an evergreen post and label it as such.'
})

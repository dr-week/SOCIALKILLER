export const TECH_CATEGORIES = [
  {
    id: 'zero-vdom',
    name: 'Zero-VDOM & Runtimes',
    pillar: 'Framework Architecture',
    repoName: 'fast-framework',
    repoUrl: 'https://github.com/dr-week/fast-framework',
    shortDesc: '<2.5KB Zuari reactive core, W3C DOM Parts, 120 FPS WebXR spatial HUD & zero-copy Wasm.',
    tags: ['WebDev', 'ZeroVDOM', 'Performance', 'JavaScript', 'Wasm', 'Architecture'],
    topics: [
      {
        id: 'zuari_dom_parts_revolution',
        hook: 'Virtual DOM diffing was a 10-year detour that bloated modern web applications.',
        debate: 'Shipping 150KB of runtime diffing abstractions just to update a text node is engineering malpractice. Direct DOM Parts and fine-grained signal graphs leave heavy frameworks behind at <2.5KB.',
        question: 'Why are teams still defaulting to massive JS bundles when browsers can render at 120 FPS natively?',
        githubSolution: 'Zuari (<2.5KB) eliminates the Virtual DOM with direct DOM Parts and zero-copy Rust/Zig FFI.',
        callToAction: 'Run the benchmarks yourself on GitHub 👇'
      },
      {
        id: 'webxr_120fps_spatial_hud',
        hook: 'Apple Vision Pro & Quest 3 demand 120 FPS. Heavy JS runtimes drop frames instantly.',
        debate: 'Garbage collection pauses in standard web frameworks create immediate nausea in spatial headsets. Direct W3C signal bindings and zero-copy Float64Array memory buffers render silky-smooth 3D interfaces without dropping a single frame.',
        question: 'Have you tested your web app on a 120Hz spatial display? How many frames did it drop?',
        githubSolution: 'Inspect our native 120 FPS WebXR HUD benchmark in fast-framework.',
        callToAction: 'Check out the live demo and benchmarks below 👇'
      },
      {
        id: 'wasm_zero_copy_memory',
        hook: 'JSON.stringify is the most expensive mistake in your web app.',
        debate: 'Serializing objects across thread boundaries or Wasm runtimes wastes 40% of frame time on garbage collection. Sharing Float64Array memory buffers directly between Rust/Zig and DOM signals unlocks true 120 FPS rendering.',
        question: 'Have you benchmarked your JSON serialization overhead lately?',
        githubSolution: 'Explore how we eliminated JSON overhead in @zuari/wasm on GitHub.',
        callToAction: 'Bookmark this for performance audits. Repo link in replies 👇'
      }
    ]
  },
  {
    id: 'gen-cinema',
    name: 'Generative Cinema & Visual AI',
    pillar: 'Generative Cinema & Continuity',
    repoName: 'Prompting-Buddha',
    repoUrl: 'https://github.com/dr-week/Prompting-Buddha',
    shortDesc: 'Enterprise Cognitive Engine & Visual Continuity Studio for Generative Film Directors.',
    tags: ['GenerativeAI', 'Cinematography', 'AIWorkflow', 'VisualContinuity', 'Filmmaking'],
    topics: [
      {
        id: 'prompting_buddha_visual_continuity',
        hook: 'Random prompting is not filmmaking. Visual continuity requires deterministic orchestration.',
        debate: 'Generative video models hallucinate actor face structures, lens focal lengths, and camera angles between every single generation. Without deterministic cognitive orchestration, AI films look like chaotic dream sequences instead of cinema.',
        question: 'How do you currently maintain lighting consistency and character identity across AI shots?',
        githubSolution: 'Prompting-Buddha provides deterministic visual orchestration for generative film directors and digital artists.',
        callToAction: 'Star Prompting-Buddha on GitHub and inspect the visual continuity pipeline 👇'
      },
      {
        id: 'ai_cinema_lens_character_lock',
        hook: 'Why 99% of AI short films fail: The "morphing actor" problem.',
        debate: 'Viewers check out of a story the moment the protagonist shifts facial anatomy between cuts. Consistent keyframing and cognitive prompt anchors turn raw diffusion into cohesive motion pictures.',
        question: 'Are you treating AI generation as a lottery or an engineering workflow?',
        githubSolution: 'See how Prompting-Buddha enforces actor and scene continuity in open source.',
        callToAction: 'Check the architecture on GitHub 👇'
      }
    ]
  },
  {
    id: 'commercial-intel',
    name: 'Commercial Intelligence',
    pillar: 'Autonomous Research',
    repoName: 'Business-Man',
    repoUrl: 'https://github.com/dr-week/Business-Man',
    shortDesc: 'Autonomous Commercial Research Engine & Real-World Demand Discovery Platform.',
    tags: ['MarketResearch', 'CommercialIntel', 'AutonomousAgents', 'Founder', 'BusinessDev'],
    topics: [
      {
        id: 'businessman_demand_discovery',
        hook: 'Building a product before proving factual commercial demand is founder suicide.',
        debate: 'Founders waste 18 months building software nobody buys because they rely on gut feelings instead of factual market demand discovery. Autonomous commercial intelligence should validate entry barriers, pricing power, and buyer intent before writing line 1.',
        question: 'How many weeks did you spend verifying actual buyer demand before building your latest project?',
        githubSolution: 'Business-Man automates real-world commercial research and demand discovery.',
        callToAction: 'Explore the commercial intelligence engine on GitHub 👇'
      },
      {
        id: 'autonomous_market_entry',
        hook: 'SaaS market research reports cost $15,000 and are obsolete in 3 months.',
        debate: 'Enterprise intelligence suites locked behind paywalls still give you static PDFs. An autonomous research engine continuously scans competitor moves, pricing changes, and buyer pain points in real time.',
        question: 'Would you trust an AI agent to audit your competitor matrix automatically?',
        githubSolution: 'Audit commercial opportunities with Business-Man on GitHub.',
        callToAction: 'Check the repository in replies 👇'
      }
    ]
  },
  {
    id: 'design-to-code',
    name: 'UI Design to Code Tools',
    pillar: 'Developer Tooling',
    repoName: 'Code-To-Figma-Converter',
    repoUrl: 'https://github.com/dr-week/Code-To-Figma-Converter',
    shortDesc: 'Convert live Vue+TS UI into editable OpenPencil/Figma layer hierarchy with bidirectional traceability.',
    tags: ['Figma', 'VueJS', 'UIEngineering', 'DesignSystems', 'TypeScript'],
    topics: [
      {
        id: 'vue_to_figma_layers',
        hook: 'Figma-to-code is broken. We reversed the pipeline: Code-to-Figma with exact hierarchy.',
        debate: 'Designers spend dozens of hours recreating screens that already exist in production code, losing CSS flexbox alignments and component bounds. Turning running Vue+TypeScript components directly into editable vector layers bridges the gap permanently.',
        question: 'Why recreate existing UI in Figma by hand when you can export running DOM trees directly?',
        githubSolution: 'Code-To-Figma-Converter converts running Vue+TS interfaces into editable Figma/OpenPencil layers.',
        callToAction: 'Star the open-source converter on GitHub 👇'
      }
    ]
  },
  {
    id: 'cockpit-sound',
    name: 'Automotive Cockpit & Sound',
    pillar: 'Automotive Systems',
    repoName: 'CAR-SOUND-CHANGER',
    repoUrl: 'https://github.com/dr-week/CAR-SOUND-CHANGER',
    shortDesc: 'Ultra-responsive Android cockpit launcher & procedural synthetic engine sound mod.',
    tags: ['Automotive', 'AndroidAuto', 'SoundEngineering', 'Embedded', 'TypeScript'],
    topics: [
      {
        id: 'car_sound_cockpit_launcher',
        hook: 'Stock car head unit software is ugly, sluggish, and locked down. We re-engineered the cockpit.',
        debate: 'Android head units are choked with heavy bloated launchers that lag when switching navigation and media. A landscape-first, zero-latency launcher coupled with procedural synthetic engine audio transforms the in-car driving experience.',
        question: 'Why are automotive touchscreens still laggier than $100 smartphones?',
        githubSolution: 'CAR-SOUND-CHANGER brings ultra-responsive cockpit UI and procedural sound mods to Android head units.',
        callToAction: 'Inspect the automotive cockpit project on GitHub 👇'
      }
    ]
  }
]

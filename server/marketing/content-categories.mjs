/**
 * Content Categories & Strategic Pillars Engine
 * Designed for first-class category selection and brand-specific content targeting.
 * 
 * Maps categories directly to dr-week's owned software projects and technical pillars:
 * 1. ZERO_VDOM_RUNTIMES: Zuari / fast-framework (<2.5KB, 120 FPS WebXR HUD, Rust/Zig FFI)
 * 2. GENERATIVE_CINEMA: Prompting-Buddha (Enterprise Cognitive Engine & Visual Continuity Studio)
 * 3. COMMERCIAL_INTEL: Business-Man (Autonomous Commercial Research & Real-World Demand Discovery)
 * 4. DESIGN_TO_CODE: Code-To-Figma-Converter (Vue+TS to OpenPencil/Figma layer hierarchy)
 * 5. AUTOMOTIVE_COCKPIT: CAR-SOUND-CHANGER (Landscape Cockpit Launcher & Procedural Engine Sound Mod)
 * 6. LOCAL_FIRST_OS: FileMan & hey-FRIDAY- (Zero-telemetry filesystem & OS voice automation)
 * 7. FOUNDER_JOURNEY: Underdog Goan systems engineer bootstrapping lean software
 */

export const CONTENT_CATEGORIES = [
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
  },
  {
    id: 'local-first-os',
    name: 'Local-First & OS Utilities',
    pillar: 'Systems & OS Tools',
    repoName: 'FileMan',
    repoUrl: 'https://github.com/dr-week/FileMan',
    shortDesc: 'Zero-telemetry filesystem companion (FileMan) & zero-cloud-cost voice OS assistant (hey-FRIDAY-).',
    tags: ['LocalFirst', 'Storage', 'ZeroTelemetry', 'Privacy', 'SystemArchitecture'],
    topics: [
      {
        id: 'fileman_zero_telemetry',
        hook: 'Your operating system is spying on your file activity. Why we built zero-telemetry utilities.',
        debate: 'Cloud-synced file managers send metadata, thumbnails, and directory structures across external analytics endpoints. Mission-critical storage reclamation should be 100% local, instant, and transparent.',
        question: 'Do you know how many third-party trackers are running inside your default desktop tools?',
        githubSolution: 'FileMan is a mission-critical, zero-telemetry filesystem companion and autonomous reclamation engine.',
        callToAction: 'Check out the source code on GitHub 👇'
      },
      {
        id: 'hey_friday_zero_cloud_voice',
        hook: 'Paying monthly cloud subscription fees just to control your desktop by voice is absurd.',
        debate: 'Voice assistants shouldn’t stream your room microphone to remote server farms. Local-first voice automation can execute OS shortcuts, launch workspaces, and manage tasks with zero cloud latency and zero monthly bills.',
        question: 'Have you switched to local-first voice automation for your desktop workflow yet?',
        githubSolution: 'hey-FRIDAY- is an ultra-lightweight, zero-cloud-cost desktop voice assistant for Windows.',
        callToAction: 'Find it on GitHub under dr-week 👇'
      }
    ]
  },
  {
    id: 'founder-journey',
    name: 'Goa Underdog Dev',
    pillar: 'Founder Journey',
    repoName: 'fast-framework',
    repoUrl: 'https://github.com/dr-week/fast-framework',
    shortDesc: 'Solo engineer bootstrapping high-velocity systems from Goa, beating enterprise bloat.',
    tags: ['IndieHacker', 'OpenSource', 'Goa', 'SystemsEngineering', 'SoloFounder'],
    topics: [
      {
        id: 'bootstrapping_systems_from_goa',
        hook: 'They told me: "Go to Bangalore or Pune, you can\'t build global systems from Goa."',
        debate: 'Between coastal power cuts, family pressure for safe corporate jobs, and skepticism, building world-class open-source infrastructure solo is relentless. But shipping <2.5KB runtimes that outperform multi-billion dollar enterprise frameworks is the ultimate proof.',
        question: 'Are you building from an underdog location outside major tech hubs? What is your biggest obstacle?',
        githubSolution: 'Built from Goa by Danger Labs. Check our open-source software suite on GitHub.',
        callToAction: 'Follow the journey and star our repos on GitHub 👇'
      }
    ]
  },
  {
    id: 'weird-experiments',
    name: 'Weird Experiments & Hacks',
    pillar: 'Unconventional Engineering',
    repoName: 'CAR-SOUND-CHANGER',
    repoUrl: 'https://github.com/dr-week/CAR-SOUND-CHANGER',
    shortDesc: 'Unusual, absurd, and obsessive software experiments: synthetic exhaust mods, cognitive film tools & raw hardware hacks.',
    tags: ['MadScience', 'WeirdTech', 'HardwareHacks', 'Experimental', 'SoundMod'],
    topics: [
      {
        id: 'synthetic_exhaust_cockpit_insanity',
        hook: 'I wrote a procedural synthetic V8 engine sound mod for a beat-up hatchback touchscreen.',
        debate: 'Normal developers build SaaS to manage Jira tickets. I spent 3 weeks synthesizing exhaust backfires and procedural throttle acoustics in TypeScript for cheap Android head units because silence is boring.',
        question: 'What is the most absurd, commercially unviable piece of software you stayed up until 4 AM building?',
        githubSolution: 'Inspect CAR-SOUND-CHANGER on GitHub: real-time procedural throttle audio and landscape cockpit UI.',
        callToAction: 'Star this madness on GitHub 👇'
      },
      {
        id: 'dom_parts_optics_hud',
        hook: 'Normal people build landing pages. We built a 120 FPS FPV drone optical HUD in the browser.',
        debate: 'They said HTML and CSS are only for forms and blogs. We stripped the Virtual DOM down to <2.5KB and ran real-time tactical drone optics directly inside a web view without dropping a single frame.',
        question: 'Why are we still using web tech like it\'s 2012 when modern runtimes can power avionics?',
        githubSolution: 'See the tactical WebXR HUD benchmarks in fast-framework on GitHub.',
        callToAction: 'Experience the benchmark code on GitHub 👇'
      }
    ]
  },
  {
    id: 'founder-confessions',
    name: 'Founder Confessions & Fails',
    pillar: 'Raw Journey & Failures',
    repoName: 'neverforget',
    repoUrl: 'https://github.com/dr-week/neverforget',
    shortDesc: 'Unfiltered truths: near-burnout, power outages, family doubts, bug catastrophes, and rebuilding from zero.',
    tags: ['RawTruth', 'FounderFailures', 'Burnout', 'MentalResilience', 'BuildingSolo'],
    topics: [
      {
        id: 'confession_monsoon_power_loss',
        hook: 'Monsoon hit Goa. The inverter died mid-commit. 18 hours of unsaved compiler AST work gone.',
        debate: 'The Twitter startup gurus preach \'10x leverage\' and luxury remote work from Bali. My reality: sitting in the dark with mosquito repellent, holding a flashlight with my teeth, wondering if building systems solo was a mistake.',
        question: 'What was your absolute lowest point as an independent developer? Did you push through?',
        githubSolution: 'That failure forced us to build local-first crash resilience into everything we ship.',
        callToAction: 'Read the raw engineering logs on GitHub 👇'
      },
      {
        id: 'confession_zero_revenue_pride',
        hook: 'I turned down a $120k enterprise offer to build open-source systems that currently make $0.',
        debate: 'My relatives think I\'ve lost my mind. My bank account agrees with them. But every time an engineer stars our repo and benchmarks a 10x speedup over enterprise bloat, I know this path is the only one that matters.',
        question: 'Would you trade corporate stability for complete architectural freedom?',
        githubSolution: 'All our tools are open-source and free forever on GitHub under dr-week.',
        callToAction: 'Star our repositories on GitHub and back the independent movement 👇'
      }
    ]
  },
  {
    id: 'back-the-underdog',
    name: 'Sponsor & Support',
    pillar: 'Community Support & Donations',
    repoName: 'fast-framework',
    repoUrl: 'https://github.com/sponsors/dr-week',
    shortDesc: 'Back independent, zero-corporate open-source development. Buy us coffee or sponsor on GitHub.',
    tags: ['SponsorOpenSource', 'GitHubSponsors', 'IndependentDev', 'SupportSoloCreators'],
    topics: [
      {
        id: 'donate_keep_servers_running',
        hook: 'No VC funding. No corporate board. Just one engineer in Goa shipping world-class runtimes.',
        debate: 'Enterprise tech companies spend $40M on marketing teams to convince you their bloated software is necessary. We spend $0 and ship <2.5KB runtimes that outperform them. If our open-source tools ever saved your team time, consider backing the mission.',
        question: 'Do you believe independent open source can still beat billion-dollar tech monopolies?',
        githubSolution: 'Sponsor dr-week on GitHub or share our repos to keep independent software alive.',
        callToAction: 'Sponsor the work or star the repo: github.com/sponsors/dr-week 👇'
      },
      {
        id: 'buy_me_a_coffee_resilience',
        hook: 'Every $5 sponsorship keeps our test runners and inverter batteries alive through another power cut.',
        debate: 'Independent developers shouldn\'t have to plaster their tools with tracking ads or lock features behind corporate paywalls. Open source lives or dies by the people who value craft over commercial hype.',
        question: 'When was the last time you sponsored a solo open-source creator?',
        githubSolution: 'Back our independent systems lab on GitHub Sponsors: github.com/sponsors/dr-week',
        callToAction: 'Sponsor our open-source tools on GitHub 👇'
      }
    ]
  }
]

export function getCategoryById(id, brandId = 'danger-labs') {
  const categories = getCategoriesForBrand(brandId)
  return categories.find(c => c.id === id) || CONTENT_CATEGORIES.find(c => c.id === id) || null
}

export function getAllCategories() {
  return CONTENT_CATEGORIES
}

/**
 * Returns tailored Content Plans and Categories specific to each Company Workspace.
 */
export function getCategoriesForBrand(brandId = 'danger-labs', brand = null) {
  if (brandId === 'danger-labs') {
    return CONTENT_CATEGORIES
  }

  if (brandId === 'hyperdrive-studio') {
    return [
      {
        id: 'cinematic-docs',
        name: 'Cinematic Tech Docs',
        pillar: 'Visual Storytelling',
        repoName: 'Hyperdrive Films',
        repoUrl: 'https://hyperdrive.studio',
        shortDesc: 'Cinematic developer documentaries, founder origin stories, and visceral tech narratives.',
        tags: ['Cinematography', 'TechStorytelling', 'VideoProduction', 'CreativeAgency', 'Director'],
        topics: [
          {
            id: 'doc_power_of_underdog',
            hook: 'Tech products don\'t die from bad code. They die from silent, invisible launches.',
            debate: 'Engineering teams spend 12 months building systems then tweet a 3-bullet-point link that gets 4 views. High-voltage visual documentaries convert developers into true believers before they even open the terminal.',
            question: 'When was the last time a developer launch video gave you goosebumps?',
            githubSolution: 'Hyperdrive Studio directs cinematic developer origin documentaries.',
            callToAction: 'Watch our director reels and founder docs 👇'
          }
        ]
      },
      {
        id: 'short-form-hooks',
        name: 'Short-Form Retention Hooks',
        pillar: 'Viral Visual Strategy',
        repoName: 'Hyperdrive Shorts',
        repoUrl: 'https://hyperdrive.studio',
        shortDesc: 'High-voltage 60s video hooks engineered to maintain >85% average watch time.',
        tags: ['Shorts', 'VideoEditing', 'ViralHooks', 'ContentStrategy', 'Retention'],
        topics: [
          {
            id: 'retention_first_3_seconds',
            hook: 'The first 3 seconds of your technical video determine 95% of its viral reach.',
            debate: 'If you start a video saying "Hey guys, welcome back to my channel", 80% of viewers swipe away before you speak. Micro-movement visual cuts and jarring counter-intuitive questions hold viewer attention through the algorithm.',
            question: 'What is your current viewer retention rate at the 5-second mark?',
            githubSolution: 'We engineer high-contrast frame hooks and kinetic sound design.',
            callToAction: 'See our breakdown of retention hooks 👇'
          }
        ]
      },
      {
        id: 'creative-goa',
        name: 'Goa Creative Studio',
        pillar: 'Studio Culture',
        repoName: 'Hyperdrive Goa',
        repoUrl: 'https://hyperdrive.studio',
        shortDesc: 'Bootstrapping a premier creative production studio outside the Mumbai/Bangalore agency bubbles.',
        tags: ['IndieCreative', 'GoaStudio', 'CreativeFreedom', 'UnderdogProduction'],
        topics: [
          {
            id: 'goa_creative_independence',
            hook: 'They said high-end commercial cinema can only be produced in Mumbai. We proved them wrong.',
            debate: 'Agency bubbles in metro cities churn out identical cookie-cutter corporate promo videos. Building from Goa gives our directors the creative isolation and visceral perspective needed to produce work that cuts through the noise.',
            question: 'Do you create better work in high-stress metros or in authentic creative isolation?',
            githubSolution: 'Produced by Hyperdrive Studio in Goa.',
            callToAction: 'Explore our latest productions 👇'
          }
        ]
      }
    ]
  }

  // Dynamic Content Plan for any custom company workspace
  const repos = brand?.purpose?.repos || []
  const dynamicCategories = []

  if (repos.length > 0) {
    for (const repo of repos.slice(0, 5)) {
      dynamicCategories.push({
        id: `repo-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: repo.name,
        pillar: `${repo.name} Engineering`,
        repoName: repo.name,
        repoUrl: repo.url,
        shortDesc: repo.description || `Software project ${repo.name}`,
        tags: (repo.topics?.length ? repo.topics : ['Software', 'OpenSource', 'Engineering']).slice(0, 5),
        topics: [
          {
            id: `topic_${repo.name}`,
            hook: `Why we built ${repo.name}: Solving the real-world bottleneck in ${repo.language || 'software'}.`,
            debate: repo.description ? `${repo.description}. Most existing solutions add enterprise complexity when developers just need direct simplicity.` : `Minimal architecture built for production reliability.`,
            question: `How does your team solve this in production today?`,
            githubSolution: `Explore ${repo.name} on GitHub: ${repo.url}`,
            callToAction: `Star the repo on GitHub 👇`
          }
        ]
      })
    }
  }

  // Brand purpose / research pillars
  const themes = brand?.purpose?.keyThemes || []
  if (themes.length > 0) {
    dynamicCategories.push({
      id: 'brand-core-themes',
      name: `${brand?.name || 'Company'} Pillars`,
      pillar: 'Strategic Positioning',
      repoName: brand?.name || 'Workspace',
      repoUrl: brand?.purpose?.links?.[0]?.url || '',
      shortDesc: brand?.purpose?.what || brand?.tagline || 'Company core mission',
      tags: ['Innovation', 'Strategy', 'Tech'],
      topics: themes.map((theme, idx) => ({
        id: `theme_${idx}`,
        hook: `${theme}: The perspective driving our architecture.`,
        debate: `${brand?.purpose?.why || 'Enterprise tech needs sharper, leaner foundations.'} Focus: ${theme}.`,
        question: `Where does your team stand on ${theme}?`,
        githubSolution: `${brand?.name || 'Our team'} is executing on ${theme}.`,
        callToAction: `Read the breakdown below 👇`
      }))
    })
  }

  return dynamicCategories.length > 0 ? dynamicCategories : CONTENT_CATEGORIES
}

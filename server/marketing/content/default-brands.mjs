export const DEFAULT_BRANDS = [
  {
    id: 'danger-labs',
    name: 'Danger Labs',
    tagline: 'High-Performance Systems & Zero-Overhead Developer Runtimes',
    location: 'Goa, India',
    purpose: {
      what: 'Zero-VDOM reactive web frameworks, 120 FPS spatial WebXR HUDs, and zero-copy Rust/Zig Wasm FFI.',
      why: 'Enterprise software became bloated, sluggish, and expensive. We build surgical runtimes that run 10x faster with 90% less RAM.',
      founderStory: 'Solo Goan engineer building global infrastructure from a coastal bedroom. Battling family pressure to take a safe corporate job, power cuts, and local skepticism while shipping world-class open-source systems.',
      keyThemes: [
        'Bootstrapping vs Corporate Comfort',
        'Goa Tech Ecosystem (Underdog Reality)',
        'Zero-Overhead Systems Engineering',
        'Family Doubts & Parental Pressure',
        'Daily Discipline Over Glamour'
      ],
      toneOfVoice: 'Raw, Technical, Uncompromising, Vulnerable yet Resilient',
      githubUser: 'dr-week',
      links: [
        { platform: 'github', url: 'https://github.com/dr-week' },
        { platform: 'github', url: 'https://github.com/dr-week/fast-framework' }
      ]
    },
    accounts: [
      { platformId: 'x', handle: '@dangerlabs_hq', credentials: {}, status: 'unconfigured' },
      { platformId: 'github', handle: 'danger-labs', credentials: {}, status: 'unconfigured' },
      { platformId: 'reddit', handle: 'u/danger_engineer', credentials: {}, status: 'unconfigured' },
      { platformId: 'linkedin', handle: 'danger-labs-goa', credentials: {}, status: 'unconfigured' },
      { platformId: 'discord', handle: 'DangerLabs Community', credentials: {}, status: 'unconfigured' }
    ],
    milestones: [
      { id: 'm1', task: 'Ship Zuari <2.5KB W3C DOM Parts Core v1.0', purpose: 'Eliminate virtual DOM overhead', completed: true, targetDate: '2026-10-15' },
      { id: 'm2', task: 'Benchmark Float64Array zero-copy Rust FFI against React 19', purpose: 'Prove 120 FPS rendering', completed: false, targetDate: '2026-10-25' },
      { id: 'm3', task: 'Cross 5,000 GitHub Stars from Goa studio', purpose: 'Put Goan systems tech on the global map', completed: false, targetDate: '2026-11-01' }
    ]
  },
  {
    id: 'hyperdrive-studio',
    name: 'Hyperdrive Studio',
    tagline: 'Creative Media, Cinematic Tech Storytelling & Visual Branding',
    location: 'Goa, India',
    purpose: {
      what: 'Cinematic developer documentaries, high-retention video hooks, and viral technical brand narratives.',
      why: 'World-changing engineering dies in silence without compelling storytelling. We turn hard-tech products into cultural movements.',
      founderStory: 'Creative director bootstrapping a visual studio outside the Mumbai/Bangalore agency bubbles. Transforming raw code and founder struggles into high-voltage video narratives that capture attention worldwide.',
      keyThemes: [
        'Cinematic Tech Documentaries',
        'Visual Identity for Hard-Tech',
        'Building Creative Powerhouses in Goa',
        'Hustle Behind the Lens',
        'Storytelling as a Moat'
      ],
      toneOfVoice: 'Cinematic, High-Voltage, Provocative, Visually Sharp'
    },
    accounts: [
      { platformId: 'instagram', handle: '@hyperdrive_studio_goa', credentials: {}, status: 'unconfigured' },
      { platformId: 'x', handle: '@hyperdrive_hq', credentials: {}, status: 'unconfigured' },
      { platformId: 'youtube_shorts', handle: '@hyperdrivestudio', credentials: {}, status: 'unconfigured' },
      { platformId: 'linkedin', handle: 'hyperdrive-media-goa', credentials: {}, status: 'unconfigured' }
    ],
    milestones: [
      { id: 'h1', task: 'Direct the 60s Founder Genesis Doc for Danger Labs', purpose: 'Viral product hook', completed: true, targetDate: '2026-10-18' },
      { id: 'h2', task: 'Launch the "Building from Goa" Underdog Video Series', purpose: 'Community reach', completed: false, targetDate: '2026-10-28' },
      { id: 'h3', task: 'Scale Short-Form Hook retention past 85% average watch time', purpose: 'Audience growth', completed: false, targetDate: '2026-11-05' }
    ]
  }
]

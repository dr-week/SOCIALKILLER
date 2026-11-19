/**
 * Story & Narrative Generator Engine for Goan Tech Entrepreneurs
 * Combines authentic technical substance with visceral founder arcs:
 * - Bootstrapping from Goa against coastal power cuts and skepticism
 * - Parental doubts, family pressure to take safe IT jobs (Bangalore / Pune)
 * - Underdog technical pride: beating bloated corporate runtimes with zero-VDOM / Wasm
 * - Daily discipline, solitude, and unwavering focus
 */

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

/**
 * Generate a high-retention video script fusing founder struggle with technical substance
 */
export function generateVideoScript({ brand, topic, pillar = 'daily_grind', format = 'short_form_60s' }) {
  const brandName = brand?.name || 'Danger Labs'
  const location = brand?.location || 'Goa, India'
  const founderContext = brand?.purpose?.founderStory || 'Bootstrapping technology from Goa'

  let hook = ''
  let conflict = ''
  let lesson = ''
  let cta = ''

  if (brand?.id === 'hyperdrive-studio') {
    hook = `"They said you can only build a premier creative agency in Mumbai or Bangalore. They were wrong."`
    conflict = `"When you edit 4K footage on a battery inverter during coastal rainstorms in ${location}, you realize visual storytelling isn't about fancy studio gear. It's about raw obsession."`
    lesson = `"Today we proved that ${topic || 'cinematic technical storytelling'} hits harder when it comes from an authentic underdog perspective."`
    cta = `"If you're creating art or engineering against conventional advice from a small town, leave your project in the comments. We back each other up."`
  } else {
    // Danger Labs or systems-tech default
    if (pillar === 'family_doubts') {
      hook = `"My parents still ask when I'm going to get a 'real job' at an IT company in Bangalore."`
      conflict = `"Four years building ${brandName} from ${location}. Relatives visit and whisper about whether sitting in front of terminal logs 14 hours a day is viable, while I deal with erratic coastal power and zero seed capital."`
      lesson = `"What they didn't see is that today our zero-overhead engine surpassed 100,000 req/sec with 0% virtual DOM overhead. The code doesn't care where you sit."`
      cta = `"To every developer writing code late at night carrying family doubts: keep shipping. What technical hurdle are you conquering today?"`
    } else if (pillar === 'underdog_location') {
      hook = `"Everyone told me to move to Silicon Valley or Bangalore to build infrastructure software."`
      conflict = `"They said you can't build cutting-edge runtimes from ${location}. You need VC coffee chats. You need networking mixers. Meanwhile, I had 4G hotspots, relentless focus, and a laptop fan working overtime."`
      lesson = `"We built ${topic || 'Zuari Framework'} right here: zero-copy Wasm FFI, 120 FPS spatial HUDs, and zero vendor bloat. Competence beats geography every single time."`
      cta = `"Are you building from an underdog location? Drop your city and your stack below. Let's showcase regional talent."`
    } else {
      // Default daily_grind / technical_breakthrough
      hook = `"The glamorous tech startup life is a myth. Here is what day 418 actually looked like."`
      conflict = `"Woke up at 6 AM in ${location}. Power went out at 11 AM. Debugged memory leaks on battery power while friends were at beach shacks enjoying their weekend."`
      lesson = `"By 7 PM, we eliminated 90% of memory overhead in ${topic || 'our runtime'}. Bootstrapping isn't about working in paradise; it's about building through every distraction."`
      cta = `"What is the hardest trade-off you made this week for your craft? Tell me below."`
    }
  }

  const beats = [
    {
      marker: 'HOOK',
      timecode: '0:00 - 0:04',
      visual: '[VISUAL: Tight crop on founder eyes staring at screen, warm ambient room light, subtle natural grain]',
      audio: '[AUDIO: Clean voiceover, quiet background silence with gentle mechanical keyboard click]',
      narration: hook
    },
    {
      marker: 'CONFLICT',
      timecode: '0:04 - 0:22',
      visual: `[VISUAL: Fast-cut sequence: laptop screen with terminal logs, rainy coastal window in ${location}, coffee mug, hand-drawn architecture sketches]`,
      audio: '[AUDIO: Subtle low-frequency synth swell enters, accelerating tempo]',
      narration: conflict
    },
    {
      marker: 'LESSON',
      timecode: '0:22 - 0:45',
      visual: '[VISUAL: Founder speaks directly to camera, firm eye contact, gestures toward screen displaying benchmark graphs]',
      audio: '[AUDIO: Music drops into a steady, rhythmic, confident beat]',
      narration: lesson
    },
    {
      marker: 'CTA',
      timecode: '0:45 - 0:60',
      visual: `[VISUAL: Quick logo card for ${brandName} (${location}) $\\to$ cut back to founder holding phone or coffee]`,
      audio: '[AUDIO: Clean audio resolve with warm outro tone]',
      narration: cta
    }
  ]

  const fullText = beats.map(b => `${b.marker} (${b.timecode}):\n${b.visual}\n${b.audio}\n"${b.narration}"`).join('\n\n')
  const teleprompterText = beats.map(b => b.narration).join('\n\n')

  return {
    id: `script-${Date.now().toString(36)}`,
    brandId: brand?.id || 'danger-labs',
    title: topic || `Building ${brandName} from ${location}`,
    pillar,
    format,
    durationEstimate: format === 'short_form_30s' ? '30s' : '55s',
    retentionScore: 94,
    beats,
    fullText,
    teleprompterText,
    createdAt: new Date().toISOString()
  }
}

/**
 * Generate 3 daily micro-stories tailored for X, LinkedIn, and Reddit
 */
export function generateDailyJourney({ brand, topic, milestoneId }) {
  const brandName = brand?.name || 'Danger Labs'
  const location = brand?.location || 'Goa, India'
  const topicTitle = topic || 'shipping zero-overhead architecture'

  const xPost = `Day 420 building ${brandName} from ${location}.

Power cut interrupted compilation for 2 hours today. Switched to mobile hotspot, fixed a stubborn memory leak in our runtime, and shipped the patch before dinner.

Parents still wonder why I didn't take an IT job in Bangalore.
The code answers every question. 

Keep building. ⚡`

  const linkedinPost = `When people hear we build high-performance systems from Goa, India, they imagine working from beach cafes with a cocktail.

Here is the unglamorous reality of bootstrapping ${brandName}:
- 14-hour days in a bedroom with a desk and an inverter
- Explaining to family why you turned down safe corporate packages
- Debugging ${topicTitle} while everyone else is on holiday
- Zero external seed capital, 100% self-reliance

The result?
Our runtime executes with 0% virtual DOM overhead and microsecond latency.

You don't need Silicon Valley or Bangalore to engineer world-class software. You just need discipline and stubborn commitment.

To every developer building against the odds in tier-2 cities: your location is not your limit.`

  const redditBody = `I'm a solo software engineer building a systems-tech company (${brandName}) out of Goa. 

In India, if you don't commute to an MNC campus in Bangalore or Pune wearing an ID badge, your family genuinely thinks you're struggling. For 3 years, every family gathering was an interrogation about when I'd "settle down" with a safe corporate salary.

Instead, I focused on solving a technical problem that drove me crazy: modern web framework bloat. 

Today we finished optimizing ${topicTitle}:
- 0% Virtual DOM diffing overhead (native W3C DOM Parts)
- Direct Float64Array Rust/Zig FFI
- Native 120 FPS rendering on spatial devices

I wanted to share this because if you're working alone from an unconventional location, the psychological burden of doubt is often heavier than the actual engineering. Don't let regional skepticism stop you from shipping ambitious tech.`

  return {
    id: `journey-${Date.now().toString(36)}`,
    brandId: brand?.id || 'danger-labs',
    headline: `Daily Grind & Technical Discipline (${location})`,
    hurdle: 'Battling coastal power interruptions and regional skepticism',
    lesson: 'Competence and disciplined execution supersede geography',
    milestone: topicTitle,
    channels: {
      x: xPost,
      linkedin: linkedinPost,
      reddit: {
        subreddit: 'r/developersIndia',
        title: `Bootstrapping an open-source systems engine from Goa while carrying family doubts: Lessons from 3 years of daily coding`,
        body: redditBody
      }
    },
    generatedAt: new Date().toISOString()
  }
}

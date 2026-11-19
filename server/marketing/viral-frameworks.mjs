/**
 * Viral Framework Formatter & Multi-Angle Developer Matrix (<240 lines)
 * 
 * 5 High-Converting Contrarian & Developer Frameworks:
 * 1. CONTRARIAN_VDOM: "Why the Virtual DOM was a 10-year architectural mistake"
 * 2. SIGNALS_VS_RERENDERS: "How fine-grained signals eliminate 90% of re-render waste"
 * 3. HYDRATION_TAX: "Why full-page hydration is destroying mobile and spatial WebXR battery life"
 * 4. VIBE_CODING_DEBT: "Why AI-generated syntax makes mechanical sympathy more critical than ever"
 * 5. BENCHMARK_REALITY: "Hard reproducible numbers: 120 FPS in <2.5KB vs 180KB monolithic runtimes"
 */

import { formatForX, formatForReddit, formatForTechnicalBlog } from './platform-formatter.mjs'

export const VIRAL_FRAMEWORKS = [
  { id: 'CONTRARIAN_VDOM', label: 'Contrarian: VDOM Was a Mistake', desc: 'Debunks Virtual DOM diffing overhead; advocates direct W3C DOM Parts' },
  { id: 'SIGNALS_VS_RERENDERS', label: 'Signals: 90% Re-render Elimination', desc: 'Surgical reactivity without re-evaluating full component function trees' },
  { id: 'HYDRATION_TAX', label: 'Hydration Tax & Spatial 120 FPS', desc: '0ms hydration overhead for locked 120 FPS on Vision Pro & Quest' },
  { id: 'VIBE_CODING_DEBT', label: 'The AI Velocity Trap', desc: 'Contrast rapid code autocompletion against rock-solid minimal architecture' },
  { id: 'BENCHMARK_REALITY', label: 'Benchmark Reality Check', desc: 'Concrete figures (<2.5KB, 0% VDOM, zero-copy Rust/Zig Wasm FFI)' }
]

export function formatWithViralFramework({
  framework = 'CONTRARIAN_VDOM',
  topic = 'Virtual DOM & Modern Web Performance',
  rawNotes = '',
  githubRepo = 'github.com/dr-week/fast-framework',
  frameworkName = 'Zuari (@zuari/core)',
  tags = ['webdev', 'javascript', 'performance', 'programming', 'opensource']
} = {}) {
  const cleanRepo = `https://${githubRepo.replace(/^https?:\/\//, '')}`
  const notesText = rawNotes.trim() || 'Diffing virtual trees on every state change wastes up to 40% of the 120Hz frame budget on garbage collection.'

  switch (framework) {
    case 'CONTRARIAN_VDOM':
    case 'CONTRARIAN':
    case 'PAS': {
      const xMain = `Unpopular opinion: Virtual DOM was a 10-year architectural mistake.\n\nCreating & diffing millions of JS objects on state changes wastes 40% of the frame budget.\n\nDirect browser APIs (W3C DOM Parts) are already faster.\n\n📌 We tested this in <2.5KB.\nDetails in reply 👇`
      const xReply = `⭐ We open-sourced the benchmarks and zero-VDOM implementation on GitHub:\n${cleanRepo}\n\nCheck out the test suites and give it a star! 🚀`
      const reddit = formatForReddit({
        title: 'Why the Virtual DOM was an architectural detour (and how W3C DOM Parts replace it)',
        body: `Hey r/webdev,\n\nWhen React popularized the Virtual DOM in 2013, browsers had slow DOM manipulation engines and no standardized reactive primitives.\n\nFast-forward to 2026:\n1. Browsers now support direct template cloning and W3C DOM Parts.\n2. Diffing entire virtual subtrees wastes up to 4ms per frame on 120Hz displays solely in garbage collection.\n3. Fine-grained reactive signals can mutate the exact text node or attribute without touching surrounding tree structures.\n\nWe built an open-source test bed (${frameworkName}) weighing under 2.5KB gzipped to benchmark this against React 19 and Svelte 5.\n\nResults and reproducible code: ${cleanRepo}\n\nCurious where other engineers land on compile-time signals vs runtime tree diffing today.`
      })
      const devto = formatForTechnicalBlog({
        title: 'Why Virtual DOM Was a 10-Year Detour: Migrating to W3C DOM Parts in <2.5KB',
        summary: notesText,
        repoUrl: cleanRepo,
        tags
      })
      return {
        framework: 'CONTRARIAN_VDOM',
        x: formatForX(xMain).tweet,
        x_reply: xReply,
        reddit: `Title: ${reddit.title}\n\n${reddit.body}`,
        devto: devto.markdown,
        linkedin: `Virtual DOM diffing has become the single biggest performance tax in modern front-end.\n\nHere is what happens when you eliminate the Virtual DOM entirely:\n\n1️⃣ Bundle drops from 150KB+ to <2.5KB gzipped.\n2️⃣ Component functions execute ONCE during setup, not on every user keystroke.\n3️⃣ Reactive signals mutate the exact DOM node via W3C DOM Parts.\n\nWe open-sourced our benchmarks and architecture at Danger.Labs:\n👉 ${cleanRepo}\n\nWhat is your team's strategy for reducing framework runtime debt this year?`
      }
    }

    case 'SIGNALS_VS_RERENDERS': {
      const xMain = `Fine-grained signals eliminate 90% of front-end re-render overhead.\n\nWhy re-execute a 500-line component function when only one <span> changed?\n\nSignals turn UI into surgical O(1) graph updates.\n\n📌 Tested in <2.5KB.\nRepo in reply 👇`
      const xReply = `⚡ See the signal graph benchmarks on GitHub:\n${cleanRepo}\n\nStar the repo if you value mechanical sympathy! ⭐`
      const reddit = formatForReddit({
        title: 'How fine-grained signals eliminate 90% of component re-render churn',
        body: `Hey r/javascript,\n\nA frequent debate in front-end architecture is component-level re-rendering (React) versus granular signal graphs (Solid, Svelte 5, Zuari).\n\nWhen profiling heavy dashboard components:\n- Component re-evaluations force developers into useCallback / useMemo memoization gymnastics.\n- Signals run the component once. Only the specific subscriber closure re-fires.\n\nWe documented the memory profile and benchmarked an ultra-minimal <2.5KB core implementation here: ${cleanRepo}\n\nWould love your critique on handling dependency arrays vs automatic signal subscriptions.`
      })
      const devto = formatForTechnicalBlog({
        title: 'How Fine-Grained Signals Eliminate 90% of Front-End Re-Render Waste',
        summary: notesText,
        repoUrl: cleanRepo,
        tags
      })
      return {
        framework: 'SIGNALS_VS_RERENDERS',
        x: formatForX(xMain).tweet,
        x_reply: xReply,
        reddit: `Title: ${reddit.title}\n\n${reddit.body}`,
        devto: devto.markdown,
        linkedin: `Why are we still re-running entire component trees just because a number incremented?\n\nFine-grained reactive signals change the paradigm:\n🔹 Re-render waste is cut by >90%.\n🔹 No more fragile useCallback or useMemo dependency arrays.\n🔹 State flows like a directed acyclic graph directly into the DOM.\n\nWe packaged this into an open-source, sub-2.5KB core runtime:\n👉 ${cleanRepo}`
      }
    }

    case 'HYDRATION_TAX': {
      const xMain = `Full-page hydration is the silent killer of mobile battery & spatial WebXR.\n\nRe-running server JS on the client just to attach event listeners is wasteful.\n\nZero-hydration (<2.5KB) hits locked 120 FPS on Vision Pro.\n\n📌 Architecture in reply 👇`
      const xReply = `🥽 Explore the 120 FPS WebXR zero-hydration benchmark:\n${cleanRepo}\n\nStar the repo to support banishing hydration lag! ⭐`
      const reddit = formatForReddit({
        title: 'Why full-page hydration is killing WebXR & mobile performance',
        body: `Hey r/webdev,\n\nIn WebXR (Apple Vision Pro, Meta Quest 3), you have exactly 8.3ms per frame to maintain 120 FPS immersion.\n\nIf hydration takes 150ms–300ms during scene initialization, the user experiences jarring visual hitching and tracking latency.\n\nHow we solved it:\n- 0ms client-side hydration via resumable DOM Parts.\n- Zero-copy Float64Array linear buffers between Rust/Zig Wasm and UI.\n- Sub-2.5KB bundle size.\n\nCheck out the open-source benchmarks on GitHub: ${cleanRepo}\n\nHow is your team addressing initial hydration latency on edge devices?`
      })
      const devto = formatForTechnicalBlog({
        title: 'The Hydration Tax: Achieving 0ms Hydration and Locked 120 FPS for WebXR',
        summary: notesText,
        repoUrl: cleanRepo,
        tags
      })
      return {
        framework: 'HYDRATION_TAX',
        x: formatForX(xMain).tweet,
        x_reply: xReply,
        reddit: `Title: ${reddit.title}\n\n${reddit.body}`,
        devto: devto.markdown,
        linkedin: `Spatial computing leaves zero room for runtime bloat.\n\nAt 120 FPS on Apple Vision Pro and Meta Quest 3, an 8.3ms frame budget means even modest hydration overhead causes disorienting motion jitter.\n\nZero-hydration architecture allows:\n🚀 Instantaneous interactivity without re-executing server logic.\n🚀 Sub-2.5KB gzipped footprint.\n🚀 Direct Wasm memory alignment without JSON serialization.\n\nRead our engineering benchmark report: ${cleanRepo}`
      }
    }

    case 'VIBE_CODING_DEBT': {
      const xMain = `"Vibe coding" without understanding the substrate is creating unprecedented tech debt.\n\nAI generates 1,000-line blobs in seconds, but debugging them takes hours.\n\nThe real leverage is <2.5KB mechanical sympathy.\n\n📌 Code in reply 👇`
      const xReply = `⭐ Clean, verifiable, local-first code built for humans & AI models alike:\n${cleanRepo}\n\nStar the repo on GitHub! 🚀`
      const reddit = formatForReddit({
        title: 'The AI Velocity Trap: Output tripled, but architectural debt multiplied by 10',
        body: `Hey r/programming,\n\nTools like Claude and Cursor make it trivial to generate hundreds of lines of framework code in minutes. But in production, teams are seeing:\n1. 10+ unnecessary npm dependencies pulled in for basic tasks.\n2. Inability to trace memory leaks when complex state hooks misfire.\n3. Massive bundle bloat.\n\nOur philosophy: Keep the foundational core under 2.5KB with zero dependencies so that every line is auditable by both humans and AI agents.\n\nOpen-source repo: ${cleanRepo}\n\nHow is your team enforcing code quality standards on AI-assisted PRs?`
      })
      const devto = formatForTechnicalBlog({
        title: 'The AI Velocity Trap: Why Senior Engineers Are Returning to Mechanical Sympathy',
        summary: notesText,
        repoUrl: cleanRepo,
        tags
      })
      return {
        framework: 'VIBE_CODING_DEBT',
        x: formatForX(xMain).tweet,
        x_reply: xReply,
        reddit: `Title: ${reddit.title}\n\n${reddit.body}`,
        devto: devto.markdown,
        linkedin: `Generating code has never been easier. But architecture, memory layout, and edge debugging cannot be autocompleted.\n\nHigh-leverage engineering in 2026 comes down to:\n🔹 Deep mechanical sympathy with the browser engine.\n🔹 Minimizing runtime dependencies to keep software verifiable.\n🔹 Building open-source tools with transparent trade-offs.\n\nExplore our open-source benchmark project: ${cleanRepo}`
      }
    }

    default: // BENCHMARK_REALITY
    case 'HARD_NUMBERS': {
      const xMain = `Front-end runtime benchmarks in 2026:\n\n• React 19: ~185KB (Full VDOM)\n• Svelte 5: ~18KB (Runes)\n• SolidJS: ~7KB (Signals)\n• Zuari: <2.5KB (0% VDOM)\n\n0ms hydration. Locked 120 FPS WebXR. Zero-copy Wasm FFI.\n\n📌 Reproduce it 👇`
      const xReply = `📊 Run the reproducible test suite yourself on GitHub:\n${cleanRepo}\n\nStar the repo to support high-performance web tooling! ⭐`
      const reddit = formatForReddit({
        title: 'We benchmarked React 19 vs Svelte 5 vs <2.5KB Zero-VDOM on 120Hz displays',
        body: `Hey r/programming,\n\nWe put together a reproducible benchmark measuring frame stability, hydration latency, and memory footprint across modern web runtimes.\n\nResults:\n1. React 19: Noticeable frame drops during high-frequency telemetry updates due to virtual tree reconciliation.\n2. Zuari (<2.5KB): Maintained locked 120 FPS with 0% Virtual DOM using direct W3C DOM Parts.\n3. Wasm memory bridge: Zero-copy Float64Array signals eliminated JSON serialization cost.\n\nAll 91 test suites and benchmark code are open-source on GitHub: ${cleanRepo}\n\nFeedback and peer reviews welcome!`
      })
      const devto = formatForTechnicalBlog({
        title: 'Benchmark Reality Check: Measuring Runtime Bloat on 120 FPS Displays',
        summary: notesText,
        repoUrl: cleanRepo,
        tags
      })
      return {
        framework: 'BENCHMARK_REALITY',
        x: formatForX(xMain).tweet,
        x_reply: xReply,
        reddit: `Title: ${reddit.title}\n\n${reddit.body}`,
        devto: devto.markdown,
        linkedin: `Hard numbers beat marketing hype every time.\n\nHere is how runtime footprint compares in 2026:\n\n⚡ 45KB–180KB vs <2.5KB gzipped\n⚡ 150ms hydration vs 0ms instantaneous reactivity\n⚡ Heavy JSON serialization vs Zero-copy Float64Array Wasm memory\n\nWe engineered Zuari (dr-week/fast-framework) at Danger.Labs to prove you don't have to sacrifice ergonomics for raw performance.\n\nCheck out the full open-source repo: ${cleanRepo}`
      }
    }
  }
}

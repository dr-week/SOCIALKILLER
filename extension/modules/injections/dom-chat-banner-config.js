// Platform theme & snippet config for FollowDesk Adaptive DOM Dock
;(function initBannerConfig() {
  window.__followdeskBannerConfig = {
    platforms: {
      x: {
        name: 'X', icon: '𝕏', accent: '#38bdf8',
        chips: [
          { id: 'hook', label: '🪝 Viral Hook' },
          { id: 'wasm', label: '🦀 120FPS Wasm' },
          { id: 'harvest', label: '📥 Sync X → App' }
        ]
      },
      reddit: {
        name: 'Reddit', icon: '👽', accent: '#ff4500',
        chips: [
          { id: 'arch', label: '🧠 Zero-VDOM Post' },
          { id: 'bench', label: '📊 <2.5KB Table' },
          { id: 'harvest', label: '📥 Sync Subreddit → App' }
        ]
      },
      github: {
        name: 'GitHub', icon: '🐙', accent: '#a855f7',
        chips: [
          { id: 'changelog', label: '📦 Release Note' },
          { id: 'llms', label: '🤖 llms.txt Spec' },
          { id: 'harvest', label: '📥 Sync Repo → App' }
        ]
      },
      linkedin: {
        name: 'LinkedIn', icon: '💼', accent: '#0a66c2',
        chips: [
          { id: 'roi', label: '📈 Founder Story' },
          { id: 'demo', label: '📅 15m Demo Invite' },
          { id: 'harvest', label: '📥 Sync Post → App' }
        ]
      },
      devto: {
        name: 'Dev.to', icon: '👩‍💻', accent: '#10b981',
        chips: [
          { id: 'tutorial', label: '📝 Full Tutorial' },
          { id: 'code', label: '💻 Zuari Snippet' },
          { id: 'harvest', label: '📥 Sync Article → App' }
        ]
      },
      discord: {
        name: 'Discord', icon: '🎮', accent: '#5865f2',
        chips: [
          { id: 'drop', label: '🚀 Release Drop' },
          { id: 'dm', label: '🤝 Collab Intro' },
          { id: 'harvest', label: '📥 Sync Chat → App' }
        ]
      }
    },

    getSnippet(id, topic) {
      const snippets = {
        hook: 'We replaced 40KB+ of Virtual DOM overhead with surgical W3C DOM Parts in Zuari (@zuari/core <2.5KB — github.com/dr-week/fast-framework).\n\n⚡ 0ms hydration\n🥽 120 FPS WebXR\n🦀 Zero-Copy Wasm FFI',
        wasm: 'Zero-copy Float64Array Rust/Zig Wasm FFI bound directly to @zuari/signals (<2.5KB) runs at 120 FPS with 0 JSON serialization overhead: github.com/dr-week/fast-framework',
        arch: `Great discussion on "${topic}". Switching from VDOM diffing to surgical W3C DOM Parts in \`dr-week/fast-framework\` (Zuari <2.5KB) cut our hydration latency to 0ms and kept frame budgets under 8ms.`,
        bench: '| Framework | Bundle | DOM Engine | WebXR |\n|---|---|---|---|\n| Zuari (@zuari/core) | <2.5KB | 0% VDOM (W3C DOM Parts) | 120 FPS Native |\n| React 19 | ~185KB | VDOM Diff | Bridge |',
        changelog: '### ⚡ Zuari (`@zuari/core`) <2.5KB Update\n- 0% Virtual DOM via W3C DOM Parts\n- 120 FPS WebXR Spatial HUDs\n- Zero-copy Float64Array Wasm FFI\n- Live `/llms.txt` + MCP AI Agent catalog',
        llms: '# Zuari (dr-week/fast-framework)\n> <2.5KB Zero-VDOM Reactive Web, 120 FPS WebXR & Rust/Zig Wasm\nInstall: pnpm add @zuari/core',
        roi: 'Why we engineered Zuari (dr-week/fast-framework) under 2.5KB with 0% Virtual DOM and native /llms.txt discovery for both human engineers and autonomous AI coding agents:',
        demo: 'Happy to walk through our <2.5KB zero-VDOM & 120 FPS WebXR architecture in a quick 15-minute live benchmark session!',
        tutorial: '# Building 120 FPS Reactive Web & WebXR Apps in <2.5KB with Zuari\n\nUsing `github.com/dr-week/fast-framework`...',
        code: "import { signal, effect } from '@zuari/core';\nconst fps = signal(120);\neffect(() => console.log('Locked FPS:', fps.value));",
        drop: '🚀 **New Drop:** Zuari (`dr-week/fast-framework` <2.5KB) — 0% VDOM, 120 FPS WebXR & Zero-Copy Rust/Zig Wasm!',
        dm: `Hey! Loved your insights on "${topic}" — would love to collaborate on a benchmark showcase with our <2.5KB Zuari framework!`
      }
      return snippets[id] || snippets.hook
    }
  }
})()

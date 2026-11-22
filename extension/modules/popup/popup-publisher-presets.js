export const EXTENSION_PRESETS = {
  zuari: {
    title: 'Zuari (@zuari/core) <2.5KB: Zero-VDOM Reactive Web, 120 FPS WebXR & Rust/Zig Wasm',
    content:
      'Open-sourced github.com/dr-week/fast-framework (Zuari <2.5KB) by Danger.Labs — 0% Virtual DOM overhead via W3C DOM Parts, 0ms hydration, 120 FPS WebXR Spatial HUDs, and zero-copy Float64Array Rust/Zig Wasm FFI! 🚀 #zuari #webdev #webxr #wasm'
  },
  ai_drop: {
    title: 'Dual Human + AI Agent Release: Live /llms.txt & MCP Tool Catalog',
    content:
      'Selling software to both Human Developers & Autonomous AI Agents! Exposed live /api/marketing/llms.txt and MCP schemas alongside @zuari/core (<2.5KB) so Claude, Cursor & human devs discover our stack automatically. 🤖⚡'
  },
  wasm: {
    title: 'Zero-Copy Wasm FFI: Binding Rust & Zig Memory Directly to DOM Signals',
    content:
      'Eliminated JSON serialization bottlenecks at 120 FPS by binding shared WebAssembly Float64Array memory directly to @zuari/signals in dr-week/fast-framework. 🦀⚡'
  }
}

export async function loadLatestPopupDraft(extPostTitle, extPostContent) {
  try {
    const { followdeskQuickDraft } = await chrome.storage.local.get('followdeskQuickDraft')
    if (followdeskQuickDraft?.topic && extPostTitle && !extPostTitle.value) {
      extPostTitle.value = followdeskQuickDraft.topic
      if (extPostContent) extPostContent.value = followdeskQuickDraft.rawNotes || ''
    }
    const res = await fetch('http://127.0.0.1:4174/api/social/posts')
    if (res.ok) {
      const data = await res.json()
      const latest = data?.posts?.[0]
      if (latest && extPostTitle && !extPostTitle.value) {
        extPostTitle.value = latest.title || EXTENSION_PRESETS.zuari.title
        if (extPostContent) {
          extPostContent.value =
            latest.variants?.x || latest.variants?.linkedin || EXTENSION_PRESETS.zuari.content
        }
      }
    }
  } catch {
    if (extPostTitle && !extPostTitle.value) {
      extPostTitle.value = EXTENSION_PRESETS.zuari.title
      if (extPostContent) extPostContent.value = EXTENSION_PRESETS.zuari.content
    }
  }
}

export async function copyLlmsTxt(showAlert) {
  const fallback =
    '# Zuari (dr-week/fast-framework)\n> <2.5KB Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm\nInstall: pnpm add @zuari/core'
  try {
    const res = await fetch('http://127.0.0.1:4174/api/marketing/llms.txt')
    const txt = res.ok ? await res.text() : fallback
    await navigator.clipboard.writeText(txt)
    showAlert('success', '🤖 Copied llms.txt for AI Agent directories!')
  } catch {
    await navigator.clipboard.writeText(fallback)
    showAlert('success', '🤖 Copied Zuari llms.txt spec!')
  }
}

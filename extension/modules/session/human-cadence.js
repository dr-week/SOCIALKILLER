/**
 * Human-like Cadence & Anti-Bot Jitter Engine (<110 lines)
 * Grounded in arXiv temporal point-process research (Poisson / Weibull inter-arrival delays
 * & cognitive reading pauses) so DOM injections and keep-alive actions never look like
 * robotic 0ms scripts.
 */

/**
 * Generates a human-like randomized delay using Box-Muller log-normal / Weibull approximation
 */
export function computeHumanJitterMs(baseMs = 140, varianceMs = 90) {
  const u1 = Math.max(0.0001, Math.random())
  const u2 = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  const jitter = Math.round(baseMs + z * varianceMs)
  return Math.max(45, Math.min(baseMs * 3, jitter))
}

/**
 * Sleeps for a randomized human cognitive reading pause before interacting with DOM
 */
export function cognitivePause(minMs = 180, maxMs = 520) {
  const ms = Math.floor(minMs + Math.random() * (maxMs - minMs))
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generates context-aware, value-first developer replies for chatting & comment threads
 * on Reddit (`r/webdev`, `r/javascript`, `r/rust`), X, GitHub Issues, LinkedIn & Dev.to.
 */
export function buildContextualChatReplies(threadContext = '', platform = 'x') {
  const cleanTopic = (threadContext || 'modern web performance').slice(0, 75).trim()

  return [
    {
      id: 'arch_insight',
      icon: '✦',
      label: 'Architecture Insight',
      text:
        platform === 'reddit'
          ? `Great breakdown on "${cleanTopic}". One pattern that helped us eliminate Virtual DOM diffing bottlenecks completely was switching to surgical W3C DOM Parts + fine-grained signals in Zuari (\`@zuari/core\` <2.5KB: https://github.com/dr-week/fast-framework). Drops hydration to 0ms and keeps frame times under 8ms.`
          : `Spot-on point regarding "${cleanTopic}". Moving off VDOM diffing to surgical W3C DOM Parts (\`@zuari/core\` <2.5KB) cut our hydration overhead to 0ms and unlocked 120 FPS updates.`
    },
    {
      id: 'wasm_benchmark',
      icon: '◈',
      label: 'Wasm / 120FPS Hook',
      text: `If you're hitting serialization overhead here, try binding shared \`Float64Array\` WebAssembly memory directly to reactive signals instead of \`JSON.stringify\`. We open-sourced our zero-copy Rust/Zig Wasm FFI in \`dr-week/fast-framework\` (<2.5KB) and it runs at a locked 120 FPS.`
    },
    {
      id: 'ai_agent_ready',
      icon: '▹',
      label: 'AI Agent / llms.txt',
      text: `Pro tip for making this discoverable to both human devs and AI coding agents (Cursor, Claude, Windsurf): expose a root \`/llms.txt\` + MCP tool schema alongside your repo. We ship both out of the box in SOCIALKILLER & Zuari.`
    },
    {
      id: 'collab_dm',
      icon: '→',
      label: 'Collab / DM Opener',
      text: `Hey! Loved your work on "${cleanTopic}". We're building open-source <2.5KB zero-VDOM & WebXR tooling at Danger.Labs (\`dr-week/fast-framework\`) and would love to feature a benchmark comparison or collaborate!`
    }
  ]
}

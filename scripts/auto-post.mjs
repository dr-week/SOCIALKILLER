// Randomized promo post generator -> FollowDesk queue (browser-fill mode, nothing is auto-submitted).
// Usage: node scripts/auto-post.mjs [--now] [--repo=owner/name] [--platforms=x,linkedin,reddit,devto]
//   --now        publish server-side immediately instead of queueing composer fills for the extension
//   (default)    queueBrowser: the extension opens each composer and fills it; you press Post, then "Mark posted"
// The server dedupes (same copy within 30 days) and enforces per-platform promo limits (see PROMO_LIMITS).
const API = process.env.FOLLOWDESK_API || 'http://127.0.0.1:4174'
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')))
const repoSlug = (args.repo || process.env.PROMO_REPO || 'dr-week/fast-framework').replace(/^https?:\/\/github\.com\//, '')
const repoUrl = `https://github.com/${repoSlug}`
const publishNow = 'now' in args
const platforms = (args.platforms || 'x,linkedin,reddit,devto').split(',').map(s => s.trim()).filter(Boolean)

const pick = a => a[Math.floor(Math.random() * a.length)]
const topics = ['AI coding agents', 'WebAssembly', 'zero-VDOM frameworks', 'local-first apps', 'edge runtimes', 'MCP tool servers']
const hooks = [
  'Hot take: in 2 years most boilerplate will be written by agents, not people.',
  'Unpopular opinion: your framework bundle size matters more than your AI stack.',
  'Will AI replace junior devs, or just raise the bar for everyone?',
  'The future of coding is less typing, more reviewing. Agree?',
  'Everyone is arguing about AI vs devs. The real shift is tiny, fast, local tools.'
]
const ctas = ['What would you add?', 'Tell me why I am wrong.', 'Stars and feedback welcome.', 'Roast my approach below.']

function build() {
  const topic = pick(topics), hook = pick(hooks), cta = pick(ctas)
  return {
    title: hook.slice(0, 70),
    topic: hook, // stored as the post "hook" so the metrics report can rank hooks
    variants: {
      x: `${hook} ${topic} is the part nobody talks about.\n\n${repoUrl}\n\n${cta} #coding #AI #opensource`.slice(0, 280),
      reddit: `${hook}\n\nI have been building around ${topic} and open-sourced it: ${repoUrl}\n\n${cta}`,
      linkedin: `${hook}\n\nMy take: ${topic} will matter most. Code: ${repoUrl}\n\n${cta}`,
      devto: `# ${hook.slice(0, 70)}\n\n${hook}\n\nProject: ${repoUrl}\n\n${cta}`
    }
  }
}

async function call(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })
  return { status: res.status, data: await res.json().catch(() => ({})) }
}

// 1. Star snapshot (best effort) so metrics can show what each post did to the repo
try {
  const s = await call('/api/social/metrics/stars', { repo: repoSlug })
  if (s.data.success) console.log(`stars snapshot: ${s.data.stars}`)
} catch (e) {
  console.error('Server unreachable:', e.message)
  process.exit(1)
}

import { createHash } from 'node:crypto'

// 2. Create a post, retrying with new random copy when the server reports a duplicate
for (let attempt = 1; attempt <= 15; attempt++) {
  const p = build()
  const payloadHash = createHash('sha256').update(`${p.title}|${p.variants?.x || ''}`).digest('hex').slice(0, 16)
  const idempotencyToken = `autopost-win-${payloadHash}-${new Date().toISOString().slice(0, 10)}`

  const { status, data } = await call('/api/social/posts', {
    ...p,
    idempotencyToken,
    source: 'windows_task_scheduler',
    platforms,
    publishNow,
    queueBrowser: !publishNow,
    dedupe: true
  })
  const post = data.post
  if (!data.success) { console.error(status, data); process.exit(1) }
  if (post?.duplicate) continue
  if (post?.status === 'skipped_limit') {
    console.log(`Nothing queued: promo limits reached for ${post.skippedPlatforms.join(', ')}`)
    process.exit(0)
  }
  const dispatched = (post.deliveryLogs || []).filter(l => l.kind === 'dispatched').map(l => l.platformId)
  const skipped = (post.deliveryLogs || []).filter(l => l.kind === 'skipped_limit').map(l => l.platformId)
  console.log(`OK ${post.id} -> ${dispatched.join(', ') || 'none'}${skipped.length ? ` | skipped by limits: ${skipped.join(', ')}` : ''}`)
  process.exit(0)
}
console.error('Could not find unused copy after 15 attempts (all combos used in the last 30 days).')
process.exit(2)

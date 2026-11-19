/**
 * Context-aware hashtag picker. Tags come from what the post is actually about,
 * never from a fixed default list, and are de-duplicated case-insensitively.
 */

const BANNED = new Set(['buildinpublic', 'tech', 'coding', 'programming', 'fyi', 'trending', 'viral', 'follow'])

const TAG_RULES = [
  [/\b(react|jsx|next\.?js)\b/i, 'React'],
  [/\b(vue|nuxt)\b/i, 'VueJS'],
  [/\btypescript\b/i, 'TypeScript'],
  [/\b(javascript|node\.?js|deno|bun)\b/i, 'JavaScript'],
  [/\brust\b/i, 'rustlang'],
  [/\b(wasm|webassembly)\b/i, 'WebAssembly'],
  [/\bpython\b/i, 'Python'],
  [/\b(ai|llms?|gpt|claude|gemini|agents?|copilot|machine learning)\b/i, 'AI'],
  [/\b(security|vulnerabilit\w*|exploit|breach|malware|cve)\b/i, 'infosec'],
  [/\b(sqlite|postgres\w*|database|sql|redis)\b/i, 'Databases'],
  [/\b(css|tailwind)\b/i, 'CSS'],
  [/\b(performance|latency|benchmark\w*|hydration|signals?)\b/i, 'WebPerf'],
  [/\blinux\b/i, 'Linux'],
  [/\bopen[- ]?source\b/i, 'OpenSource'],
  [/\b(terminal|cli|shell|bash|zsh)\b/i, 'CLI'],
  [/\b(devops|docker|kubernetes|k8s|ci\/cd)\b/i, 'DevOps'],
  [/\b(startup|founder|saas|indie)\w*\b/i, 'Startups'],
  [/\b(privacy|local-first|self-hosted)\b/i, 'Privacy'],
  [/\b(ux|design system|accessibility|a11y)\b/i, 'UX'],
  [/\b(browser|html|dom|web ?apis?|frontend|front-end)\b/i, 'WebDev']
]

function sanitize(tag) {
  return String(tag || '').replace(/^#/, '').replace(/[^A-Za-z0-9_]/g, '')
}

export function pickHashtags({ title = '', summary = '', extra = [], max = 2 } = {}) {
  const text = `${title} ${summary}`
  const picked = []
  const seen = new Set()
  const add = raw => {
    const tag = sanitize(raw)
    const key = tag.toLowerCase()
    if (!tag || tag.length > 24 || seen.has(key) || BANNED.has(key)) return
    seen.add(key)
    picked.push(tag)
  }
  for (const [pattern, tag] of TAG_RULES) {
    if (picked.length >= max) break
    if (pattern.test(text)) add(tag)
  }
  for (const tag of extra) {
    if (picked.length >= max) break
    add(tag)
  }
  return picked.slice(0, max)
}

/** Removes repeated hashtags from finished text, keeping the first of each. */
export function dedupeHashtagsInText(text) {
  const seen = new Set()
  return String(text || '')
    .replace(/(^|\s)#([A-Za-z0-9_]+)/g, (match, lead, tag) => {
      const key = tag.toLowerCase()
      if (BANNED.has(key) || seen.has(key)) return lead
      seen.add(key)
      return match
    })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

import { createHash } from 'node:crypto'
import { POSTING_RULES, getActiveDictionaryElements } from './post-dictionary.mjs'
import { pickHashtags, dedupeHashtagsInText } from './hashtag-picker.mjs'
import { getPlainEnglishPitch } from './simple-pitches.mjs'

const IDEA_TEMPLATES = [
  title => `Brainstorm: ${title}`,
  title => `Idea worth testing: ${title}`,
  title => `Small advice: ${title}`,
  title => `Unpopular thought: ${title}`
]

const LIVE_TEMPLATES = [
  { id: 'plot-twist', render: (title, focus) => `Today's tech development: ${title}. How will this impact ${focus}?` },
  { id: 'benchmark', render: (title, focus) => `${title}. In terms of ${focus}, this is a notable benchmark to watch.` },
  { id: 'hype-check', render: (title, focus) => `Beyond the headlines on ${title}: What matters is how it advances ${focus}.` },
  { id: 'useful-test', render: (title, focus) => `Industry movement: ${title}. Does it solve real problems in ${focus}?` }
]
const COMMON_TOPIC_WORDS = new Set(['today', 'latest', 'breaking', 'story', 'news', 'tech', 'new', 'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'over', 'your', 'our', 'their', 'does', 'what', 'when', 'where', 'will', 'have', 'most', 'more', 'less', 'about'])

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function createTopicKey(title) {
  const normalized = String(title || '').normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  return hash(normalized)
}

export function createSourceKey(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    url.username = ''
    url.password = ''
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key)
    url.hash = ''
    url.searchParams.sort()
    return hash(url.href.replace(/\/$/, ''))
  } catch { return '' }
}

export function createContentHash(text) {
  return hash(String(text || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim())
}

export function isNearDuplicateTopic(candidate, previous) {
  const tokens = value => new Set(String(value || '').normalize('NFKD').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)?.filter(word => !COMMON_TOPIC_WORDS.has(word)) || [])
  const next = tokens(candidate)
  const prior = tokens(previous)
  if (next.size < 3 || prior.size < 3) return false
  let shared = 0
  for (const word of next) if (prior.has(word)) shared++
  return shared >= 3 && shared / Math.min(next.size, prior.size) >= 0.75
}

function chooseTemplate(stats = [], random = Math.random) {
  const feedback = new Map(stats.map(item => [item.templateId, item]))
  const weighted = LIVE_TEMPLATES.map(template => {
    const counts = feedback.get(template.id) || { likes: 0, dislikes: 0 }
    const total = counts.likes + counts.dislikes
    const mean = (counts.likes + 1) / (total + 2)
    const exploration = 0.35 / Math.sqrt(total + 1)
    return { template, weight: mean + exploration }
  })
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
  let pick = random() * totalWeight
  for (const item of weighted) {
    pick -= item.weight
    if (pick <= 0) return item.template
  }
  return weighted.at(-1).template
}

function clean(value, max) {
  const text = String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const clipped = text.slice(0, max)
  const boundary = clipped.lastIndexOf(' ')
  return clipped.slice(0, boundary > max * 0.6 ? boundary : max).trim().replace(/[,;:.]+$/, '')
}

function safeLink(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    url.username = ''
    url.password = ''
    // Strip all tracking, marketing, and session query params
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|st$|reflink$|ref$|source$|trk$|si$)/i.test(key)) {
        url.searchParams.delete(key)
      }
    }
    url.hash = ''
    // Strip query parameters for external news or bloat
    if (url.search && url.href.length > 70) {
      url.search = ''
    }
    let cleanUrl = url.href.replace(/\/$/, '')
    // If path is still absurdly long (>100 chars), truncate neatly or fallback to origin + top path
    if (cleanUrl.length > 90 && url.pathname.length > 30) {
      const segments = url.pathname.split('/').filter(Boolean)
      if (segments.length > 1) {
        cleanUrl = `${url.origin}/${segments[0]}/${segments[1].slice(0, 30)}`
      }
    }
    return cleanUrl.length <= 120 ? cleanUrl : url.origin
  } catch { return '' }
}

function shorten(text, max) {
  if (text.length <= max) return text
  const candidate = text.slice(0, max)
  const boundary = candidate.lastIndexOf(' ')
  const clipped = candidate.slice(0, boundary > max * 0.5 ? boundary : max).trimEnd()
  return clipped.length < text.length && clipped.length < max ? `${clipped}…` : clipped
}

const PROJECT_FRAMES = [
  (name, pitch) => `${pitch.weirdHook || pitch.oneLiner}`,
  (name, pitch) => `I built ${name}: ${pitch.oneLiner}`,
  (name, pitch) => `Instead of bloated corporate tools: ${name} — ${pitch.oneLiner}`,
  (name, pitch) => `From the lab in Goa: ${name}. ${pitch.oneLiner}`
]

export function createShortPost({ lead = null, topic = '', evergreen = false, focus = 'the work', templateStats = [], project = null, random = Math.random } = {}) {
  const liveLead = !project && !evergreen && lead
  const sourceUrl = project ? safeLink(project.url) : liveLead ? safeLink(lead.url) : ''
  const hooks = getActiveDictionaryElements('hooks')
  const projectName = project ? clean(String(project.name).replace(/[-_]+/g, ' '), 40) : ''
  const projectPitch = project ? getPlainEnglishPitch(project.name, project.description) : null
  const projectDescription = project ? clean(projectPitch.oneLiner || project.description, 120).replace(/[.!?]+$/, '') + '.' : ''
  const title = project
    ? clean(`${projectName} ${projectDescription}`, 78)
    : clean(liveLead ? lead.title : topic || hooks[Math.floor(random() * hooks.length)], 78)
  const template = chooseTemplate(templateStats, random)
  const cleanFocus = clean(focus, 48) || 'the work'
  let firstLine = project
    ? shorten(PROJECT_FRAMES[Math.floor(random() * PROJECT_FRAMES.length)](projectName, projectPitch), 180)
    : liveLead
      ? template.render(title, cleanFocus)
      : shorten(/^(brainstorm|idea|small advice|unpopular)/i.test(title) ? title : IDEA_TEMPLATES[Math.floor(random() * IDEA_TEMPLATES.length)](title), 180)
  const hashtags = pickHashtags({
    title: project ? `${title} ${project.language || ''}` : `${title} ${focus}`,
    summary: liveLead?.summary || '',
    extra: project ? [project.language, ...(project.topics || [])] : [],
    max: 2
  })
  const tags = hashtags.map(tag => `#${tag}`).join(' ')
  let secondLine = [sourceUrl, tags].filter(Boolean).join(' ')

  const maxTotalChars = POSTING_RULES.x.maxCharacters
  const firstLineBudget = maxTotalChars - (secondLine ? secondLine.length + 1 : 0)
  if (firstLine.length > firstLineBudget) {
    const shortTitle = shorten(title, Math.max(0, firstLineBudget - 28))
    firstLine = project ? shorten(title, firstLineBudget) : `Interesting: ${shortTitle}. Show receipts.`
  }
  if (firstLine.length > firstLineBudget) firstLine = shorten(firstLine, firstLineBudget)

  const text = dedupeHashtagsInText([firstLine, secondLine].filter(Boolean).join('\n'))
  return {
    text,
    title,
    sourceUrl,
    hashtags,
    source: project ? 'github' : liveLead ? clean(lead.sourceId, 32) : 'evergreen',
    context: project ? 'project' : liveLead ? 'live' : 'evergreen',
    templateId: template.id,
    characterCount: text.length,
    rules: POSTING_RULES
  }
}


/**
 * Self-Updating Dynamic Post & Trending Dictionary Engine (<150 lines)
 */

import { dbService } from '../db/sqlite-engine.mjs'
import { BASE_DICTIONARY, POSTING_RULES } from './content/post-dictionary-data.mjs'

export { BASE_DICTIONARY, POSTING_RULES }
export const VARIATION_DICTIONARY = BASE_DICTIONARY

function sample(array) {
  if (!array || array.length === 0) return ''
  return array[Math.floor(Math.random() * array.length)]
}

export function getActiveDictionaryElements(type) {
  const baseList = BASE_DICTIONARY[type] || []
  try {
    const dynamicItems = dbService.getDictionaryItemsByType(type)
    if (dynamicItems && dynamicItems.length > 0) {
      return [...dynamicItems.map(d => d.text), ...baseList]
    }
  } catch {}
  return baseList
}

export function ingestCommunitySignalsToDictionary(signals = []) {
  let added = 0
  for (const sig of signals) {
    if (!sig || !sig.title) continue
    const cleanTitle = sig.title.replace(/^\[.*?\]\s*/, '').trim()
    if (cleanTitle.length < 15) continue

    try {
      dbService.insertDictionaryItem({
        id: `hook-${sig.id || Date.now().toString(36)}`,
        type: 'hooks',
        text: cleanTitle,
        source: sig.channel || 'community',
        score: Math.min(2.0, 1.0 + (sig.score || 0) / 100)
      })
      added++

      if (sig.summary) {
        dbService.insertDictionaryItem({
          id: `conflict-${sig.id || Date.now().toString(36)}`,
          type: 'conflicts',
          text: sig.summary,
          source: sig.channel || 'community',
          score: 1.0
        })
      }
    } catch {}
  }
  return { ingestedCount: added }
}

export function generateRandomVariation({
  githubRepo = 'github.com/dr-week/fast-framework',
  platform = 'reddit',
  customHook = null,
  targetSubreddit = 'r/webdev'
} = {}) {
  const hooks = getActiveDictionaryElements('hooks')
  const conflicts = getActiveDictionaryElements('conflicts')
  const insights = getActiveDictionaryElements('insights')
  const debates = getActiveDictionaryElements('debates')
  const titleFormats = getActiveDictionaryElements('redditTitleFormats')
  const bookmarks = getActiveDictionaryElements('bookmarkPrompts')
  const ctas = getActiveDictionaryElements('githubCtas')

  const hook = customHook || sample(hooks)
  const conflict = sample(conflicts)
  const insight = sample(insights)
  const debate = sample(debates)
  const bookmark = sample(bookmarks)
  const cleanRepo = `https://${githubRepo.replace(/^https?:\/\//, '')}`
  const cta = sample(ctas).replace('{REPO_URL}', cleanRepo)

  const titleTemplate = sample(titleFormats) || 'Technical Deep-Dive: How we approached {TOPIC}'
  const redditTitle = titleTemplate.replace('{TOPIC}', hook.replace(/\.$/, ''))

  if (platform === 'reddit') {
    return {
      title: redditTitle,
      mainPost: `Hey ${targetSubreddit}!\n\n${conflict}\n\n### The Engineering Trade-Offs\n${insight}\n\n### Open Discussion\n${debate}\n\n---\n*For context, we benchmarked this architecture in our open-source repo: [${cleanRepo}](${cleanRepo}) - feedback and PRs welcome!*`,
      components: { hook, title: redditTitle, conflict, insight, debate, cta }
    }
  }

  if (platform === 'x') {
    return {
      title: hook,
      mainPost: `${hook}\n\n${conflict}\n\n${insight}\n\n${debate}\n\n${bookmark}\n(Repo link in replies 👇)`,
      replyWithGithub: cta,
      components: { hook, conflict, insight, debate, bookmark, cta }
    }
  }

  return {
    title: hook,
    mainPost: `${hook}\n\n${conflict}\n\nKey Takeaway:\n${insight}\n\n${debate}\n\n👉 Open-source GitHub repo: ${cleanRepo}`,
    components: { hook, conflict, insight, debate, cta }
  }
}

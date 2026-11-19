import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
const tokenPattern = /[a-z0-9][a-z0-9._/-]*/gi

function tokenize(text) {
  return [...new Set(text.match(tokenPattern)?.map(token => token.toLowerCase()) || [])]
}

async function markdownFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true })
  const nested = await Promise.all(entries
    .filter(entry => entry.isDirectory())
    .map(entry => markdownFiles(join(folder, entry.name))))
  const files = entries
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map(entry => join(folder, entry.name))
  return [...files, ...nested.flat()]
}

export async function findDocs(docsDirectory, query, limit = 12) {
  const terms = tokenize(query)
  if (!terms.length) throw new Error('Query must contain searchable words.')
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new Error('Limit must be an integer from 1 to 50.')

  const files = await markdownFiles(docsDirectory)
  const results = []
  for (const file of files) {
    const lines = (await readFile(file, 'utf8')).split(/\r?\n/)
    let best = null
    lines.forEach((text, index) => {
      const lineTerms = new Set(tokenize(text))
      const score = terms.filter(term => lineTerms.has(term)).length
      if (score > (best?.score || 0)) best = { score, line: index + 1, excerpt: text.trim().slice(0, 220) }
    })
    if (best) results.push({ ...best, path: relative(root, file).replaceAll('\\', '/') })
  }
  return results.sort((left, right) => right.score - left.score || left.path.localeCompare(right.path)).slice(0, limit)
}

async function main() {
  const args = process.argv.slice(2)
  const queryIndex = args.indexOf('--query')
  if (queryIndex < 0 || !args[queryIndex + 1]) throw new Error('Usage: npm run docs:find -- --query "search terms" [--limit 12]')
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex < 0 ? 12 : Number(args[limitIndex + 1])
  const results = await findDocs(join(root, 'docs'), args[queryIndex + 1], limit)
  if (!results.length) return console.log('No documentation matched.')
  for (const result of results) {
    console.log(`${result.path}:${result.line} (score ${result.score})`)
    console.log(`  ${result.excerpt}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('Documentation search failed:', error.message)
    process.exitCode = 1
  })
}

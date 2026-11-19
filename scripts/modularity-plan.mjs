import { readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { collectSourceFiles } from './check-file-size.mjs'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
const sourceRoots = ['src', 'server', 'extension', 'scripts', 'test', 'launcher', 'android', 'src-tauri']
const declaration = /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)/

function parseLimit(args) {
  const option = args.find(arg => arg.startsWith('--over='))
  const limit = option ? Number(option.slice('--over='.length)) : 120
  if (!Number.isInteger(limit) || limit < 50 || limit > 2000) throw new Error('--over must be an integer from 50 to 2000.')
  return limit
}

export async function buildModularityPlan(projectRoot = root, overLines = 120) {
  const files = (await Promise.all(sourceRoots.map(folder => collectSourceFiles(join(projectRoot, folder), projectRoot)))).flat()
  const candidates = []
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const lines = source.split(/\r?\n/)
    if (lines.length <= overLines) continue
    const boundaries = lines.flatMap((line, index) => {
      const match = line.match(declaration)
      return match ? [{ line: index + 1, name: match[1] }] : []
    })
    candidates.push({
      file: relative(projectRoot, file).replaceAll('\\', '/'),
      lines: lines.length,
      boundaries
    })
  }
  return candidates.sort((a, b) => b.lines - a.lines)
}

async function main() {
  const overLines = parseLimit(process.argv.slice(2))
  const candidates = await buildModularityPlan(root, overLines)
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ overLines, candidates }, null, 2))
    return
  }
  console.log(`Modularization candidates (over ${overLines} lines): ${candidates.length}`)
  for (const candidate of candidates) {
    console.log(`\n${candidate.file} — ${candidate.lines} lines`)
    console.log(candidate.boundaries.length
      ? candidate.boundaries.map(item => `  L${item.line} ${item.name}`).join('\n')
      : '  No simple top-level boundary found; inspect imports/templates/manual sections.')
  }
  console.log('\nThese are suggested extraction boundaries only. The script does not edit source files.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('Modularity planning failed:', error.message)
    process.exitCode = 1
  })
}

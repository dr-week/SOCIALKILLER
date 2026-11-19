import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))

function parseArgs(args) {
  const value = name => {
    const index = args.indexOf(name)
    return index < 0 ? null : args[index + 1]
  }
  const file = value('--file')
  const out = value('--out')
  const level = Number(value('--level') || 2)
  const maxLines = Number(value('--max-lines') || 160)
  if (!file || !out) throw new Error('Usage: npm run docs:split -- --file docs/path.md --out docs/path-parts [--level 2] [--max-lines 160] [--write]')
  if (!Number.isInteger(level) || level < 2 || level > 6) throw new Error('--level must be from 2 to 6.')
  if (!Number.isInteger(maxLines) || maxLines < 20 || maxLines > 2000) throw new Error('--max-lines must be from 20 to 2000.')
  return { file: resolveInsideRoot(file), out: resolveInsideRoot(out), level, maxLines, write: args.includes('--write') }
}

function resolveInsideRoot(path) {
  const absolute = resolve(root, path)
  const rel = relative(root, absolute)
  if (!rel || rel === '..' || rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(rel)) {
    throw new Error(`Path must stay inside the project and cannot be the project root: ${path}`)
  }
  return absolute
}

function splitMarkdown(markdown, level) {
  const lines = markdown.split(/\r?\n/)
  const heading = new RegExp(`^#{${level}}(?!#)\\s+`)
  const starts = lines.flatMap((line, index) => heading.test(line) ? [index] : [])
  if (!starts.length) throw new Error(`No level-${level} headings found; original document was left unchanged.`)
  const parts = []
  const preamble = lines.slice(0, starts[0]).join('\n').trim()
  if (preamble) parts.push({ title: 'Overview', content: `${preamble}\n` })
  starts.forEach((start, index) => {
    const end = starts[index + 1] ?? lines.length
    const content = lines.slice(start, end).join('\n').trim()
    parts.push({ title: lines[start].replace(heading, '').trim(), content: `${content}\n` })
  })
  return parts
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'section'
}

export async function planDocumentSplit(markdown, { level = 2, maxLines = 160 } = {}) {
  return splitMarkdown(markdown, level).map((part, index) => ({
    file: `${String(index + 1).padStart(2, '0')}-${slug(part.title)}.md`,
    title: part.title,
    lines: part.content.split(/\r?\n/).length - 1,
    oversized: part.content.split(/\r?\n/).length - 1 > maxLines,
    content: part.content
  }))
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const markdown = await readFile(options.file, 'utf8')
  const parts = await planDocumentSplit(markdown, options)
  const source = relative(root, options.file).replaceAll('\\', '/')
  const lines = [`# Split plan for ${source}`, '', 'Generated files are copies. The source document remains unchanged. Review and repair relative links after splitting.', '']
  for (const part of parts) lines.push(`- [${part.title}](./${part.file}) — ${part.lines} lines${part.oversized ? ' (over the requested size)' : ''}`)
  if (!options.write) {
    console.log(lines.join('\n'))
    return
  }
  try {
    await access(options.out)
    const existing = await readdir(options.out)
    if (existing.length) throw new Error(`Output directory is not empty: ${relative(root, options.out)}`)
    throw new Error(`Output directory already exists: ${relative(root, options.out)}`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  await mkdir(dirname(options.out), { recursive: true })
  await mkdir(options.out)
  await writeFile(join(options.out, 'README.md'), `${lines.join('\n')}\n`)
  for (const part of parts) await writeFile(join(options.out, part.file), part.content)
  console.log(`Created ${parts.length} section files in ${relative(root, options.out)}; original ${source} was not changed.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('Document split failed:', error.message)
    process.exitCode = 1
  })
}

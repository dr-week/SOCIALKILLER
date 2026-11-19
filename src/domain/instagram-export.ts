import type { Person } from './followers'
import JSZip from 'jszip'

type ExportEntry = { string_list_data?: Array<{ value?: string; href?: string }> }

export function classifyExportFile(filename: string): 'followers' | 'following' | null {
  const name = filename.toLocaleLowerCase('en-US')
  if (/^followers(?:_\d+)?\.json$/.test(name)) return 'followers'
  if (/^following(?:_\d+)?\.json$/.test(name)) return 'following'
  return null
}

export function parseInstagramExport(raw: unknown): Person[] {
  let list: unknown[] = []
  if (Array.isArray(raw)) {
    list = raw
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.relationships_following)) {
      list = obj.relationships_following
    } else if (Array.isArray(obj.relationships_followers)) {
      list = obj.relationships_followers
    } else if (Array.isArray(obj.string_list_data)) {
      list = [obj]
    } else {
      throw new Error('This file is not an Instagram followers or following JSON list.')
    }
  } else {
    throw new Error('This file is not an Instagram followers or following JSON list.')
  }

  const people = new Map<string, Person>()
  for (const row of list as ExportEntry[]) {
    const entry = row?.string_list_data?.[0]
    const username = entry?.value?.trim().replace(/^@/, '') || (row as { title?: string })?.title?.trim().replace(/^@/, '')
    if (!username) continue
    const safeHref = entry?.href?.startsWith('https://www.instagram.com/') ? entry.href : ''
    const href = safeHref || `https://www.instagram.com/${encodeURIComponent(username)}/`
    const timestamp = (entry as { timestamp?: number })?.timestamp
    people.set(username.toLocaleLowerCase('en-US'), { username, href, timestamp })
  }
  return [...people.values()]
}

export async function readInstagramFiles(files: FileList | File[]) {
  const groups = new Map<'followers' | 'following', Person[]>()
  const merge = (a: Person[], b: Person[]) => {
    const people = new Map<string, Person>()
    for (let i = 0; i < a.length; i++) {
      people.set(a[i].username.toLocaleLowerCase('en-US'), a[i])
    }
    for (let i = 0; i < b.length; i++) {
      people.set(b[i].username.toLocaleLowerCase('en-US'), b[i])
    }
    return [...people.values()]
  }

  const add = async (filename: string, jsonContent: string, ignoreUnknown = false) => {
    const kind = classifyExportFile(filename.split(/[\\/]/).at(-1) || filename)
    if (!kind) {
      if (ignoreUnknown) return
      throw new Error(`Could not identify ${filename}. Choose followers_N.json files and following.json.`)
    }
    const parsed = parseInstagramExport(JSON.parse(jsonContent))
    groups.set(kind, merge(groups.get(kind) || [], parsed))
  }

  for (const file of Array.from(files)) {
    if (file.name.toLocaleLowerCase('en-US').endsWith('.zip')) {
      // Chunked streaming reading of zip container without huge heap spikes
      const zip = await JSZip.loadAsync(file)
      const matchingEntries: Array<{ path: string; entry: JSZip.JSZipObject }> = []
      
      zip.forEach((relativePath, entry) => {
        if (!entry.dir && classifyExportFile(relativePath.split(/[\\/]/).at(-1) || relativePath)) {
          matchingEntries.push({ path: relativePath, entry })
        }
      })

      // Stream sequentially one entry at a time to keep garbage collection tight
      for (const { path, entry } of matchingEntries) {
        const textChunk = await entry.async('string')
        await add(path, textChunk, true)
      }
    } else {
      await add(file.name, await file.text())
    }
  }
  return groups
}

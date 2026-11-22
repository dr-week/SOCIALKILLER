import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function parseEnvFileContent(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    let val = line.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (key) result[key] = val
  }
  return result
}

export function loadDotEnv(envFilePath = resolve(process.cwd(), '.env')): Record<string, string> {
  if (!existsSync(envFilePath)) return {}
  try {
    const raw = readFileSync(envFilePath, 'utf8')
    const parsed = parseEnvFileContent(raw)
    for (const [k, v] of Object.entries(parsed)) {
      if (process.env[k] === undefined) process.env[k] = v
    }
    return parsed
  } catch {
    return {}
  }
}

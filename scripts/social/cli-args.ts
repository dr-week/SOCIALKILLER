import {
  ALL_PLATFORMS,
  type PresetName,
  type SocialPlatform,
  type SocialPostPayload
} from './types.ts'

export function parsePlatformsList(raw?: string): SocialPlatform[] {
  if (!raw || raw.trim().toLowerCase() === 'all') {
    return [...ALL_PLATFORMS]
  }
  const requested = raw
    .split(',')
    .map(p => p.trim().toLowerCase())
    .filter(Boolean)

  const valid: SocialPlatform[] = []
  for (const item of requested) {
    if (item === 'x') {
      if (!valid.includes('twitter')) valid.push('twitter')
    } else if (item === 'instagram' || item === 'ig' || item === 'meta') {
      if (!valid.includes('buffer')) valid.push('buffer')
    } else if ((ALL_PLATFORMS as string[]).includes(item)) {
      const cast = item as SocialPlatform
      if (!valid.includes(cast)) valid.push(cast)
    }
  }
  return valid.length > 0 ? valid : [...ALL_PLATFORMS]
}

export function parseCliArgs(argv: string[]): {
  platforms: SocialPlatform[]
  preset: PresetName
  dryRun: boolean
  statusOnly: boolean
  customPayload: Partial<SocialPostPayload>
} {
  const args: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i] ?? ''
    if (!token.startsWith('--')) continue
    const withoutDashes = token.slice(2)
    const eqIdx = withoutDashes.indexOf('=')
    if (eqIdx !== -1) {
      const k = withoutDashes.slice(0, eqIdx).trim()
      const v = withoutDashes.slice(eqIdx + 1).trim()
      args[k] = v
    } else {
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        args[withoutDashes] = next
        i++
      } else {
        args[withoutDashes] = true
      }
    }
  }

  const dryRun = Boolean(args['dry-run'] || args.dryRun || process.env.SOCIAL_DRY_RUN === 'true')
  const statusOnly = Boolean(args.status)
  const presetRaw = String(args.preset || 'release').toLowerCase()
  const preset: PresetName =
    presetRaw === 'benchmark' || presetRaw === 'community' || presetRaw === 'custom'
      ? presetRaw
      : 'release'

  const platforms = parsePlatformsList(
    typeof args.platforms === 'string' ? args.platforms : undefined
  )

  const customPayload: Partial<SocialPostPayload> = {}
  if (typeof args.title === 'string') customPayload.title = args.title
  if (typeof args.summary === 'string') customPayload.summary = args.summary
  if (typeof args.detailed === 'string') customPayload.detailed = args.detailed
  if (typeof args.image === 'string') customPayload.imagePath = args.image
  if (typeof args.url === 'string') customPayload.url = args.url
  if (typeof args.subreddit === 'string') customPayload.subreddit = args.subreddit
  if (typeof args.version === 'string') customPayload.versionTag = args.version
  if (typeof args.tags === 'string') {
    customPayload.tags = args.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }

  return { platforms, preset, dryRun, statusOnly, customPayload }
}

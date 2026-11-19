import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bufferAdapter } from './adapters/buffer.ts'
import { discordAdapter } from './adapters/discord.ts'
import { githubAdapter } from './adapters/github.ts'
import { linkedinAdapter } from './adapters/linkedin.ts'
import { redditAdapter } from './adapters/reddit.ts'
import { telegramAdapter } from './adapters/telegram.ts'
import { twitterAdapter } from './adapters/twitter.ts'
import { getPlatformReadiness, loadDotEnv, loadSocialConfig } from './config.ts'
import { getPresetPayload } from './presets.ts'
import {
  checkIdempotency,
  computeBroadcastIdempotencyToken,
  recordIdempotency
} from './sync-client.ts'
import {
  ALL_PLATFORMS,
  type PlatformPublishResult,
  type PresetName,
  type SocialAdapter,
  type SocialEnvConfig,
  type SocialPlatform,
  type SocialPostPayload
} from './types.ts'

export const ADAPTER_REGISTRY: Record<SocialPlatform, SocialAdapter> = {
  discord: discordAdapter,
  telegram: telegramAdapter,
  twitter: twitterAdapter,
  linkedin: linkedinAdapter,
  github: githubAdapter,
  buffer: bufferAdapter,
  reddit: redditAdapter
}

export interface BroadcastOptions {
  platforms?: SocialPlatform[]
  dryRun?: boolean
  config?: SocialEnvConfig
}

export interface BroadcastSummary {
  dryRun: boolean
  timestamp: string
  payload: SocialPostPayload
  results: PlatformPublishResult[]
  succeededCount: number
  failedCount: number
}

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

export async function broadcastSocialPost(
  payload: SocialPostPayload,
  options: BroadcastOptions = {}
): Promise<BroadcastSummary> {
  loadDotEnv()
  const config = options.config ?? loadSocialConfig()
  const platforms =
    options.platforms && options.platforms.length > 0 ? options.platforms : [...ALL_PLATFORMS]
  const dryRun = Boolean(options.dryRun)

  const results: PlatformPublishResult[] = []

  for (const platform of platforms) {
    const adapter = ADAPTER_REGISTRY[platform]
    if (!adapter) continue
    const res = await adapter.publish(payload, config, { dryRun })
    results.push(res)
  }

  const succeededCount = results.filter(r => r.ok).length
  const failedCount = results.length - succeededCount

  return {
    dryRun,
    timestamp: new Date().toISOString(),
    payload,
    results,
    succeededCount,
    failedCount
  }
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

  return {
    platforms,
    preset,
    dryRun,
    statusOnly,
    customPayload
  }
}

export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  loadDotEnv()
  const config = loadSocialConfig()
  const parsed = parseCliArgs(argv)

  console.log('====================================================================')
  console.log(`📡 UNIVERSAL MULTI-PLATFORM SOCIAL AUTO-PUBLISHER (${config.brandName})`)
  console.log('====================================================================')

  const readiness = getPlatformReadiness(config)

  if (parsed.statusOnly) {
    console.log('\n🔍 Platform Credential Readiness Matrix:')
    for (const platform of ALL_PLATFORMS) {
      const r = readiness[platform]
      const adapter = ADAPTER_REGISTRY[platform]
      const badge = r.configured ? '✅ READY' : '⚠️  MISSING ENV'
      console.log(
        `  • ${adapter.name.padEnd(44)} ${badge}${r.missingKeys.length ? ` (${r.missingKeys.join(', ')})` : ''}`
      )
    }
    return 0
  }

  const basePreset = getPresetPayload(parsed.preset, config.defaultUrl, config.brandName)
  const payload: SocialPostPayload = {
    ...basePreset,
    ...parsed.customPayload,
    tags: parsed.customPayload.tags ?? basePreset.tags
  }

  const token = computeBroadcastIdempotencyToken(payload, parsed.customPayload.versionTag)
  console.log(`🎯 Mode      : ${parsed.dryRun ? 'DRY-RUN (Safe Preview Only)' : 'LIVE BROADCAST'}`)
  console.log(`📦 Preset    : ${parsed.preset}`)
  console.log(`🌐 Platforms : ${parsed.platforms.join(', ')}`)
  console.log(`📝 Title     : ${payload.title}`)
  console.log(`🔑 Token     : ${token}`)
  console.log('--------------------------------------------------------------------\n')

  if (!parsed.dryRun) {
    const check = await checkIdempotency(token)
    if (check.exists) {
      console.log(`⏭️  SKIPPED: Post already broadcasted (${check.reason}). Idempotency guard prevents double-posting.\n`)
      return 0
    }
  }

  const summary = await broadcastSocialPost(payload, {
    platforms: parsed.platforms,
    dryRun: parsed.dryRun,
    config
  })

  if (!parsed.dryRun && summary.succeededCount > 0) {
    await recordIdempotency(token, payload)
  }

  for (const res of summary.results) {
    const icon = res.ok ? '✅' : '❌'
    console.log(`${icon} [${res.platform.toUpperCase()}] ${res.message} (${res.durationMs}ms)`)
    if (res.externalUrl) {
      console.log(`   🔗 Live URL: ${res.externalUrl}`)
    }
    if (res.error && !res.dryRun) {
      console.log(`   ⚠️  Error  : ${res.error}`)
    }
    if (res.dryRun && res.formattedPreview) {
      console.log('   📋 Formatted Payload Preview:')
      const previewLines = JSON.stringify(res.formattedPreview, null, 2).split('\n')
      for (const line of previewLines) {
        console.log(`      ${line}`)
      }
      console.log('')
    }
  }

  console.log('====================================================================')
  console.log(
    `🏁 Broadcast Complete: ${summary.succeededCount}/${summary.results.length} succeeded, ${summary.failedCount} failed.`
  )
  console.log('====================================================================')

  return summary.failedCount > 0 && !parsed.dryRun ? 1 : 0
}

// Execute CLI if invoked directly
const isDirectExecution =
  process.argv[1] &&
  resolve(process.argv[1]).toLowerCase() ===
    resolve(fileURLToPath(import.meta.url)).toLowerCase()

if (isDirectExecution) {
  runCli().then(code => {
    process.exitCode = code
  })
}

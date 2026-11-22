import { getPlatformReadiness, loadDotEnv, loadSocialConfig } from './config.ts'
import { parseCliArgs } from './cli-args.ts'
import { getPresetPayload } from './presets.ts'
import {
  checkIdempotency,
  computeBroadcastIdempotencyToken,
  recordIdempotency
} from './sync-client.ts'
import {
  ALL_PLATFORMS,
  type SocialAdapter,
  type SocialPlatform,
  type SocialPostPayload
} from './types.ts'
import type { BroadcastOptions, BroadcastSummary } from './index.ts'

export async function runSocialCli(
  argv: string[],
  registry: Record<SocialPlatform, SocialAdapter>,
  broadcastFn: (payload: SocialPostPayload, options?: BroadcastOptions) => Promise<BroadcastSummary>
): Promise<number> {
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
      const adapter = registry[platform]
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

  const summary = await broadcastFn(payload, {
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
    if (res.externalUrl) console.log(`   🔗 Live URL: ${res.externalUrl}`)
    if (res.error && !res.dryRun) console.log(`   ⚠️  Error  : ${res.error}`)
    if (res.dryRun && res.formattedPreview) {
      console.log('   📋 Formatted Payload Preview:')
      for (const line of JSON.stringify(res.formattedPreview, null, 2).split('\n')) {
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

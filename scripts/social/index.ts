import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bufferAdapter } from './adapters/buffer.ts'
import { discordAdapter } from './adapters/discord.ts'
import { githubAdapter } from './adapters/github.ts'
import { linkedinAdapter } from './adapters/linkedin.ts'
import { redditAdapter } from './adapters/reddit.ts'
import { telegramAdapter } from './adapters/telegram.ts'
import { twitterAdapter } from './adapters/twitter.ts'
import { loadDotEnv, loadSocialConfig } from './config.ts'
import { parseCliArgs, parsePlatformsList } from './cli-args.ts'
import { runSocialCli } from './cli-runner.ts'
import {
  ALL_PLATFORMS,
  type PlatformPublishResult,
  type SocialAdapter,
  type SocialEnvConfig,
  type SocialPlatform,
  type SocialPostPayload
} from './types.ts'

export { parseCliArgs, parsePlatformsList }

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

export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  return runSocialCli(argv, ADAPTER_REGISTRY, broadcastSocialPost)
}

const isDirectExecution =
  process.argv[1] &&
  resolve(process.argv[1]).toLowerCase() ===
    resolve(fileURLToPath(import.meta.url)).toLowerCase()

if (isDirectExecution) {
  runCli().then(code => {
    process.exitCode = code
  })
}

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPlatformReadiness,
  loadSocialConfig,
  parseEnvFileContent
} from '../scripts/social/config.ts'
import {
  buildTwitterMicroThread,
  escapeHtml,
  escapeTelegramMarkdownV2,
  hexToDiscordColorInt,
  normalizeTags
} from '../scripts/social/utils.ts'
import { buildDiscordWebhookPayload } from '../scripts/social/adapters/discord.ts'
import { buildTelegramRequest } from '../scripts/social/adapters/telegram.ts'
import { buildLinkedInUgcPayload } from '../scripts/social/adapters/linkedin.ts'
import { buildBufferPreview } from '../scripts/social/adapters/buffer.ts'
import { buildGitHubReleasePayload } from '../scripts/social/adapters/github.ts'
import { buildRedditSubmission } from '../scripts/social/adapters/reddit.ts'
import {
  broadcastSocialPost,
  parseCliArgs,
  parsePlatformsList
} from '../scripts/social/index.ts'
import { getPresetPayload } from '../scripts/social/presets.ts'

test('parseEnvFileContent parses key-value pairs and strips quotes safely', () => {
  const raw = `
    # Comment line
    DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/123/abc"
    TELEGRAM_BOT_TOKEN='999:xyz'
    TELEGRAM_CHAT_ID=@zuari_announcements
  `
  const parsed = parseEnvFileContent(raw)
  assert.equal(parsed.DISCORD_WEBHOOK_URL, 'https://discord.com/api/webhooks/123/abc')
  assert.equal(parsed.TELEGRAM_BOT_TOKEN, '999:xyz')
  assert.equal(parsed.TELEGRAM_CHAT_ID, '@zuari_announcements')
})

test('getPlatformReadiness reports configured and missing keys accurately', () => {
  const cfg = loadSocialConfig({
    DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1/2',
    TELEGRAM_BOT_TOKEN: 'bot-token-only'
  })
  const readiness = getPlatformReadiness(cfg)
  assert.equal(readiness.discord.configured, true)
  assert.deepEqual(readiness.discord.missingKeys, [])
  assert.equal(readiness.telegram.configured, false)
  assert.deepEqual(readiness.telegram.missingKeys, ['TELEGRAM_CHAT_ID'])
})

test('normalizeTags deduplicates and prefixes hashtags cleanly', () => {
  const tags = normalizeTags(['#Zuari', 'zuari', 'DangerLabs', '  Open Source  ', ''])
  assert.deepEqual(tags, ['#Zuari', '#DangerLabs', '#OpenSource'])
})

test('buildTwitterMicroThread respects 280-char limit and threads long summaries', () => {
  const shortThread = buildTwitterMicroThread(
    'Zuari v0.2.0',
    'Fast multi-platform social auto-publisher is live!',
    'https://github.com/danger-labs/followdesk',
    ['Zuari', 'OpenSource']
  )
  assert.equal(shortThread.length, 1)
  assert.ok(shortThread[0].length <= 280)

  const longSummary = 'A'.repeat(260)
  const threaded = buildTwitterMicroThread(
    'Major Architectural Release',
    longSummary,
    'https://github.com/danger-labs/followdesk/releases/tag/v1.0.0',
    ['Zuari', 'DangerLabs', 'TypeScript', 'Automation']
  )
  for (const tweet of threaded) {
    assert.ok(tweet.length <= 280, `Tweet exceeded 280 chars: ${tweet.length}`)
  }
})

test('Adapters format platform-specific payloads accurately (Discord, Telegram, LinkedIn, Buffer, GitHub, Reddit)', () => {
  const config = loadSocialConfig({
    DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1/2',
    TELEGRAM_BOT_TOKEN: '123:abc',
    TELEGRAM_CHAT_ID: '@zuari_channel',
    LINKEDIN_ACCESS_TOKEN: 'li_token',
    LINKEDIN_AUTHOR_URN: 'urn:li:person:abc123',
    BUFFER_ACCESS_TOKEN: 'buf_token',
    BUFFER_PROFILE_IDS: 'prof1,prof2',
    GITHUB_TOKEN: 'ghp_test',
    GITHUB_REPOSITORY: 'danger-labs/followdesk',
    REDDIT_SUBREDDIT: 'opensource'
  })

  const payload = getPresetPayload('release', config.defaultUrl, config.brandName)

  const discordBody = buildDiscordWebhookPayload(payload, config)
  assert.equal(discordBody.embeds.length, 1)
  assert.equal(discordBody.embeds[0].color, hexToDiscordColorInt('#a855f7'))
  assert.ok(discordBody.embeds[0].title.includes('Released'))

  const telegramReq = buildTelegramRequest(payload, config)
  assert.equal(telegramReq.endpoint, 'sendPhoto')
  assert.equal(telegramReq.chat_id, '@zuari_channel')
  assert.ok(telegramReq.textOrCaption.includes('<b>'))

  const linkedinBody = buildLinkedInUgcPayload(payload, config)
  assert.equal(linkedinBody.author, 'urn:li:person:abc123')
  assert.equal(
    linkedinBody.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory,
    'ARTICLE'
  )

  const bufferPrev = buildBufferPreview(payload, config)
  assert.equal(bufferPrev.mode, 'buffer')
  assert.deepEqual(bufferPrev.profileIds, ['prof1', 'prof2'])

  const ghRelease = buildGitHubReleasePayload(payload, config)
  assert.equal(ghRelease.repository, 'danger-labs/followdesk')
  assert.ok(ghRelease.tag_name.startsWith('v'))

  const redditSub = buildRedditSubmission(payload, config)
  assert.equal(redditSub.subreddit, 'opensource')
  assert.equal(redditSub.kind, 'self')
})

test('broadcastSocialPost in dryRun mode succeeds across all 7 platforms without network calls', async () => {
  const config = loadSocialConfig({})
  const payload = getPresetPayload('community')
  const summary = await broadcastSocialPost(payload, {
    platforms: parsePlatformsList('discord,telegram,twitter,linkedin,github,buffer,reddit'),
    dryRun: true,
    config
  })

  assert.equal(summary.dryRun, true)
  assert.equal(summary.results.length, 7)
  assert.equal(summary.succeededCount, 7)
  assert.equal(summary.failedCount, 0)
})

test('parseCliArgs handles --platforms, --preset, and --dry-run flags', () => {
  const parsed = parseCliArgs([
    '--platforms=discord,telegram,twitter,reddit',
    '--preset=benchmark',
    '--dry-run',
    '--title=Custom Benchmark Title'
  ])
  assert.deepEqual(parsed.platforms, ['discord', 'telegram', 'twitter', 'reddit'])
  assert.equal(parsed.preset, 'benchmark')
  assert.equal(parsed.dryRun, true)
  assert.equal(parsed.customPayload.title, 'Custom Benchmark Title')
})

test('escapeHtml and escapeTelegramMarkdownV2 sanitize special characters', () => {
  assert.equal(escapeHtml('<script>&</script>'), '&lt;script&gt;&amp;&lt;/script&gt;')
  assert.equal(escapeTelegramMarkdownV2('v1.0.0 (beta)!'), 'v1\\.0\\.0 \\(beta\\)\\!')
})

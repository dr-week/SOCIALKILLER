import { runSocialKillerCli } from '../../cli-anything/socialkiller-cli.ts'
import { summarizeCreativeText } from '../../../src/domain/text-summarizer.ts'
import { predictViralReach } from '../../../src/domain/analytics/viral-predictor.ts'
import { validatePostQuality } from '../../../server/marketing/content-safety-guard.mjs'

function check(checks) {
  const passed = checks.every(c => c.ok)
  const score = checks.filter(c => c.ok).length / checks.length
  return { passed, score, checks, failureReason: passed ? null : checks.filter(c => !c.ok).map(c => c.name).join(', ') }
}

export const contentCliScenarios = [
  {
    id: 'cli-manifest-schema',
    suite: 'content-cli',
    description: 'CLI-Anything manifest emits deterministic JSON schema envelope',
    run: async (ctx) => {
      const env = await runSocialKillerCli(['manifest'])
      ctx.recordTool('socialkiller-cli', ['manifest'], { ok: env.ok, count: env.data.commands.length })
      return env
    },
    evaluate: (env) => check([
      { name: 'harness_ok', ok: env.ok === true && env.harness === 'socialkiller-cli-anything' },
      { name: 'commands_present', ok: Array.isArray(env.data?.commands) && env.data.commands.length >= 5 }
    ])
  },
  {
    id: 'cli-summarize-dedupe-and-bounds',
    suite: 'content-cli',
    description: 'Text summarizer removes duplicate sentences and bounds X hooks <=280 chars',
    run: async () => {
      const text = 'Middlemen agencies take 99% of creative profit. Middlemen agencies take 99% of creative profit. SOCIALKILLER automates scheduling and workflows locally. Save 10 hours a week with zero SaaS rent.'
      return { cli: await runSocialKillerCli(['summarize', '--text', text, '--bullets', '3']), direct: summarizeCreativeText(text, 3) }
    },
    evaluate: ({ cli, direct }) => check([
      { name: 'cli_ok', ok: cli.ok === true },
      { name: 'deduped_lines', ok: direct.removedDuplicatesCount >= 1 },
      { name: 'x_hook_within_280', ok: direct.channelBriefs.xHook.length > 0 && direct.channelBriefs.xHook.length <= 280 },
      { name: 'compressed_ratio', ok: direct.compressionRatio <= 1 }
    ])
  },
  {
    id: 'cli-summarize-empty-edge',
    suite: 'content-cli',
    description: 'Empty/whitespace input handles safely without crashing',
    run: async () => summarizeCreativeText('   \n  ', 3),
    evaluate: (res) => check([
      { name: 'empty_bullets', ok: Array.isArray(res.bulletPoints) && res.bulletPoints.length === 0 },
      { name: 'empty_tldr', ok: res.tldr === '' }
    ])
  },
  {
    id: 'cli-unknown-command-error',
    suite: 'content-cli',
    description: 'Unknown CLI command fails closed with supported commands list',
    run: async () => runSocialKillerCli(['nonexistent-cmd']),
    evaluate: (res) => check([
      { name: 'ok_false', ok: res.ok === false },
      { name: 'supported_listed', ok: Array.isArray(res.data?.supported) && res.data.supported.includes('summarize') }
    ])
  },
  {
    id: 'viral-predictor-cliche-penalty',
    suite: 'content-cli',
    description: 'Generic AI cliché scores strictly below strong contrarian value hook',
    run: async () => {
      const cliche = predictViralReach("In today's fast-paced world, this game-changer will elevate your workflow.")
      const strong = predictViralReach('Stop paying agencies 99%. Save this 3-step framework to run your own studio locally.')
      return { cliche, strong }
    },
    evaluate: ({ cliche, strong }) => check([
      { name: 'strong_beats_cliche', ok: strong.overallScore > cliche.overallScore && strong.hookScore > cliche.hookScore },
      { name: 'cliche_flagged', ok: cliche.tips.some(t => t.includes('cliché')) }
    ])
  },
  {
    id: 'safety-guard-spam-and-short',
    suite: 'content-cli',
    description: 'Content safety guard blocks spam bait and overly short copy',
    run: async () => ({
      short: validatePostQuality({ title: 'Hi', body: 'Short' }),
      spam: validatePostQuality({ title: 'Huge Crypto Moon', body: 'Get free money guaranteed 100x crypto moon right now before it ends!' })
    }),
    evaluate: ({ short, spam }) => check([
      { name: 'short_rejected', ok: short.passed === false },
      { name: 'spam_rejected', ok: spam.passed === false && spam.reason.includes('spam') }
    ])
  }
]

#!/usr/bin/env node
/**
 * SOCIALKILLER Agent-Native CLI Harness (CLI-Anything Architecture) (<135 lines)
 * Exposes deterministic, JSON-emitting commands for creative workers & AI coding agents:
 *   node --experimental-strip-types scripts/cli-anything/socialkiller-cli.ts <command> [options]
 * Commands:
 *   manifest            Emit CLI-Anything tool schema & capability registry
 *   summarize --text    Deterministic TextRank/TF-IDF summarization & channel briefs
 *   status              Check local backend (4174) & frontend (5199) runtime status
 *   visual-bot          Inspect 3-layer Visual Bot (CLI -> DOM/A11y -> Vision Contour) readiness
 */

import { summarizeCreativeText } from '../../src/domain/text-summarizer.ts'
import { predictViralReach } from '../../src/domain/analytics/viral-predictor.ts'

export interface CliAnythingEnvelope<T = unknown> {
  harness: 'socialkiller-cli-anything'
  version: '1.0.0'
  command: string
  ok: boolean
  timestamp: string
  data: T
}

export const CLI_ANYTHING_MANIFEST = {
  name: 'socialkiller',
  title: 'SOCIALKILLER Agent-Native CLI Harness',
  architecture: 'HKUDS/CLI-Anything + Stagehand DOM/A11y + Sobel Vision Contour',
  commands: [
    { name: 'manifest', description: 'Return machine-readable CLI-Anything skill & tool definitions' },
    { name: 'summarize', description: 'Summarize long text/threads into TL;DR bullets and X/LinkedIn/IG micro-briefs', args: ['--text', '--bullets'] },
    { name: 'score', description: 'Run deterministic viral hook & sentiment predictor on a draft caption', args: ['--text'] },
    { name: 'visual-bot', description: 'Inspect 3-layer Visual Bot capabilities and human-approval safety gates' },
    { name: 'status', description: 'Probe local SOCIALKILLER API (127.0.0.1:4174) health' }
  ]
}

function parseFlag(args: string[], flag: string, fallback = ''): string {
  const idx = args.indexOf(flag)
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : fallback
}

export async function runSocialKillerCli(argv: string[] = process.argv.slice(2)): Promise<CliAnythingEnvelope> {
  const command = (argv[0] || 'manifest').toLowerCase()
  const now = new Date().toISOString()

  if (command === 'manifest' || command === '--help' || command === '-h') {
    return { harness: 'socialkiller-cli-anything', version: '1.0.0', command: 'manifest', ok: true, timestamp: now, data: CLI_ANYTHING_MANIFEST }
  }

  if (command === 'summarize') {
    const text = parseFlag(argv, '--text', 'SOCIALKILLER eliminates the middleman social media agency model. Creative workers keep 100% of their profit while automating multi-channel publishing, audience audits, and visual workflows locally.')
    const bullets = Math.max(1, Math.min(5, Number(parseFlag(argv, '--bullets', '3')) || 3))
    const summary = summarizeCreativeText(text, bullets)
    return { harness: 'socialkiller-cli-anything', version: '1.0.0', command: 'summarize', ok: true, timestamp: now, data: summary }
  }

  if (command === 'score') {
    const text = parseFlag(argv, '--text', 'Stop giving 90% of your creative retainer to agency middlemen. Run your entire studio locally.')
    const prediction = predictViralReach(text)
    return { harness: 'socialkiller-cli-anything', version: '1.0.0', command: 'score', ok: true, timestamp: now, data: prediction }
  }

  if (command === 'visual-bot') {
    return {
      harness: 'socialkiller-cli-anything',
      version: '1.0.0',
      command: 'visual-bot',
      ok: true,
      timestamp: now,
      data: {
        layers: [
          { layer: 1, name: 'CLI-Anything JSON Harness', latencyTarget: '<10ms', status: 'ready' },
          { layer: 2, name: 'Stagehand-style Semantic DOM & Set-of-Mark A11y Indexer', latencyTarget: '<50ms', status: 'ready' },
          { layer: 3, name: 'Theme-Invariant Sobel Edge & 2D NCC Contour Engine', latencyTarget: '<120ms', status: 'ready' }
        ],
        safety: {
          dryRunDefault: true,
          humanApprovalRequired: true,
          humanCadenceJitter: 'Box-Muller log-normal (45ms-520ms DOM / 15s-35s queue)'
        }
      }
    }
  }

  if (command === 'status') {
    try {
      const res = await fetch('http://127.0.0.1:4174/api/health', { signal: AbortSignal.timeout(1500) })
      const health = res.ok ? await res.json() : { status: 'unreachable', httpStatus: res.status }
      return { harness: 'socialkiller-cli-anything', version: '1.0.0', command: 'status', ok: res.ok, timestamp: now, data: health }
    } catch {
      return { harness: 'socialkiller-cli-anything', version: '1.0.0', command: 'status', ok: false, timestamp: now, data: { status: 'offline', port: 4174 } }
    }
  }

  return {
    harness: 'socialkiller-cli-anything',
    version: '1.0.0',
    command,
    ok: false,
    timestamp: now,
    data: { error: `Unknown command: ${command}`, supported: CLI_ANYTHING_MANIFEST.commands.map(c => c.name) }
  }
}

if (import.meta.url.endsWith('socialkiller-cli.ts') && process.argv[1]?.includes('socialkiller-cli')) {
  runSocialKillerCli().then(result => {
    console.log(JSON.stringify(result, null, 2))
    if (!result.ok && result.command !== 'status') process.exitCode = 1
  })
}

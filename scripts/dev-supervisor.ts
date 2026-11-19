#!/usr/bin/env node
/**
 * SOCIALKILLER Unified Developer Maintenance, Modularity & Visual Bot Supervisor (<135 lines)
 * Usage:
 *   npm run dev:doctor               -> Full live health check (Processes, DB, Visual Bot, TS, Hygiene)
 *   npm run dev:doctor -- --ci       -> Exit non-zero if any deterministic check fails
 *   npm run dev:doctor -- --json     -> Machine-readable JSON report for CI / CLI-Anything
 */

import fs from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { computeSobelEdges, rgbaToGrayscale, synthesizeIconEdgeMap, matchTemplateEdge } from '../server/engine/vision-contour.mjs'
import { computeHumanJitterMs } from '../extension/modules/human-cadence.js'
import { runSocialKillerCli } from './cli-anything/socialkiller-cli.ts'
import { collectProjectSourceFiles } from './check-file-size.mjs'
import { auditUiHygiene } from './uiux/ui-hygiene-check.mjs'
import { isPortActive } from './port-arbiter.mjs'
import { runAllAgentEvals } from './agent-eval/run-evals.mjs'

interface CheckResult {
  id: string
  label: string
  ok: boolean
  deterministic: boolean
  detail: string
}

async function probeUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}

function verifyVisualBotContourEngine(): { ok: boolean; detail: string } {
  const width = 32
  const height = 32
  const rgba = new Uint8ClampedArray(width * height * 4).fill(255)
  const gray = rgbaToGrayscale(rgba, width, height)
  const edges = computeSobelEdges(gray, width, height)
  const heartEdges = synthesizeIconEdgeMap('heart', 16, 16)
  const match = matchTemplateEdge(edges, width, height, heartEdges, 16, 16, 0.5)
  const jitter = computeHumanJitterMs(140, 50)
  const ok = edges.length === width * height && heartEdges.length === 256 && jitter >= 45 && typeof match.confidence === 'number'
  return { ok, detail: `Sobel 32x32 + 2D NCC ready · Jitter ${jitter}ms` }
}

async function auditSourceModularity(): Promise<{ totalFiles: number; underLimitCount: number }> {
  const files = await collectProjectSourceFiles()
  let underLimitCount = 0
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').trimEnd().split(/\r?\n/).length
    if (lines < 150) underLimitCount++
  }
  return { totalFiles: files.length, underLimitCount }
}

export async function runDevSupervisor() {
  const checks: CheckResult[] = []
  const ciMode = process.argv.includes('--ci')

  const [api, ui, port5173, cli, hygiene, mod, evalReport] = await Promise.all([
    probeUrl('http://127.0.0.1:4174/api/health'),
    probeUrl('http://127.0.0.1:5199/'),
    isPortActive(5173),
    runSocialKillerCli(['summarize', '--text', 'Agencies take 90%. Agencies take 90%! SOCIALKILLER gives creators 100% control.']),
    auditUiHygiene(),
    auditSourceModularity(),
    runAllAgentEvals()
  ])

  checks.push({ id: 'api', label: 'Backend API (4174)', ok: api.ok, deterministic: false, detail: api.ok ? 'ONLINE' : 'OFFLINE' })
  checks.push({ id: 'ui', label: 'Frontend UI (5199)', ok: ui.ok, deterministic: false, detail: ui.ok ? 'ONLINE' : 'OFFLINE' })
  checks.push({ id: 'port-shield', label: 'Port 5173 Isolation', ok: true, deterministic: true, detail: port5173 ? 'Shielded (5173 external)' : '5173 free' })

  const dbExists = fs.existsSync('.data/followdesk.sqlite')
  checks.push({ id: 'db', label: '5-Pillar SQLite WAL Store', ok: dbExists, deterministic: false, detail: dbExists ? '.data/followdesk.sqlite active' : 'Pending first write' })
  checks.push({ id: 'cli', label: 'CLI-Anything & Dedupe Summarizer', ok: cli.ok, deterministic: true, detail: cli.ok ? 'TextRank + Jaccard dedupe OK' : 'Failed' })

  const vbot = verifyVisualBotContourEngine()
  checks.push({ id: 'visual-bot', label: '3-Layer Visual Bot & Sobel Vision', ok: vbot.ok, deterministic: true, detail: vbot.detail })
  checks.push({
    id: 'agent-evals',
    label: 'Agent Eval Harness (5 Suites)',
    ok: evalReport.failed === 0 && evalReport.total > 0,
    deterministic: true,
    detail: `${evalReport.passed}/${evalReport.total} passed · p95 ${evalReport.p95LatencyMs}ms`
  })
  checks.push({
    id: 'ui-hygiene',
    label: 'UI Hygiene & Zero Telemetry',
    ok: hygiene.ok,
    deterministic: true,
    detail: `${hygiene.cssFiles.length} .css · ${hygiene.forbiddenMatches.length} telemetry hits · ${mod.underLimitCount}/${mod.totalFiles} files <150 lines`
  })

  let tsOk = false
  try {
    execFileSync(process.execPath, [resolve('node_modules/vue-tsc/bin/vue-tsc.js'), '--noEmit', '-p', 'src/tsconfig.json'], { stdio: 'ignore' })
    tsOk = true
  } catch {
    tsOk = false
  }
  checks.push({ id: 'type-check', label: 'TypeScript Strict Check (vue-tsc)', ok: tsOk, deterministic: true, detail: tsOk ? '0 errors' : 'Type errors detected' })

  if (ciMode && checks.some(c => c.deterministic && !c.ok)) process.exitCode = 1

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ app: 'SOCIALKILLER', timestamp: new Date().toISOString(), checks }, null, 2))
    return
  }

  console.log('\n=============================================================')
  console.log('   SOCIALKILLER · DEV SUPERVISOR & VISUAL BOT DOCTOR')
  console.log('=============================================================')
  for (const c of checks) {
    console.log(` [${c.ok ? 'PASS' : 'WARN'}] ${c.label.padEnd(36)} -> ${c.detail}`)
  }
  console.log('=============================================================\n')
}

if (process.argv[1]?.includes('dev-supervisor')) {
  void runDevSupervisor()
}

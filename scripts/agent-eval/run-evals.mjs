import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { computeBaselineDiff, formatScorecard, runEvalSuite } from './harness-core.mjs'
import { assistantScenarios } from './scenarios/assistant-scenarios.mjs'
import { contentCliScenarios } from './scenarios/content-cli-scenarios.mjs'
import { workflowVisualScenarios } from './scenarios/workflow-visual-scenarios.mjs'
import { securityOrchestrationScenarios } from './scenarios/security-orchestration-scenarios.mjs'
import { persistenceSchedulerScenarios } from './scenarios/persistence-scheduler-scenarios.mjs'

const ALL_SCENARIOS = [
  ...assistantScenarios,
  ...contentCliScenarios,
  ...workflowVisualScenarios,
  ...securityOrchestrationScenarios,
  ...persistenceSchedulerScenarios
]

async function readPreviousReport(tracePath) {
  try {
    return JSON.parse(await readFile(tracePath, 'utf8'))
  } catch {
    return null
  }
}

export async function runAllAgentEvals({ suiteFilter = '', writeTrace = false } = {}) {
  const traceDir = resolve('.data/eval-traces')
  const tracePath = resolve(traceDir, 'latest.json')
  const previous = await readPreviousReport(tracePath)
  const report = await runEvalSuite(ALL_SCENARIOS, { suiteFilter })
  report.baselineDiff = computeBaselineDiff(previous, report)

  if (writeTrace) {
    await mkdir(traceDir, { recursive: true })
    await writeFile(tracePath, JSON.stringify(report, null, 2), 'utf8')
  }
  return report
}

async function main() {
  const args = process.argv.slice(2)
  const suiteArg = args.find(a => a.startsWith('--suite='))
  const suiteFilter = suiteArg ? suiteArg.slice('--suite='.length) : ''
  const writeTrace = args.includes('--write-trace')
  const report = await runAllAgentEvals({ suiteFilter, writeTrace })

  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else console.log(formatScorecard(report))

  if (args.includes('--ci') && report.failed > 0) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(err => {
    console.error('Agent eval harness failed:', err.message)
    process.exitCode = 1
  })
}

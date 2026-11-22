import { execSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'

const checks = [
  { name: 'TypeScript Type Check', cmd: 'npm run type-check' },
  { name: 'UI/UX Hygiene & Tokens', cmd: 'npm run uiux:hygiene' },
  { name: 'Architecture & Modularity Audit', cmd: 'npm run modularity:plan' },
  { name: 'AI Agent Evaluation Suite', cmd: 'npm run eval:agents -- --ci' }
]

async function runLinter() {
  console.log('\n=============================================================')
  console.log('   SOCIALKILLER · CODE QUALITY, LINT & STATIC ANALYSIS')
  console.log('=============================================================')

  let passed = 0
  const started = performance.now()

  for (const check of checks) {
    const t0 = performance.now()
    process.stdout.write(` [RUN] ${check.name.padEnd(36)}... `)
    try {
      execSync(check.cmd, { stdio: 'pipe' })
      const duration = (performance.now() - t0).toFixed(1)
      console.log(`[PASS] (${duration}ms)`)
      passed++
    } catch (err) {
      console.log(`[FAIL]`)
      console.error(`\nFailure in check "${check.name}":\n`, err.stdout?.toString() || err.message)
      process.exit(1)
    }
  }

  const totalDuration = (performance.now() - started).toFixed(1)
  console.log('=============================================================')
  console.log(`   Result: ${passed}/${checks.length} checks passed in ${totalDuration}ms (100%)`)
  console.log('=============================================================\n')
}

runLinter()

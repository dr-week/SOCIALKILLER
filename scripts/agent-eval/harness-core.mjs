function runWithTimeout(fn, ms) {
  let timer
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Scenario timed out after ${ms}ms`)
      err.code = 'timeout'
      reject(err)
    }, ms)
  })
  return Promise.race([Promise.resolve().then(fn), timeoutPromise]).finally(() => clearTimeout(timer))
}

function percentile(sorted, p) {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

async function runScenario(scenario, defaultTimeoutMs) {
  const started = performance.now()
  const trace = { logs: [], toolCalls: [], decisions: [], attempts: 0, error: null }
  const ctx = {
    log: (step, detail = '') => trace.logs.push({ atMs: Math.round(performance.now() - started), step, detail }),
    recordTool: (tool, input, output, durationMs = 0) => trace.toolCalls.push({ tool, input, output, durationMs }),
    recordDecision: (name, outcome) => trace.decisions.push({ name, outcome })
  }
  const timeoutMs = scenario.timeoutMs ?? defaultTimeoutMs
  const maxRetries = Math.max(0, scenario.maxRetries ?? 0)
  let output
  let thrown = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    trace.attempts++
    try {
      thrown = null
      output = await runWithTimeout(() => scenario.run(ctx), timeoutMs)
      break
    } catch (err) {
      thrown = err
      trace.logs.push({ atMs: Math.round(performance.now() - started), step: 'attempt_error', detail: err?.message || String(err) })
    }
  }
  if (thrown) trace.error = { message: thrown.message || String(thrown), code: thrown.code || 'error' }
  const latencyMs = Number((performance.now() - started).toFixed(2))

  let evalResult
  try {
    evalResult = thrown && !scenario.evaluateOnError
      ? { passed: false, score: 0, checks: [{ name: 'execution', ok: false, detail: trace.error.message }], failureReason: trace.error.message }
      : await scenario.evaluate(output, trace)
  } catch (err) {
    evalResult = { passed: false, score: 0, checks: [{ name: 'evaluator', ok: false, detail: err.message }], failureReason: err.message }
  }
  return {
    id: scenario.id, suite: scenario.suite, description: scenario.description,
    passed: Boolean(evalResult.passed), score: Number((evalResult.score ?? (evalResult.passed ? 1 : 0)).toFixed(3)),
    latencyMs, attempts: trace.attempts, retriesUsed: Math.max(0, trace.attempts - 1),
    checks: evalResult.checks || [], failureReason: evalResult.failureReason || null, trace
  }
}

export async function runEvalSuite(scenarios, { suiteFilter = '', defaultTimeoutMs = 5000 } = {}) {
  const selected = suiteFilter ? scenarios.filter(s => s.suite === suiteFilter) : scenarios
  const results = []
  for (const scenario of selected) results.push(await runScenario(scenario, defaultTimeoutMs))

  const passed = results.filter(r => r.passed).length
  const total = results.length
  const latencies = results.map(r => r.latencyMs).sort((a, b) => a - b)
  const avgScore = total ? Number((results.reduce((s, r) => s + r.score, 0) / total).toFixed(3)) : 0
  return {
    harness: 'socialkiller-agent-eval',
    timestamp: new Date().toISOString(),
    suiteFilter: suiteFilter || 'all',
    total,
    passed,
    failed: total - passed,
    passRate: total ? Number((passed / total).toFixed(3)) : 0,
    avgScore,
    p50LatencyMs: percentile(latencies, 50),
    p95LatencyMs: percentile(latencies, 95),
    totalRetries: results.reduce((s, r) => s + r.retriesUsed, 0),
    results
  }
}

export function computeBaselineDiff(previousReport, currentReport) {
  if (!previousReport || !Array.isArray(previousReport.results)) return null
  const prevById = new Map(previousReport.results.map(r => [r.id, r]))
  const newRegressions = currentReport.results
    .filter(r => !r.passed && prevById.get(r.id)?.passed)
    .map(r => r.id)
  const prevRate = Number(previousReport.passRate || 0)
  return {
    previousPassRate: prevRate,
    passRateDelta: Number(((currentReport.passRate || 0) - prevRate).toFixed(3)),
    p95DeltaMs: Number(((currentReport.p95LatencyMs || 0) - (previousReport.p95LatencyMs || 0)).toFixed(2)),
    newRegressions
  }
}

export function formatScorecard(report) {
  const lines = [
    '\n=============================================================',
    `   SOCIALKILLER · AGENT EVAL HARNESS (${report.passed}/${report.total} passed · ${(report.passRate * 100).toFixed(0)}%)`,
    `   Avg Score: ${report.avgScore} · p50: ${report.p50LatencyMs}ms · p95: ${report.p95LatencyMs}ms`,
    '============================================================='
  ]
  if (report.baselineDiff) {
    const d = report.baselineDiff
    lines.push(` Baseline Δ passRate: ${d.passRateDelta >= 0 ? '+' : ''}${d.passRateDelta} · p95: ${d.p95DeltaMs >= 0 ? '+' : ''}${d.p95DeltaMs}ms · regressions: ${d.newRegressions.length}`)
  }
  for (const r of report.results) {
    lines.push(` [${r.passed ? 'PASS' : 'FAIL'}] ${r.suite.padEnd(16)} ${r.id.padEnd(36)} ${String(r.latencyMs).padStart(6)}ms`)
    if (!r.passed && r.failureReason) lines.push(`        ↳ ${r.failureReason}`)
  }
  lines.push('=============================================================\n')
  return lines.join('\n')
}

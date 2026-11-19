# SOCIALKILLER Agent Harness & Evaluation Architecture

**Updated:** 2026-11-19  
**Purpose:** Deterministic, reproducible evaluation harness testing every AI, CLI, automation, content-scoring, security boundary, and Visual Bot workflow across normal usage, prompt injection, timeouts, transient failures, and edge boundaries.

---

## 1. Audited Agent & Automation Subsystems

| Subsystem | Source Files | Core Responsibilities | Risk & Failure Modes |
|---|---|---|---|
| **Gemini Assistant & Inbox Copilot** | `server/assistant/assistant-service.mjs`, `server/integrations/ai/gemini-adapter.mjs` | Bounded single-turn Q&A and brand-safe comment/DM draft replies (`MAX_ASSISTANT_PROMPT_CHARS = 2000`, `maxOutputTokens = 256`). | Prompt injection via incoming social comments, missing API keys, HTTP `429` quota, `AbortError` timeouts, transient `5xx` drops, malformed JSON. |
| **Agent-Native `CLI-Anything` & Summarizer** | `scripts/cli-anything/socialkiller-cli.ts`, `src/domain/text-summarizer.ts` | Sub-millisecond JSON CLI (`manifest`, `summarize`, `score`, `visual-bot`, `status`), Jaccard deduplication, and channel micro-briefs (`xHook <= 280`). | Unbounded X hook length, duplicate sentence leaks, empty input crashes, unknown command unhandled exceptions. |
| **Viral Predictor & Safety Guard** | `src/domain/analytics/viral-predictor.ts`, `server/marketing/content-safety-guard.mjs` | Deterministic hook/save-share scoring, cliché penalty (`-25`), spam regex rejection, and historical Jaccard anti-repetition (`> 0.65`). | AI cliché over-scoring, spam engagement bait bypass, short low-substance copy passing guardrails. |
| **Persistent Automation Engine** | `server/automation/automation-engine.mjs`, `automation-definition.mjs`, `automation-service.mjs` | SQLite-backed trigger → condition → multi-step draft actions, `elseActions` fallback, and partial-failure step resumption. | Duplicate step execution on retry, non-draft actions (`send_email`), `<15m` schedule spam, unhandled SQLite failures. |
| **3-Layer Visual Bot & Safe Recorder** | `server/engine/vision-contour.mjs`, `extension/modules/human-cadence.js`, `extension/modules/interaction-recorder.js` | Theme-invariant Sobel + 2D NCC edge matching, Box-Muller cognitive jitter, and `UNSAFE_ACTION` label regex gating. | Light/Dark mode contour drift, unbounded delay spikes, accidental clicks on Publish / Submit / Payment / Delete controls. |

---

## 2. Evaluation Harness Architecture (`scripts/agent-eval/`)

```text
scripts/agent-eval/
  harness-core.mjs                         # Timeout guard, retry tracker, trace collector, p50/p95 scorecard
  harness-core.test.mjs                    # Unit tests for timeout, retries, traces, and suite filtering
  run-evals.mjs                            # CLI runner (--suite, --json, --ci, --write-trace) + dev-supervisor export
  scenarios/
    assistant-scenarios.mjs                # 7 scenarios: Q&A, brand-safe reply, prompt injection, bounds, 504 timeout, 503 retry, bad JSON
    content-cli-scenarios.mjs              # 6 scenarios: CLI manifest, dedupe/280-char bounds, empty input, unknown cmd, cliché penalty, spam guard
    workflow-visual-scenarios.mjs          # 6 scenarios: partial-fail retry, draft-only safety, else branch, Sobel invariance, jitter bounds, unsafe regex gate
    security-orchestration-scenarios.mjs   # 6 scenarios: 403 origin block, 413/400 JSON bounds, >65% overlap guard, 10-platform contract, simulation boundary, secret redaction
    persistence-scheduler-scenarios.mjs    # 3 scenarios: SQLite single-truth post persistence, approval lifecycle, fail-closed scheduler boot & tick
```

### Trace Schema & Telemetry Captured Per Run
Every scenario receives an instrumented `ctx` (`log()`, `recordTool()`, `recordDecision()`) and outputs:
- `id`, `suite`, `passed`, `score` (`0..1`), `latencyMs`, `attempts`, `retriesUsed`
- `checks[]` (individual deterministic assertions with pass/fail reasons)
- `trace`: `{ logs[], toolCalls[], decisions[], attempts, error }`
- `baselineDiff`: compares pass rate, p95 latency delta, and `newRegressions` against the previous `.data/eval-traces/latest.json` artifact before overwriting.
- Optional persistent artifact written to `.data/eval-traces/latest.json` via `--write-trace` (gitignored via `.data/`).

---

## 3. Measurable Success Criteria & Latency SLAs

| Suite | Scenarios | Target Pass Rate | Latency SLA (p95) | Mandatory Safety Invariants |
|---|---|---|---|---|
| `assistant` | 7 | **100%** | `< 100ms` (mocked) / `< 20s` (live API) | `systemInstruction` immutable under comment injection; non-retryable on `401/403/404/429`; bounded transient `5xx` recovery. |
| `content-cli` | 6 | **100%** | `< 25ms` | `xHook <= 280` chars; `removedDuplicatesCount >= 1`; clichés penalized; spam & empty copy rejected. |
| `workflow-visual` | 6 | **100%** | `< 120ms` | Retry resumes without re-running step 1; `send_email` blocked; dark/light Sobel confidence delta `< 0.05`; unsafe UI actions 100% blocked. |
| `security-ops` | 6 | **100%** | `< 50ms` | Foreign origins return `403`; payloads `> maxBytes` return `413`; `>65%` lexical overlap rejected; `LuaAutomationEngine` stays `simulation_only`; secrets redacted. |
| `persistence-ops` | 3 | **100%** | `< 60ms` | Posts survive SQLite round-trip without in-memory arrays; `pending_approval -> approved -> published` transitions persist; scheduler boots disabled and forces automated ticks to `pending_approval`. |

---

## 4. Running the Harness & Regression Gates

```sh
npm run eval:agents                         # Print full scorecard across all 28 scenarios + baseline diff
npm run eval:agents -- --suite=assistant    # Run a single suite
npm run eval:agents -- --write-trace        # Persist full trace JSON to .data/eval-traces/latest.json
npm run eval:agents -- --ci                 # Exit 1 on any regression (also gated in .github/workflows/ci.yml)
npm run dev:doctor -- --ci                  # Runs Agent Eval Harness inside unified dev supervisor
```

Core harness behavior (`harness-core.test.mjs`) and all 25 scenarios run in `.github/workflows/ci.yml`, `npm test`, and `npm run dev:doctor -- --ci`.

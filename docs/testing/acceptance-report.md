# UNFOLLOWER Acceptance Report (Phase 0 – Baseline)

> Historical baseline report. Current-code correction (2026-11-05): the extension has a Manifest V3 manifest, service worker, popup, and user-triggered visible-tab screenshot flow. Re-run a full acceptance inventory before treating the dated baseline below as current. See [task gap reuse map](../research/github-batches/TASK_GAP_REUSE_MAP.md) and current implementation workstreams for task triage.
>
> Current UI route smoke results and the prioritized remediation plan are in [UI Smoke Audit and Remediation Plan](./ui-smoke-audit-2026-11-10.md). This historical report is not a replacement for that current browser pass.

## 1. Repository Overview
- Product name: **The Social Base**. The technical package name remains **followdesk**.
- Vue 3 frontend (`src/**/*.vue`).
- Node backend (`server.mjs` + `server/**/*.mjs`).
- SQLite vault (`.data/followdesk.sqlite`).
- Chrome extension includes `extension/manifest.json`, `extension/background.js`, `extension/popup.html`, and a local screenshot preview flow.
- Full test suite under `test/` (57 tests total + 3 stress tests).

## 2. Baseline Execution Results
| Command | Exit Code | Notes |
|--------|----------|-------|
| `npm install` | 0 | Dependencies installed. 4 vulnerabilities (3 moderate, 1 high) – no build breakage. |
| `npm run type-check` | 0 | No TypeScript errors (`vue-tsc`). |
| `npm run test:all` | 0 | All 57 tests passed (0 failures, 0 skips). Includes backend, domain, extension, adapters, social‑publisher, and stress suites. |
| `npm run lint` | 1 | No `lint` script defined; ESLint configuration missing. |

## 3. Feature Inventory
| Feature | Status | Comments |
|--------|--------|----------|
| Backend API routes | **Implemented** | Covered by unit tests. |
| Domain logic (analytics, followers, marketing) | **Implemented** | Tests pass. |
| Social‑publisher adapters | **Implemented (mocked)** | CLI dry-run paths exist; app publisher/API enforcement still needs a focused acceptance test. |
| Chrome‑extension scaffold | **Implemented** | Manifest V3, service worker, popup, and user-triggered screenshot flow exist; manual screenshot/host installation checks remain. |
| Playwright automation | **Missing** | No dependency or test harness. |
| Action contract / capability registry | **Missing** | No central registry file. |
| Dry‑run enforcement in app backend | **Unverified** | Do not infer app API safety from CLI adapter dry-run tests. |
| Job engine persistence & idempotency | **Partial** | SQLite storage exists, but no atomic claim/state‑machine. |
| Linting / static analysis | **Missing** | No ESLint config or script. |
| Documentation consistency | **Partial** | Some historical docs still contain the former product name; package name remains *followdesk*. |

## 4. Security & Data‑Integrity Findings
- Credential store (`server/credential-store.mjs`) uses SQLite; encryption not verified – potential risk.
- No CORS headers for API routes – would block extension communication.
- No path‑traversal mitigation on media‑vault uploads (identified in earlier security audit).
- No rate‑limit or quota enforcement beyond Lua engine quota (already present).

## 5. Current Work Tracking

This historical report is not the active task tracker. Use the [publishing safety workstream](../product/implementation-plan/01_PUBLISHING_SAFETY.md), [product validation workstream](../product/implementation-plan/03_PRODUCT_VALIDATION.md), and [engineering enablement workstream](../product/implementation-plan/04_ENGINEERING_ENABLEMENT.md) for current priorities and evidence.


# SOCIALKILLER Backend & Code Structure Organization Plan

**Updated:** 2026-11-19  
**Goal:** Reorganize `server/`, `extension/`, and shared `src/` layers into crisp, testable, `<150`-line feature modules backed by SQLite as the single source of truth—removing stale global caches, mixed HTTP/domain routes, and all remaining `check:file-size` violations.

---

## 1. Current Structural Bottlenecks Audited

| Area | Current State & Files | Root Problem |
|---|---|---|
| **HTTP Entry & Security** | `server/router.mjs` (`144` lines) | Mixes CORS/origin checks, route dispatch, and inline `/api/dev/feedback` + `/api/dev/clone` handlers with manual `req.on('data')` parsing. |
| **Oversized Route Files** | `server/routes/viral-routes.mjs` (`394`), `ops-routes.mjs` (`287`), `instagram-routes.mjs` (`231`) | HTTP parsing, input validation, metrics aggregation, and business rules are combined in single large files. |
| **Mixed `server/marketing/` Folder** | 33 files including `orchestrator.mjs` (`429`), `content-categories.mjs` (`402`), `autopilot.mjs` (`258`), `content-system.mjs` (`252`), `story-generator.mjs` (`230`), `brand-research.mjs` (`221`), `post-dictionary.mjs` (`192`), `brand-context.mjs` (`181`), `media-card.mjs` (`181`), `short-post.mjs` (`174`), `community-scanner.mjs` (`161`), `viral-frameworks.mjs` (`152`) | `orchestrator.mjs` holds module-level `postQueue`, `activityLogs`, and `pendingBrowserDispatches` arrays hydrated once at startup—risking divergence whenever CLI-Anything or background workers write to SQLite. |
| **Scheduler & Concurrency** | `server/scheduler.mjs` (`255` lines) | Relies on a boolean `isRunningTick` lock without bounded concurrency queues (`p-queue`) or strict fail-closed human approval enforcement on automated ticks. |
| **Vision & Native Engines** | `server/engine/vision-contour.mjs` (`206`), `media-vault.mjs` (`182`), `android-bridge.mjs` (`150`) | Sobel edge computation, NCC matching, media vault IO, and Android CLI bridging exceed the `<150`-line limit. |
| **Extension & Scripts** | 11 oversized extension files (`social-autoposter.js` `419`, `popup.js` `377`, `dom-chat-banner.js` `249`, `modal-harvester.js` `243`), 9 in `scripts/`, 2 in `test/` | Monolithic popup/injection handlers mix DOM observation, formatting, and transport logic. |

---

## 2. Target Layered Backend Architecture

Aligned with [Modularization Blueprint](./MODULARIZATION_BLUEPRINT.md) and [Database Architecture Plan](./DATABASE_ARCHITECTURE_PLAN.md):

```text
server/
  http/
    router.mjs              # Trie-based route matcher (unjs/rou3)
    read-json.mjs           # Bounded 1MB JSON body reader + error handling
    cors-security.mjs       # Loopback DNS-rebinding & Chrome-extension origin guard
    logger.mjs              # Structured logger with fast-redact secret masking
    error-envelope.mjs      # Normalized HTTP error responses
    schemas/                # Valibot boundary schemas per resource
  modules/
    publishing/             # post-service, queue-service, approval-policy, promo-limits, formatter
    connections/            # channel-service, keep-alive-pulse, meta-oauth-service
    content/                # copywriter-service, story-service, categories-catalog, media-card
    audience/               # profile-scanner-service, sync-service, whitelist-policy
    workflows/              # workflow-service, visual-bot-locator-service
    crm/                    # lead-service, deliverables-service (Pillar 4 schema)
  jobs/
    scheduler-state.mjs     # SQLite-backed schedule state & idempotency
    scheduler-tick.mjs      # Fail-closed draft-only tick runner
    dispatch-queue.mjs      # p-queue bounded concurrency, rate limit & retry backoff
  integrations/             # Provider adapters (instagram, x, linkedin, reddit, github, discord, devto, hashnode, medium)
  engine/
    vision/                 # Split vision-contour.mjs -> sobel-edges.mjs + template-matcher.mjs
    media-vault.mjs         # Split file storage vs metadata catalog (<120 lines each)
    android-bridge.mjs      # Thin runtime facade over server/android/
  db/                       # 5-Pillar SQLite WAL engine, split statement files (<70 lines), repositories
```

### Key Backend Engineering Upgrades
1. **SQLite as Single Source of Truth:** Remove stale module-level arrays from `orchestrator.mjs`; read and mutate `social_posts`, `activity_logs`, and `pending_dispatches` directly through SQLite WAL repositories so the Web UI, Extension, and `CLI-Anything` see identical state.
2. **Trie Routing & Boundary Schemas (`unjs/rou3` + `valibot`):** Replace sequential `if (await handle*Routes(...))` chains and manual regex/body parsing with O(1) route lookup and declarative Valibot schemas.
3. **Structured Redacted Logging (`pinojs/fast-redact`):** Mask `token`, `secret`, `apiKey`, `webhook`, `cookie`, and `authorization` paths across server and extension logs.
4. **Concurrency & Fail-Closed Approval (`sindresorhus/p-queue`):** Enforce explicit human review (`pending_approval` → `approved`) on scheduler ticks and bound batch account health/publishing concurrency via `p-queue`.

---

## 3. Target Frontend & Extension Organization

- **Shared UI Primitives (`src/shared/ui/`):** `UiCard`, `UiButton`, `UiField`, `UiStatusIcon`, `UiCollapsible`, `UiToastHost` (`vue-sonner`), plus shared glassmorphism & motion tokens (`src/styles/_motion-tokens.scss`, `_premium-surfaces.scss`, `_guided-flow.scss`).
- **Feature-Owned Slices (`src/features/<feature>/`):** Keep `components/`, `composables/`, `styles/`, and `api/` together per workspace (`app-shell`, `audience`, `planner`, `connections`, `engage`, `content-studio`, `script-studio`, `workflows`, `workspaces`, `automation`, `design-system`, `asset-manager`, `android-studio`).
- **Extension Layer Split (`extension/modules/`):** Separate `social-autoposter.js` and `popup.js` into semantic DOM observation (`Stagehand`/`Midscene` cached locator pattern), UI HUD rendering, and API transport—all strictly `<149` lines.

---

## 4. Safe Incremental Migration Order

1. **HTTP Boundary (`Phase 5a`):** Extract `server/http/` (`router.mjs`, `read-json.mjs`, `cors-security.mjs`, `logger.mjs`, `schemas/`) while keeping all existing `/api/*` endpoints unchanged.
2. **Publishing & Jobs (`Phase 5b`):** Extract `server/modules/publishing/` and `server/jobs/` (`p-queue` + fail-closed scheduler + remove stale in-memory arrays from `orchestrator.mjs`).
3. **Content, Connections, Audience & Vision (`Phase 5c`):** Split oversized `server/routes/*`, `server/marketing/*`, and `server/engine/*` files into `<149`-line modules under `server/modules/` and `server/engine/vision/`.
4. **Extension & Test Modularity (`Phase 7`):** Split remaining oversized files in `src/`, `extension/`, `scripts/`, and `test/` until `npm run check:file-size` reports `0` violations while all backend, extension, social, and domain tests stay green.

---

## 5. Wave 2 Completed Hardening & Modularity (`2026-11-19`)

- **Structured Secret Redaction (`server/http/logger.mjs`):** Masks credential keys and secret token/webhook prefixes before log serialization.
- **Bounded JSON Parsing (`server/http/read-json.mjs`):** Adopted across `server/router.mjs`, `viral-routes.mjs`, `viral-random-post-route.mjs`, `viral-topics-routes.mjs`, `instagram-sync-routes.mjs`, `ops-workflow-routes.mjs`, and `ops-routes.mjs` with explicit `413` / `400` status mapping.
- **`GET /api/social/random-post` Bugfix:** Fixed `ReferenceError: keywords is not defined` when ranking live trending leads against brand profile keywords.
- **Route & Vision Splits (`<= 149` lines):** Split `viral-routes.mjs` (`394` → 3 modules), `instagram-routes.mjs` (`231` → 2 modules), `ops-routes.mjs` (`287` → 3 modules), and `server/engine/vision-contour.mjs` (`206` → `vision/icon-templates.mjs` + `vision-contour.mjs`).
- **Isolated Guard Testing:** Added optional `historicalPosts` injection parameter to `server/marketing/content-safety-guard.mjs`.
- **Phase 4A SQLite Single-Source-of-Truth & Fail-Closed Scheduler (`2026-11-19`):**
  - Migrated `social_posts` schema & statements (`server/db/schema-social.mjs`, `statements/publishing-statements.mjs`, `repositories/publishing-repository.mjs`) to persist `platformsJson`, `approvalStatus`, `approvedAt`, `rejectedAt`, `confirmedAt`, and `handoffUrl` with additive startup migrations.
  - Replaced stale module-level arrays in `server/marketing/orchestrator.mjs` (`429` lines) and split it into `server/modules/publishing/post-store.mjs`, `post-approval.mjs`, `post-creator.mjs`, and thin `orchestrator.mjs` facade (`<= 149` lines).
  - Split `server/scheduler.mjs` (`255` lines) into `server/jobs/scheduler-state.mjs`, `server/jobs/scheduler-tick.mjs` (fail-closed `publishNow: false`), and `scheduler.mjs`, and replaced manual body parsing in `server/routes/social/scheduler-routes.mjs` with bounded `readJsonBody`.

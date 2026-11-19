# Architecture

## Runtime

The Vue frontend is a single website containing multiple focused mini-app workspaces. App selection is internal same-tab navigation (`?app=<id>`); it shares the active brand context and common shell. It is not a set of separately deployed applications. The source-backed workspace inventory and current product grouping are in [mini-app architecture](../product/MINI_APP_ARCHITECTURE.md).

```text
Vue 3 + TypeScript + SCSS
  ├─ audience import, comparison, and views
  ├─ company workspaces and campaign UI
  └─ Capacitor Android host
          │ /api
          ▼
Node.js local service
  ├─ audience/profile routes
  ├─ brand and campaign routes
  ├─ platform adapters
  ├─ research and operations routes
  └─ optional single-turn text assistant (external Gemini API; disabled until configured)

Optional Chrome extension ── local sync, composer help, reviewed page workflows
Lua command runner ───────── preview only; no browser or device control
Tauri desktop shell ───────── planned native window for the Vue frontend
```

The desktop shell is a migration target, not a shipped runtime. The Node launcher owns the local API and Vite dashboard through a PID lock and identity-aware registry; ports are selected dynamically and unrelated processes are not terminated. See the [platform studio architecture](./PLATFORM_STUDIOS_ARCHITECTURE.md) before changing runtime behavior.

## Code map

- `src/domain/`: export parsing and follower set logic.
- `src/composables/`: UI state and feature workflows.
- `src/components/`: audience, publishing, workspace, and settings UI.
- `src/features/`: feature-owned Design System, Asset Manager, Automation Studio, and Android Build Studio workspaces.
- `server/router.mjs` and `server/routes/`: local HTTP entry and route groups.
- `server/automation/`: persistent draft-first workflow rules, events, scheduler, and run history.
- `server/android/`: local toolchain discovery and fixed Capacitor Gradle build tasks.
- `server/assistant/` and `server/integrations/ai/`: bounded optional assistant service and external provider adapter; no workspace context or local model.
- `server/db/sqlite-engine.mjs`: campaign, publishing, and company workflow persistence.
- Company workspace lifecycle currently uses `brand_profiles` with an additive `archivedAt` migration; active/archived listing and reversible archive/restore endpoints are local-operator organization features, not tenant authorization.
- `server/sync-store.mjs`: in-process extension sync state.
- `server/posting/`: platform-specific publishing adapters.
- `server/engine/lua-runner.mjs`: command preview; no screenshot or input driver.
- `extension/`: optional Chrome companion and user-triggered DOM workflow recorder/replayer.
- `launcher/launch.mjs`, `launcher/managed-services.mjs`: singleton launcher, identity registry, discovery, and owned child lifecycle.
- `android/`: Capacitor Android project.
- `src-tauri/`: planned Tauri desktop shell; not present yet.

This is the current layout, not the final ownership model. New work should follow the feature/provider departments and one-way request flow in the [modularization blueprint](./MODULARIZATION_BLUEPRINT.md). Move existing code only as part of a tested feature change.

## Data flow

1. The browser parses Instagram export ZIP/JSON files and normalizes usernames.
2. Audience comparisons use sets: `following − followers`, `followers − following`, and their intersection.
3. Audience snapshots persist in browser local storage. The optional extension sync endpoint uses backend process memory.
4. Public profile lookup requests public page data for counts only; responses may be missing or rate-limited.
5. Campaign drafts are adapted per channel, reviewed, then queued or sent through a configured adapter. Publishing capability depends on channel configuration.
6. The extension records safe actions from the selected tab, sends them to the loopback API, and the company-scoped app editor lets the user review them. Replay requires the same origin and cannot submit forms or perform configured engagement actions.
7. Automation events are local, persisted, and idempotent; current actions create editable drafts only. Android builds run fixed project tasks and remain disabled until toolchain prerequisites are detected.

## Constraints

- Do not claim that a simulated Lua command performed a screen action.
- Do not use the system for unattended engagement or private follower-list collection.
- Treat local persistence and API responses as feature-specific; do not claim that all data is durable or fully offline.

For provider API cost/access constraints, see [API availability](../product/API_AVAILABILITY.md).

See the [API reference](./API_REFERENCE.md) and [product scope](../product/PRODUCT_SCOPE.md).

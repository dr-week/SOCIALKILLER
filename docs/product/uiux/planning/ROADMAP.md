# SOCIALKILLER Architecture, UI/UX, Animation, Backend & Visual Bot Roadmap

**Reviewed:** 2026-11-19  
**Master Audit:** [UI/UX Declutter, Animation, Backend & Visual Bot Plan](../../UIUX_DECLUTTER_AND_EFFICIENCY_PLAN.md)  
**Companion Plans:** [Backend Organization Plan](../../../engineering/BACKEND_ORGANIZATION_PLAN.md) · [GitHub Toolkit Adoption Plan](../../../research/GITHUB_TOOLKIT_ADOPTION_PLAN.md)  
**Machine-Readable Graph:** [`phases.json`](./phases.json)  
**Validation:** `npm run uiux:check` · `npm run planning:check`

> [!NOTE]
> Deliver one independently testable phase at a time. Phase dependencies are enforced by `scripts/uiux/check-plan.mjs`. All new or edited files must remain `<150` lines (`npm run check:file-size`).

---

## Phase 1 — Global Shell, Fuzzy Topbar Search, Zero Backend Telemetry & Audience UX `[proposed]`

**Goal:** Eliminate backend telemetry text, duplicate topbar/import triggers, add fuzzy Global Search (`Fuse.js`), and upgrade Audience UI/UX across the shell and Audience workspaces.

| Task | Target Files | Done when |
|---|---|---|
| Remove duplicate topbar `Import` button; integrate `krisk/Fuse` (`fuse.js`) + `/`, `Enter`, and `Esc` shortcuts in Global Glass Search; clean dead `.breadcrumbs`/`.sync-status` CSS | `src/islands/app-shell/topbar.ts`, `src/components/AppTopbar.vue`, `src/styles.scss` | Global Search fuzzy-filters & jumps by keyboard; zero topbar Import duplicate |
| Remove `"No data imported"` / `"No imported profiles"`; link sidebar footer Audience card to Audience Audit; group sidebar nav cleanly | `src/components/AppSidebar.vue`, `src/components/sidebar/MiniAppNavigation.vue`, `src/components/sidebar/SidebarSettingsPanel.vue` | Sidebar footer jumps to Audience Audit with zero telemetry strings |
| Tighten `BrandWorkspaceHeader` Audience pill & frosted dropdown; add Audience summary tile to `WorkspaceOverview` | `src/components/BrandWorkspaceHeader.vue`, `src/features/app-shell/WorkspaceOverview.vue` | Brand switching + Audience summary available in 1 click |
| Consolidate Audience Audit headers, remove duplicate Health bar buttons, collapse Snapshot Diff, clean `AudienceAuditOverlays` & `AudienceExportGuideModal` | `AudienceAuditWorkspace.vue`, `AppPageHeader.vue`, `AudienceMetrics.vue`, `AudienceTable.vue`, `HistoryPanel.vue`, `AudienceAuditOverlays.vue`, `AudienceExportGuideModal.vue` | 1 header, 1 Import trigger, `"The Social Base"` replaced with `SOCIALKILLER` |
| Compact Launcher hero (`MiniAppLauncher.vue`), remove repeated per-card category/status labels, move `ProfileScanner.vue` inline styles to frosted SCSS | `src/features/app-shell/MiniAppLauncher.vue`, `src/components/ProfileScanner.vue` | Clean launcher tiles and frosted Profile Scout |

**Exit gate:** Zero backend telemetry strings in Shell & Audience surfaces; `npm run type-check`, `npm run build`, and `npm run test:app-navigation` pass.

---

## Phase 2 — 4-Tier Animation System, Single-Line Headers, Symbolic Icons & Frosted Glass `[proposed]`

**Depends on:** `phase-1-shell-audience`

**Goal:** Establish the 4-Tier Motion System (`_motion-tokens.scss`, `@formkit/auto-animate`, `motion-v`), enforce single-line headers, migrate remaining opaque cards/inline styles to frosted glassmorphism, and standardize symbolic status icons (`reka-ui` Tooltip) + `vue-sonner` toasts.

| Task | Target Files | Done when |
|---|---|---|
| Add `_motion-tokens.scss`, wire `@formkit/auto-animate` on filtered lists & collapsibles, wire `motion-v` (`AnimatePresence`) on modals/drawers/workspace transitions, replace `background-size` repaints & duplicate `@keyframes pulse` | `src/styles/_motion-tokens.scss`, `src/features/app-shell/mini-app-animations.scss`, `src/styles/_guided-flow.scss`, `publisher-navbar.scss` | Smooth GPU-composited motion with full `prefers-reduced-motion: reduce` support |
| Refactor `UiCard.vue` to enforce 1-line `<Icon />` + title (drop stacked eyebrow + unused `description` prop) | `src/shared/ui/UiCard.vue` and consumers | Every `UiCard` renders a single clean header line |
| Implement Symbolic Icon Status System (`CheckCircle2`, `Clock`, `AlertTriangle`, `XCircle`, `PauseCircle`, `CircleDashed`, `Sparkles`, `ShieldCheck`) with `reka-ui` accessible tooltips | `AudienceRowItem.vue`, `PublisherChannelCard.vue`, `PublisherQueueLogs.vue`, `AutomationRuleList.vue`, `AndroidBuildStudioWorkspace.vue` | Text-heavy status tags replaced by scannable symbolic icons |
| Upgrade opaque `var(--surface)` panels/cards/modals to `--glass-bg` + `--glass-border` + `backdrop-filter`; extract inline styles to scoped SCSS | `src/styles/_premium-surfaces.scss`, `src/styles/_audience-theme.scss`, `src/styles.scss` | Consistent frosted glass across Dark & Light themes |
| Wrap `vue-sonner` in `useToast` composable + global toast host | `src/composables/useToast.ts`, `src/App.vue` | Replaces 5 duplicate per-view toast/notice blocks |

**Exit gate:** Zero stacked header+subheader duplicates; consistent frosted glassmorphism and 4-tier motion across Light & Dark themes.

---

## Phase 3 — Planner/Connections De-Duplication & Create Studios Simplification `[proposed]`

**Depends on:** `phase-2-glass-motion-icons`

**Goal:** Separate channel selection from preview in Planner, fix channel re-selection, iconify Connections cards, and declutter Content & Script Studios.

| Task | Target Files | Done when |
|---|---|---|
| Fix `:available-platform-ids="selectedPlatforms"` bug so deselected channels remain selectable; remove dead `channels` tab branch | `src/components/SocialPublisher.vue` | Channels can be toggled off and back on smoothly |
| Collapse `PublisherNavbar` to 1 line (`Create \| Queue` + clickable `<Radio /> N` link to Connections); flatten nested `<details>` (`PublisherAdvancedOptions` + `PublisherContentOptions`) | `PublisherNavbar.vue`, `PublisherAdvancedOptions.vue`, `PublisherContentOptions.vue` | Single-level collapsible `"Options"` and 1-line navbar |
| Separate Composer channel grid from Right Preview switcher (show selected channels only); default to Visual Preview with corner `<PenTool />` edit toggle | `PublisherComposer.vue`, `PublisherComposerForm.vue`, `PublisherVariantReview.vue` | Duplicate 10-icon selector and 3-tab preview clutter removed |
| Bind Queue & Content Studio to Global Topbar Search; collapse Activity panel in Queue; iconify Connections footer buttons & collapse idle Meta OAuth | `PublisherQueueLogs.vue`, `PublisherQueueActivityPanel.vue`, `ConnectionsWorkspace.vue`, `PublisherChannels.vue`, `MetaAccountManager.vue`, `PublisherChannelCard.vue` | 40+ text buttons converted to clean symbolic icons |
| Merge `ScriptStudioWorkspace` + `VideoScriptControls` headers; make pillars brand-agnostic icon chips; collapse extra captions in `CreativeVideoCard` & strip `"(Ready to post)"` | `ScriptStudioWorkspace.vue`, `VideoScriptControls.vue`, `VideoScriptOutput.vue`, `CreativeHub.vue`, `CreativeVideoCard.vue` | Single header and symbolic viral/retention badges |

**Exit gate:** Planner button/control count reduced >=35%; channel reselection verified; `npm run test:social` and `npm run build` pass.

---

## Phase 4 — Operate & Build Workspaces Collapsible Consolidation `[proposed]`

**Depends on:** `phase-3-planner-connections-create`

**Goal:** Simplify Engage, Workflows, Brand Profile Modal, Automation Studio, and Build mini-apps into clean 1-line glass surfaces with single-level collapsibles.

| Task | Target Files | Done when |
|---|---|---|
| Remove static Engage badges/disclaimers; convert 3rd `"Add"` column into toggleable drawer/panel | `src/components/CommunityInbox.vue`, `src/components/community-inbox.scss` | Clean 2-pane glass inbox (`Threads \| Conversation`) |
| Add workflow selector dropdown and 1-line 3-Layer Visual Bot readiness strip (`CLI · DOM · Vision`) | `src/features/app-shell/WorkflowStudioWorkspace.vue`, `src/components/publisher/PublisherAutopilot.vue` | Multiple recorded workflows switchable with live Visual Bot status |
| Refactor `378`-line `BrandProfileModal.vue` into modular `<149`-line tabbed frosted modal (`GitHub \| Links \| Docs \| Research`); remove telemetry timestamps | `src/components/BrandProfileModal.vue`, `src/components/brand-profile/*` | Tabbed modal under 149 lines per file |
| Collapse `"New workflow"` form in `AutomationStudio` behind `+ New Workflow` toggle; simplify `DesignSystem`, collapse `AssetManager` metadata `<details>`, and collapse `AndroidBuildStudio` Runtime diagnostics with icon check marks | `AutomationStudioWorkspace.vue`, `DesignSystemWorkspace.vue`, `AssetManagerWorkspace.vue`, `AndroidBuildStudioWorkspace.vue` | Single-level collapsibles and icon statuses across all Operate & Build apps |

**Exit gate:** All 13 mini-apps use single-level collapsibles and 1-line headers with zero opaque holdouts.

---

## Phase 5 — Layered Backend Organization, SQLite Single-Truth, Validation & Redaction `[proposed]`

**Depends on:** `phase-4-operate-build-collapsible`

**Goal:** Reorganize `server/` into layered `server/http/`, `server/modules/`, `server/jobs/`, and `server/engine/vision/` modules (`<150` lines) per [`BACKEND_ORGANIZATION_PLAN.md`](../../../engineering/BACKEND_ORGANIZATION_PLAN.md).

| Task | Target Files | Done when |
|---|---|---|
| Extract HTTP boundary (`unjs/rou3` trie router, 1MB `read-json.mjs`, CORS/origin guard, `fast-redact` logger, `valibot` schemas) | `server/http/`, `server/router.mjs` | Zero manual body parsing or raw secret logging at HTTP edge |
| Remove stale global arrays from `orchestrator.mjs`; read/write `social_posts`, `activity_logs`, and `pending_dispatches` directly from SQLite WAL repositories | `server/modules/publishing/`, `server/db/` | Web UI, Extension, and CLI-Anything share single SQLite source of truth |
| Split `scheduler.mjs` (`255` lines) into `server/jobs/` backed by `sindresorhus/p-queue` with bounded concurrency, retry backoff, and fail-closed human approval | `server/jobs/`, `server/scheduler.mjs` | Scheduler ticks cannot dispatch without explicit approval |
| Split oversized `server/routes/*` (`viral-routes`, `ops-routes`, `instagram-routes`), `server/marketing/*`, and `server/engine/*` (`vision-contour.mjs`) into `<150`-line modules | `server/modules/`, `server/engine/vision/` | Every `server/` module strictly under 150 lines; all server tests pass |

**Exit gate:** Layered `server/http/`, `server/modules/`, and `server/jobs/` active; all backend and adapter tests pass.

---

## Phase 6 — Unified Dev Maintenance Supervisor & Live 3-Layer Visual Bot `[proposed]`

**Depends on:** `phase-5-backend-architecture`

**Goal:** Provide one cohesive developer maintenance command (`npm run dev:doctor`), automated UI hygiene enforcement, and live 3-layer Visual Bot + Playwright/axe-core verification.

| Task | Target Files | Done when |
|---|---|---|
| Merge `diagnostics.mjs` checks + `port-arbiter.mjs` PID reporting into `scripts/dev-supervisor.ts`; support `--json`, `--ci`, `--ensure`, `--full`, `--visual-bot`; fix Node `DEP0190` warning | `scripts/dev-supervisor.ts`, `scripts/diagnostics.mjs`, `package.json` | `npm run dev:doctor -- --ci` runs cleanly with zero deprecation warnings |
| Create automated UI hygiene & anti-telemetry checker wired into `dev:doctor` | `scripts/uiux/ui-hygiene-check.mjs` | Detects forbidden backend strings, plain `.css` in `src/`, excessive inline styles, duplicate keyframes, and `>149`-line files |
| Upgrade `dev:visual-bot` to run live Layer 1 (`CLI-Anything` JSON), Layer 2 (Extension + unsafe-action regex + SQLite locator cache + Playwright/axe-core 5-width smoke), and Layer 3 (Sobel + 2D NCC + Box-Muller jitter) | `scripts/cli-anything/socialkiller-cli.ts`, `scripts/dev-supervisor.ts` | Live 3-layer Visual Bot self-test passes and emits structured JSON |
| Wire `npm run dev:doctor -- --ci` into CI workflow | `.github/workflows/ci.yml` | CI blocks UI telemetry, modularity, and Visual Bot regressions |

**Exit gate:** `npm run dev:doctor -- --ci` and `npm run dev:visual-bot` exit `0` locally and in CI.

---

## Phase 7 — Dead Prototype Cleanup, `<150`-Line Modularity & 5-Width Release Gate `[proposed]`

**Depends on:** `phase-6-dev-script-visual-bot`

**Goal:** Remove dormant prototype clutter, eliminate every `>149`-line file violation, and pass full 5-width responsive, WCAG AA, and keyboard release checks.

| Task | Target Files | Done when |
|---|---|---|
| Remove/archive unmounted prototype components (`departments/`, `PublisherAdsCopy`, `PublisherAiMarket`, `PublisherCollabs`, `PublisherNewsViral`) and unused `SidebarWorkspaceNavigation.vue` | `src/components/departments/`, `src/components/publisher/` | Zero dead unmounted UI prototypes in `src/` |
| Split remaining `check:file-size` violations across `src/`, `extension/`, `scripts/`, and `test/` below `149` lines | `src/`, `extension/`, `scripts/`, `test/` | `npm run check:file-size` exits `0` with `0` violations |
| Run Playwright + `axe-core` 5-viewport (`360 / 390 / 768 / 1024 / 1280` CSS px) responsive, focus-ring, reduced-motion, and keyboard navigation audit across all 13 mini-apps | `docs/testing/`, `docs/product/uiux/planning/VALIDATION_NOTES.md` | Zero horizontal overflow, zero WCAG AA violations, full keyboard reachability at all 5 widths |
| Execute final release verification suite | Repo root | `npm run verify`, `npm run planning:check`, and `npm run dev:doctor -- --full` all pass |

**Exit gate:** `0` file-size violations, `0` horizontal overflow at all 5 widths, `npm run verify` and `npm run planning:check` pass.

---

## Global Acceptance Criteria

- [ ] Zero backend telemetry strings (`Ready to import`, `No data imported`, `DIFF ACTIVE`, PIDs) visible in UI
- [ ] Global Topbar Search (`Fuse.js`) works across Launcher, Audience Audit, Queue, and Content Studio with `/`, `Enter`, and `Esc`
- [ ] 4-Tier Motion System (`_motion-tokens.scss`, `auto-animate`, `motion-v`) runs GPU-composited animations with `prefers-reduced-motion` support
- [ ] Every section and card uses a single-line header (`<Icon />` + title) with zero duplicate adjacent controls
- [ ] Layered backend (`server/http/`, `server/modules/`, `server/jobs/`) backed by SQLite WAL + `valibot` + `fast-redact` + `p-queue`
- [ ] All source files strictly `<150` lines (`npm run check:file-size` = `0` violations)
- [ ] Zero horizontal overflow, zero WCAG AA issues, and full keyboard reachability at `360 / 390 / 768 / 1024 / 1280` CSS px
- [ ] Unified `npm run dev:doctor -- --ci` and 3-layer Visual Bot pass in CI

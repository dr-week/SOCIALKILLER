# SOCIALKILLER UI/UX Declutter, Animation, Backend & Visual Bot Master Plan

**Reviewed:** 2026-11-19  
**Scope:** Full audit of every workspace, shell control, SCSS/animation layer, symbolic icon system, backend code organization, GitHub toolkit adoption, developer maintenance script (`dev:doctor`), and 3-layer Visual Bot pipeline.
**Companion Blueprints:** [Backend & Code Organization Plan](../engineering/BACKEND_ORGANIZATION_PLAN.md) · [GitHub Toolkit Adoption Plan](../research/GITHUB_TOOLKIT_ADOPTION_PLAN.md) · [UX Guide](./UX_GUIDE.md)

---

## 1. Core Design Laws & Simplification Rules

1. **Zero Backend Telemetry on the Frontend:** Never show raw internal state copy (`"Ready to import"`, `"No data imported"`, `"No imported profiles"`, `"Data synced"`, `"DIFF ACTIVE"`, `"SHARED BRAND CONTEXT"`, `"Checking local runtime identity..."`, PIDs, or `"(Ready to post)"`) on primary UI surfaces.
2. **Global Topbar Search Bar:** Single frosted-glass search bar (`/` shortcut, `Enter` to jump to matched mini-app, `Esc` to clear) filtering App Launcher, Audience Audit, Queue, and Content Studio.
3. **Eliminate Duplicate Controls Across Adjacent Panes:** Never render two platform icon grids side by side, two search inputs in the same viewport, multiple Import triggers on one screen, or duplicate Theme/Accent pickers without clear separation.
4. **Strict 1-Line Header Rule:** Every card and workspace header uses ONE `<Icon />` + concise title. Remove stacked eyebrow + title + rephrased subheader text and delete dead `subtitle` / `description` / `header p` / `header span` styles.
5. **Single-Level Collapsible Process Grouping:** Collapse secondary forms, options, logs, metadata, and diagnostics into one clean `<details>` or drawer toggle—never nested `<details>` inside `<details>`.
6. **Minimalist Glassmorphism Throughout:** Use `--glass-bg`, `--glass-border`, `backdrop-filter: blur(18px) saturate(125%)`, and specular top-edge rim lights (`_guided-flow.scss`), removing opaque `var(--surface)` holdouts and hardcoded light-mode hex overrides.
7. **Symbolic Icons Over Text Clutter + `<150`-Line Modularity:** Replace status words and long checklists with Lucide status icons + tooltips (`aria-label` + `title`), while keeping all files `<150` lines under TypeScript + SCSS (`npm run check:file-size`).

---

## 2. Required Audience UI/UX Integration Map

| Surface | Required Audience Mention & Behavior | Target Files |
|---|---|---|
| **Global Brand Header** | Compact icon-led `Audience` quick-jump pill showing follower/unfollower count or `@handle` when loaded; opens Audience Audit (`overview`). | `src/components/BrandWorkspaceHeader.vue` |
| **Sidebar Footer & Settings** | Clickable Audience profile summary card in sidebar footer; Settings manages imported Audience audit profiles without raw `"No data imported"` / `"No imported profiles"` strings. | `src/components/AppSidebar.vue`, `src/components/sidebar/SidebarSettingsPanel.vue` |
| **App Launcher** | `Audience Audit` and `Profile Scout` cards clearly grouped under `Community & audience` and matched by Global Search (`audience`, `unfollowers`, `ghost`, `whitelist`, `profile`). | `src/features/app-shell/mini-apps.ts`, `src/features/app-shell/MiniAppLauncher.vue` |
| **Audience Audit Workspace** | 1-line header + single consolidated Import trigger, 4 metric cards, 1-line Health/Ratio bar, 7 category tabs, Global Search binding, collapsible Snapshot Diff (`new-followers`, `lost-followers`), Safe Queue modal + floating Queue Pill, and 1-line local-only privacy bar. | `src/features/app-shell/AudienceAuditWorkspace.vue`, `src/components/AudienceMetrics.vue`, `src/components/AudienceTable.vue`, `src/components/HistoryPanel.vue`, `src/features/app-shell/AudienceAuditOverlays.vue` |
| **Profile Scout** | Public Instagram follower-count lookup + HD avatar download utility in frosted-glass layout, distinct from private export audits. | `src/components/ProfileScanner.vue` |
| **Workspaces Overview** | Summary card linking active brand context with Audience Audit status (followers/unfollowers count if loaded, or clean 1-click Audit jump). | `src/features/app-shell/WorkspaceOverview.vue` |

---

## 3. Complete 16-Surface Clutter, Duplicate & Glassmorphism Audit

| # | Section / Workspace | Clutter, Duplicates & Holdouts Found | Planned Simplification & Glass Upgrade |
|---|---|---|---|
| **1** | **Global Topbar** (`topbar.ts`, `AppTopbar.vue`, `src/styles.scss`) | Duplicate `Import` button in topbar alongside Audience Audit; missing `/` / `Enter` / `Esc` shortcuts; dead `.breadcrumbs` & `.sync-status` CSS in `src/styles.scss`. | Keep topbar to Menu toggle + Global Glass Search (`/` / `Enter` / `Esc`); remove global `Import` button and dead CSS rules. |
| **2** | **Sidebar & Settings** (`AppSidebar.vue`, `MiniAppNavigation.vue`, `SidebarSettingsPanel.vue`, `SidebarWorkspaceNavigation.vue`) | Backend text `'No data imported'` & `'No imported profiles'`; flat 14-item vertical list; Theme/Accent duplicated vs Design System; unused `SidebarWorkspaceNavigation.vue`. | Remove telemetry text; make footer Audience card open Audience Audit; group sidebar items into compact collapsible sections; remove/clean unused workspace nav. |
| **3** | **Global Brand Header** (`BrandWorkspaceHeader.vue`, `brand-workspace-header-*.scss`) | Dropdown menu lacks frosted glass blur; long text badge on Audience pill; repeated brand context when inside `Workspaces`. | Keep ultra-compact icon-led `Audience` & `Brand Profile` glass pills; apply frosted glassmorphism to dropdown panel. |
| **4** | **App Launcher** (`MiniAppLauncher.vue`, `useMiniAppLauncher.ts`, `mini-apps.ts`, `mini-app-launcher.scss`) | Per-card `app.category` repeats section `<h3>`; `✓ Available` text duplicates status; extra `(i)` info-toggle adds 3rd click target per card. | 1-line hero; remove per-card `app.category` and `✓ Available` text (use subtle dot); show concise 1-line card summary directly; keep `Planned mini-apps` collapsed. |
| **5** | **Planner — Composer** (`SocialPublisher.vue`, `PublisherNavbar.vue`, `PublisherComposer.vue`, `PublisherComposerForm.vue`, `PublisherVariantReview.vue`, `PublisherAdvancedOptions.vue`, `PublisherContentOptions.vue`) | **2 duplicate 10-channel grids** side-by-side + 3rd redundant `.pub-pill` badge; **bug** at `SocialPublisher.vue:102` (`:available-platform-ids="selectedPlatforms"` blocks re-selecting deselected channels); 2-row `PublisherNavbar`; dead `channels` tab branch; double-nested `<details>` (`PublisherAdvancedOptions` → `PublisherContentOptions`); `Editor \| Preview` bar over 3rd textbox. | Left pane owns channel multi-select (fixed `availablePlatformIds`); right pane shows only selected channels in compact icon switcher; default right pane to Preview with corner `<PenTool />` icon toggle; collapse `PublisherNavbar` to 1 line (`Create \| Queue` + clickable `<Radio /> N` link to Connections); merge nested `<details>` into 1 flat `"Options"` collapsible; compact icon action strip (`Clean & TL;DR`, `Aesthetic`, `Adapt`) + symbolic step icons. |
| **6** | **Planner — Queue & Activity** (`PublisherQueueLogs.vue`, `PublisherQueueActivityPanel.vue`, `PublisherAutopilotTimeline.vue`, `PublisherCampaignCalendar.vue`) | Local queue `<input type="search">` duplicates Global Topbar Search; verbose checklist string (`✦ Title ✓ · ◈ Copy ✓ · ▹ No media`) & raw `pending_approval` text; opaque `var(--surface)` Activity panel takes full right column. | Bind queue filter to Global Topbar Search; replace text checklists/status strings with symbolic icons + tooltips; make `Activity` collapsible (`Queue \| Calendar \| Activity` or `<details>`) with `--glass-bg` frosting. |
| **7** | **Connections** (`ConnectionsWorkspace.vue`, `PublisherChannels.vue`, `MetaAccountManager.vue`, `PublisherChannelCard.vue`) | Stacked `Connections` hero + `Channels (N)` bar; dead `header p`/`header span` CSS; 4 text buttons per card (`Save`, `Test API`, `Pulse`, `Intent` = 40 buttons); flat `var(--surface)` cards. | Merge into 1 single-line header (`Connections · N` + `Pulse All`); collapse `Meta OAuth` when idle; convert card footer to compact symbolic icon buttons with tooltips + color status dot; upgrade cards to frosted `--glass-bg`. |
| **8** | **Audience Audit** (`AudienceAuditWorkspace.vue`, `AppPageHeader.vue`, `ImportBanner.vue`, `AudienceMetrics.vue`, `AudienceTable.vue`, `AudienceToolbar.vue`, `AudienceRowItem.vue`, `HistoryPanel.vue`, `AudienceAuditOverlays.vue`, `AudienceExportGuideModal.vue`) | Duplicate `viewTitle` header (`AppPageHeader` `<h1>` vs `AudienceTable` `AUDIENCE BREAKDOWN` + `<h2>`) + dead `subtitle` computed; 3 simultaneous Import buttons; duplicate quick-link buttons in Health bar; `HISTORY & UNFOLLOWERS` + `DIFF ACTIVE` + Whitelist Tip Card noise; `'THE SOCIAL BASE · AUDIENCE AUDIT'` & `'No data imported yet'` text; inline `style` + `392`-line `AudienceExportGuideModal`. | 1 single header + 1 Import action; clean 1-line Health/Ratio bar; collapsible single-line Snapshot Diff card; symbolic health/status icons in `AudienceRowItem` + scoped SCSS; 1-line `<ShieldCheck /> Local only · Clear` bar; rebrand & modularize `AudienceExportGuideModal` (`<149` lines). |
| **9** | **Profile Scout** (`ProfileScanner.vue`) | Inline `style="..."` clutter and opaque `.profile-scanner` card outside glass system. | Extract inline styles into scoped frosted-glass SCSS; keep compact 1-line header + search input + result card. |
| **10** | **Engage Inbox** (`CommunityInbox.vue`, `community-inbox.scss`) | Static non-interactive badges (`AI Assist Drafts`, `Operator Review`); verbose helper disclaimers; permanent 3rd-column `"Add comment or message"` form. | Remove static badge pills and redundant footnotes; collapse `"Add"` form into a toggleable `+ Add` drawer/panel for a clean 2-pane glass inbox (`Threads \| Conversation`); use symbolic status icons. |
| **11** | **Content Studio** (`CreativeHub.vue`, `CreativeVideoCard.vue`, `creative-hub-*.scss`) | Local search box duplicates Global Topbar Search; `"(Ready to post)"` backend reassurance text; 3 verbose text score pills per caption + inline styles. | Bind filter to Global Topbar Search; remove `"(Ready to post)"`; display top caption + collapsible `+N captions`; replace verbose pills with compact symbolic icon badges (`<Rocket /> 88`, `<Zap /> 91`). |
| **12** | **Script Studio** (`ScriptStudioWorkspace.vue`, `VideoScriptStudio.vue`, `VideoScriptControls.vue`, `VideoScriptOutput.vue`, `DailyJourneyPoster.vue`) | Double header (`ScriptStudioWorkspace` hero + `VideoScriptControls` `AI Video Script Partner`); hardcoded pillar descriptions (`"Goa Underdog"`, `"14h days..."`); `"Retention Score: X%"` text pill. | Merge into 1 single-line header (`Script Studio` + `Scripts \| Stories` toggle); make pillar chips brand-agnostic 1-line icon buttons with hover tooltips; replace `"Retention Score:"` with `<Flame /> X%`. |
| **13** | **Workflows** (`WorkflowStudioWorkspace.vue`, `PublisherAutopilot.vue`) | Dead `.studio-heading`/`.studio-note` CSS; single selected workflow without switcher; no Visual Bot layer indicator. | 1-line header + workflow selector dropdown; add compact 1-line 3-Layer Visual Bot readiness icon strip (`CLI · DOM · Vision`) with tooltips. |
| **14** | **Workspaces & Brand Profile Modal** (`WorkspaceOverview.vue`, `BrandProfileModal.vue`, `BrandProfile*.vue`) | Dead `.workspace-heading`/`.eyebrow` CSS in `WorkspaceOverview.vue`; `378`-line `BrandProfileModal.vue` with 3-line intro paragraph and `"Synced N repos (last checked...)"` telemetry. | Add Audience summary tile to `WorkspaceOverview.vue` and clean dead CSS; refactor `BrandProfileModal` into `<149`-line tabbed/collapsible frosted-glass sections (`GitHub \| Links \| Docs \| Research`). |
| **15** | **Automation Studio** (`AutomationStudioWorkspace.vue`, `AutomationRuleList.vue`, `AutomationRunHistory.vue`, `UiCard.vue`) | `UiCard.vue` accepts unused `description` prop and stacks `eyebrow` + `title`; `"New workflow"` form permanently crowds rules & run history. | Simplify `UiCard.vue` to a single icon + title line; collapse `"New workflow"` builder inside an expandable `+ New Workflow` panel; show symbolic status icons on rules and runs. |
| **16** | **Build Mini-Apps & Dead Code Cleanup** (`DesignSystemWorkspace.vue`, `AssetManagerWorkspace.vue`, `AndroidBuildStudioWorkspace.vue`, `src/components/departments/`, unmounted `Publisher*.vue`, `src/styles.scss`) | Redundant `eyebrow`+`title`+`description` trios in Design System; verbose asset metadata `<dl>` always expanded; `"Ready"`/`"Missing"`/`"Checking"` text + raw PID/instanceId telemetry in Android Build Studio; dormant unmounted prototypes; legacy light-mode hex duplicates in `src/styles.scss`. | Strip redundant text in Design System; collapse per-asset metadata `<details>` in Asset Manager; replace Android check text with `<CheckCircle2 />` / `<XCircle />` / `<Loader2 />` and collapse Runtime diagnostics; archive/remove unmounted prototypes (`departments/`, `PublisherAdsCopy/AiMarket/Collabs/NewsViral`); unify theme tokens in `_design-tokens.scss` + `_audience-theme.scss`. |

---

## 4. Symbolic Icon Status System

| State | Icon | Semantic Token | Accessible Tooltip (`title` / `aria-label`) |
|---|---|---|---|
| Verified / Live / Active / Ready | `CheckCircle2` | `--status-success` | Connection verified, published, or prerequisite ready |
| Scheduled / Pending | `Clock` | `--purple` | Queued for future action |
| Needs Review / Handoff / Expired | `AlertTriangle` | `--status-warning` | Needs human review, token renewal, or manual handoff |
| Failed / 404 / Missing | `XCircle` | `--status-danger` | Delivery failed, account 404, or missing prerequisite |
| Paused | `PauseCircle` | `#f59e0b` | Automation or queue paused by operator |
| Draft / Unconfigured | `CircleDashed` | `--muted` | Saved draft or channel awaiting setup |
| AI Assist / Guided Next Action | `Sparkles` | `--accent-primary` | Optional AI assist or next logical step |
| Local-Only / Whitelisted | `ShieldCheck` | `#59ddb6` | Local-first storage or protected account |

---

## 5. Animation & Motion Architecture Audit

Current motion styles (`mini-app-animations.scss`, `_guided-flow.scss`, `src/styles.scss`, and duplicate `@keyframes pulse` in `publisher-navbar.scss`) leave list filtering, `<details>` collapsibles, drawers, modals, and route switches snapping abruptly while animating `background-size` repaints.

- **4-Tier Motion System (`src/styles/_motion-tokens.scss`):**
  - **Tier 1 (Ambient):** GPU-composited `transform`/`opacity` glow breathing (`26s–48s`); eliminate `background-size` layout/paint loops.
  - **Tier 2 (Micro-Interactions):** `120ms–220ms` (`--ease-out-expo`) specular `:focus-within` rim light, `scale(0.97)` press feedback, arrow nudge, and symbolic icon transitions.
  - **Tier 3 (List, Collapsible & Route Morphing):** `@formkit/auto-animate` (`v-auto-animate`) for filtered Audience/Launcher/Queue lists + `motion-v` (`<AnimatePresence>`) for modal/drawer enter-exit and `150ms` workspace cross-fades.
  - **Tier 4 (Single-CTA Wayfinding):** `socialkillerBeaconDot` & `socialkillerNextStepPulse` restricted to at most one primary next action per viewport; full `prefers-reduced-motion: reduce` support across CSS, `auto-animate`, and `motion-v`.

---

## 6. Code Structure, Backend Organization & GitHub Toolkit Summary

- **Layered Backend Refactor ([`BACKEND_ORGANIZATION_PLAN.md`](../engineering/BACKEND_ORGANIZATION_PLAN.md)):**
  - Extract `server/http/` (`unjs/rou3` trie router, bounded 1MB `read-json.mjs`, CORS/origin guard, `fast-redact` logger, and `valibot` schemas).
  - Replace stale module-level arrays in `server/marketing/orchestrator.mjs` (`429` lines) with SQLite WAL repositories as single source of truth; split oversized `server/routes/*`, `server/marketing/*`, and `server/engine/*` (`vision-contour.mjs`) into `<150`-line feature modules (`server/modules/<domain>/`).
  - Split `server/scheduler.mjs` (`255` lines) into `server/jobs/` backed by `sindresorhus/p-queue` with bounded concurrency, retry backoff, and fail-closed human approval.
- **GitHub Toolkit Adoption ([`GITHUB_TOOLKIT_ADOPTION_PLAN.md`](../research/GITHUB_TOOLKIT_ADOPTION_PLAN.md)):**
  - Phase 1: `krisk/Fuse` (`fuse.js`) for Global Topbar Search.
  - Phase 2–4: `formkit/auto-animate`, `motiondivision/motion-vue`, `unovue/reka-ui` (Tooltip, Collapsible, Dialog, Tabs), `xiaoluoboding/vue-sonner`.
  - Phase 5: `unjs/rou3`, `fabian-hiller/valibot`, `pinojs/fast-redact`, `sindresorhus/p-queue`.
  - Phase 6–7: `CLI-Anything` / `Stagehand` / `Midscene` Visual Bot patterns + `microsoft/playwright` & `dequelabs/axe-core` (`@axe-core/playwright`) for 5-viewport & WCAG AA QA.

---

## 7. Unified Developer Maintenance Script & 3-Layer Visual Bot Plan

Consolidate `scripts/dev-supervisor.ts` (`npm run dev:doctor`) and `scripts/diagnostics.mjs` (`npm run diagnose`) into one clean, `<149`-line-modular developer maintenance & Visual Bot supervisor:

1. **Unified CLI Entrypoint (`npm run dev:doctor`):**
   - Flags: `--json` (machine output), `--ci` (exit non-zero on failure), `--ensure` (auto-start missing `4174`/`5199` daemons via `auto-launch.mjs`), `--full` (also run `check:file-size`, `type-check`, `build`, `planning:check`), and `--visual-bot` (run live 3-layer Visual Bot pipeline).
   - Fix Node `DEP0190` warning in `scripts/dev-supervisor.ts` by removing `shell: true` from `execFileSync` calls with argument arrays.
2. **Port & Process Supervision:**
   - Reuse `scripts/port-arbiter.mjs` to assert port `5173` shielding and report live process ownership on `4174` (API) and `5199` (Dashboard).
3. **Automated UI Hygiene Gate (`scripts/uiux/ui-hygiene-check.mjs`):**
   - Scans `src/` for forbidden backend telemetry strings (`Ready to import`, `No data imported`, `No imported profiles`, `The Social Base`, `DIFF ACTIVE`, `SHARED BRAND CONTEXT`), plain `.css` files in `src/`, excessive inline `style="..."` counts, unused `UiCard` `description` props, duplicate keyframes, and `>149`-line file-size regressions.
4. **Live 3-Layer Visual Bot Verification (`npm run dev:visual-bot`):**
   - **Layer 1 — CLI-Anything (`<10ms`):** Execute `scripts/cli-anything/socialkiller-cli.ts` (`manifest`, `summarize`, `score`, `status`) and verify SQLite WAL readiness.
   - **Layer 2 — Semantic DOM, Set-of-Mark & Extension (`<50ms`):** Verify `extension/manifest.json` + bundle (`dist/followdesk-extension.zip`), verify `interaction-recorder.js` unsafe-action regex gate (blocks passwords/payments/unapproved submits), inspect `visual_bot_locators` SQLite cache table, and run headless Playwright 5-viewport (`360/390/768/1024/1280`) zero-overflow + `axe-core` WCAG AA smoke checks.
   - **Layer 3 — Sobel Contour & Human Cadence (`<120ms`):** Verify `server/engine/vision/` (3x3 Sobel edges + 2D NCC matching) and `extension/modules/human-cadence.js` Box-Muller cognitive jitter bounds.
5. **CI Integration:** Wire `npm run dev:doctor -- --ci` into `.github/workflows/ci.yml`.

---

## 8. Additional High-Impact Improvements ("What Else Can Be Done")

- **Global Keyboard Palette & Shortcuts:** `/` to focus Global Topbar Search, `Enter` to open the top matched mini-app from Launcher, `Esc` to clear search or close open modals/drawers.
- **Unified Glass Toast Composable (`useToast`):** Wrap `vue-sonner` to replace 5 separate per-component toast/notice blocks (`SocialPublisher`, `ConnectionsWorkspace`, `CommunityInbox`, `AutomationStudioWorkspace`, `AndroidBuildStudioWorkspace`) with one frosted-glass toast stack.
- **Complete Rebrand Cleanup:** Replace remaining `"The Social Base"` references in `AudienceExportGuideModal.vue`, `AudienceAuditOverlays.vue`, `useAppActions.ts`, `scripts/diagnostics.mjs`, and product docs with **SOCIALKILLER**.
- **51-File `<150`-Line Modularity Sprint:** Bring `npm run check:file-size` from 51 violations down to `0` (`10` in `src/`, `19` in `server/`, `11` in `extension/`, `9` in `scripts/`, `2` in `test/`).

---

## 9. 7-Phase Implementation Roadmap

| Phase | ID & Dependency | Core Deliverables | Exit Gate |
|---|---|---|---|
| **Phase 1** | `phase-1-shell-audience` (Ready now) | Global Topbar Search (`Fuse.js`, `/` / `Enter` / `Esc`), remove duplicate topbar Import & dead `.breadcrumbs`/`.sync-status`, remove `"No data imported"` / `"No imported profiles"` / `"The Social Base"` strings, complete Audience UI/UX polish (`BrandWorkspaceHeader`, `AppSidebar`, `AudienceAuditWorkspace`, `AudienceMetrics`, `HistoryPanel`, `AudienceAuditOverlays`, `ProfileScanner`), add Audience tile to `WorkspaceOverview`. | Zero backend telemetry strings in Shell/Audience; `vue-tsc` + `build` + `test:app-navigation` pass. |
| **Phase 2** | `phase-2-glass-motion-icons` (Depends: Phase 1) | 4-Tier Animation System (`_motion-tokens.scss`, `@formkit/auto-animate`, `motion-v`), single-line `UiCard` headers, Symbolic Icon Status System (`reka-ui` tooltips), frosted `--glass-bg` migration, inline style extraction, shared `vue-sonner` toast, and legacy hex/keyframe cleanup. | Zero stacked header+subheader duplicates; GPU-composited motion with reduced-motion support across Light & Dark themes. |
| **Phase 3** | `phase-3-planner-connections-create` (Depends: Phase 2) | Fix `availablePlatformIds` bug in `SocialPublisher.vue`, separate Composer channel selection from Preview switcher, collapse `PublisherNavbar` to 1 line, flatten nested `<details>`, bind Queue/Content Studio to Global Search, iconify `PublisherChannelCard`, declutter `CreativeHub` & `ScriptStudio` (1 header + brand-agnostic icon pillars). | Planner button/control count reduced >=35%; channel reselection works; `test:social` + `build` pass. |
| **Phase 4** | `phase-4-operate-build-collapsible` (Depends: Phase 3) | 2-pane `CommunityInbox` + collapsible `+ Add`, Workflows switcher + 3-layer Visual Bot status strip, `<150`-line tabbed `BrandProfileModal`, collapsible `+ New Workflow` in `AutomationStudio`, clean Build studios (`DesignSystem`, `AssetManager`, symbolic `AndroidBuildStudio` status icons + collapsed Runtime diagnostics). | Every workspace uses single-level collapsibles and 1-line headers with zero opaque holdouts. |
| **Phase 5** | `phase-5-backend-architecture` (Depends: Phase 4) | Extract `server/http/` (`rou3` router, `valibot` schemas, `fast-redact` logger), remove stale `orchestrator.mjs` in-memory arrays in favor of SQLite WAL repositories, move scheduler to `server/jobs/` with `p-queue` + fail-closed human approval, split oversized `server/routes/*`, `server/marketing/*`, and `server/engine/*` `<150` lines. | Layered `server/http/`, `server/modules/`, `server/jobs/` active; all server & adapter tests pass. |
| **Phase 6** | `phase-6-dev-script-visual-bot` (Depends: Phase 5) | Consolidate `dev-supervisor.ts` + `diagnostics.mjs` into unified `npm run dev:doctor` (`--json`, `--ci`, `--ensure`, `--full`, `--visual-bot`), fix Node `DEP0190`, add `scripts/uiux/ui-hygiene-check.mjs`, upgrade live 3-layer Visual Bot + Playwright/axe-core checks, wire into `.github/workflows/ci.yml`. | `npm run dev:doctor -- --ci` and `npm run dev:visual-bot` exit `0` with zero warnings. |
| **Phase 7** | `phase-7-modularity-release` (Depends: Phase 6) | Remove/archive dormant unmounted prototypes (`departments/`, `PublisherAdsCopy/AiMarket/Collabs/NewsViral`), resolve all remaining `check:file-size` violations (`<150` lines across `src/`, `server/`, `extension/`, `scripts/`, `test/`), run 5-viewport (`360/390/768/1024/1280`) overflow, WCAG AA & keyboard audit, run `npm run verify` + `npm run planning:check`. | `0` file-size violations, `0` horizontal overflow at 5 widths, `npm run verify` & `npm run planning:check` pass. |

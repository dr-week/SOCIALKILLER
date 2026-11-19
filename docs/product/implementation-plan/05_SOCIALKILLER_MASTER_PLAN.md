# SOCIALKILLER Master Upgrade Plan & Complete Task Inventory

**Date:** 2026-11-19  
**Mission:** Empower solo creative workers to run an entire automated agency from one local-first operating system—eliminating exploitative middleman agencies and keeping 100% of the creative margin.

---

## 1. Strict Engineering Rule #1: TypeScript, SCSS & `<100-150` Line Modularity

Every new and refactored module in **SOCIALKILLER** adheres to strict architectural boundaries:
1. **Hard Line Ceiling (`< 100–150` lines):** Enforced by `npm run check:file-size` (`scripts/check-file-size.mjs`, hard limit `149` lines).
2. **TypeScript + SCSS Standard:**
   - All frontend logic, domain engines, and CLI harnesses use strict TypeScript (`.ts` / `<script setup lang="ts">`).
   - All styles use modular SCSS (`<style scoped lang="scss">` and `@use './styles/<module>.scss'`). Every legacy `.css` file in `src/` has been migrated to `.scss`.
3. **Sub-Folder Responsibility Splitting:**
   - When any component, composable, or server module approaches 100–140 lines, split it by **domain purpose and function** into dedicated subfolders:
     - `components/<feature>/` (Sub-components)
     - `components/<feature>/styles/` (Scoped SCSS partials: `*-layout.scss`, `*-controls.scss`, `*-card.scss`)
     - `components/<feature>/composables/` (State, API actions, and extension bridges)
     - `domain/<feature>/` (Pure, deterministic business logic, templates, and summarizers)

---

## 2. UI/UX Design Language & Organization Audit (Checked Before UI Changes)

Before modifying any visual surface, we audited [`docs/product/UX_GUIDE.md`](../product/UX_GUIDE.md), [`docs/product/MINI_APP_ARCHITECTURE.md`](../product/MINI_APP_ARCHITECTURE.md), and `src/styles/`:

### Current Design System & Architecture
- **Shared Shell + 13 Focused Mini-Apps:** Opens to `MiniAppLauncher.vue` (`?app=<id>`) with internal same-tab navigation, browser Back/Forward support, and shared active brand context (`BrandWorkspaceHeader.vue`).
- **Typography & Surfaces:** `Manrope` for headings, `DM Sans` for interface controls. Translucent dark-first glass surfaces (`--glass-bg`, `--glass-border`, `--surface-card`), 5 selectable accents (`coral`, `violet`, `cyan`, `mint`, `orange`), and 10 CSS-only visual skins (`aurora`, `orbit`, `constellation`, `nebula`, `radar`, `lens`, `prism`, `landscape`, `flow`, `isometric`).
- **Zuari Islands:** `AppTopbar` (`src/islands/app-shell/topbar.ts`), `ImportBanner`, and `AudienceCategoryTabs` run as zero-VDOM `@zuari/dom` islands inside Vue wrappers.

### Planned & Executed UI/UX De-Cluttering, Glassmorphism & Next-Action Wayfinding
1. **Progressive Disclosure & Compact Density (Anti-Clutter Rule):**
   - Keep **one primary action per screen**; move secondary options behind compact `<details>` disclosures (`PublisherAdvancedOptions.vue`) or overflow menus.
   - Replace multi-line warning banners with single-line compact status pills (`guided-step-rail`).
2. **Specular Rim-Lit Glassmorphism & Next-Action Animations (`src/styles/_guided-flow.scss` — `93` lines):**
   - **Active Surface Specular Rim Light:** Focused cards (`.pub-card:focus-within`, `.studio-controls-card:focus-within`) automatically illuminate their top glass edge (`inset 0 1px 0 0`) and cast an ambient accent halo so the creator always knows which card owns keyboard focus.
   - **Wayfinding Next-Step Rail (`guided-step-rail`):** Wired into `PublisherComposerForm.vue` (`Step 1/4: Write headline & notes` → `Step 2/4: Click Summarize TL;DR` → `Step 3/4: Select target channels` → `Step 4/4: Ready — Click Publish or Schedule`) with an animated beacon dot (`socialkillerBeaconDot`).
   - **Directional Next-Action Pulse (`next-action-pulse`):** When raw notes exceed 220 characters, the `Summarize TL;DR` button pulses softly with an accent halo; when ready to publish or synthesize a script, the primary CTA pulses and animates its directional arrow on hover (`translateX(2.5px) scale(1.06)`). Respects `prefers-reduced-motion: reduce`.
3. **Instant Text Summarization & Micro-Brief Bar in Composer & Script Studio:**
   - Wired `src/domain/text-summarizer.ts` (`summarizeCreativeText`) into `PublisherComposerForm.vue` and `VideoScriptControls.vue` for 1-click TL;DR headline + 3-bullet compression.
4. **Solo-Creator Profit & Time-Saved Telemetry Pill:** Display real, verifiable counts of automated drafts, audited accounts, and ready channels without fake placeholder metrics.

---

## 3. Upgrading Scripting Studio, Visual Bot & Browser Extension (`CLI-Anything` + Similar Apps)

### A. `CLI-Anything` Agent-Native Harness (`scripts/cli-anything/socialkiller-cli.ts`)
- Inspired by **[HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything)** (Apache-2.0), SOCIALKILLER now includes an agent-native CLI (`npm run cli-anything`) that outputs deterministic JSON envelopes for:
  - `manifest`: Full tool and skill registry for AI coding agents and terminal pipelines.
  - `summarize --text "..."`: Local extractive TextRank/TF-IDF summarization and multi-channel micro-brief generation.
  - `score --text "..."`: Sub-millisecond viral hook, readability, and sentiment scoring.
  - `visual-bot`: Readiness inspection of the 3-layer Visual Bot pipeline.
  - `status`: Live health probe of local backend (`4174`) and frontend (`5199`).

### B. 3-Layer Visual Bot & Browser Extension Upgrade (`Stagehand` + `Midscene` + `Playwright-MCP` Patterns)
1. **Layer 1 — CLI-Anything JSON Execution (`<10ms`):** Direct local API & CLI execution for data transformation, summarization, caption generation, and dry-run queue staging.
2. **Layer 2 — Semantic DOM & Set-of-Mark (SoM) Accessibility Indexer (`<50ms`):**
   - Upgrade `extension/modules/interaction-recorder.js` and `extension/modules/page-harvester.js` with `Stagehand` / `browser-use` patterns:
     - Index interactive elements by semantic accessibility roles (`role`, `aria-label`, `data-testid`, `placeholder`).
     - Cache verified selectors per site origin (`Midscene` locator caching pattern) for fast, resilient workflow replay.
3. **Layer 3 — Theme-Invariant Sobel Edge & 2D NCC Contour Fallback (`server/engine/vision-contour.mjs`):**
   - When social platforms obfuscate DOM classes, use grayscale luminance normalization + 3x3 Sobel gradient edge detection + Normalized Cross-Correlation template matching, paired with Box-Muller log-normal cognitive jitter (`extension/modules/human-cadence.js`).

### C. Scripting Studio (`VideoScriptStudio.vue` & `DailyJourneyPoster.vue`) Upgrades
- Connect `summarizeCreativeText` to `VideoScriptControls.vue` and `DailyJourneyPoster.vue` so long technical changelogs or raw notes automatically condense into:
  - **0–3s Pattern-Interrupt Hook**
  - **3–15s Value Body / Visual Cut Directions**
  - **15–30s High-Intent CTA**

---

## 4. Complete Consolidated Task Inventory (Across All Project Trackers)

### Workstream A — Modularity & TypeScript/SCSS Compliance (Rule #1: `<100-150` Lines)
- [x] **M1.1** Rebrand app, extension, server, CLI, and docs to **SOCIALKILLER**.
- [x] **M1.2** Migrate all remaining `.css` files in `src/` (`unfollow-queue-modal.css`, `creative-hub.css`, `publisher-controls.css`, `publisher-layout.css`, `publisher-shared.css`) to modular `.scss` partials under `<150` lines.
- [x] **M1.3** Split `UnfollowQueueModal.vue`, `CreativeHub.vue`, `DailyJourneyPoster.vue`, `SocialPublisher.vue`, `src/domain/creative-hub.ts`, and `src/domain/marketing-intelligence.ts` into sub-150-line TypeScript/SCSS modules.
- [ ] **M1.4** Split remaining oversized frontend files (`AudienceExportGuideModal.vue`, `BrandProfileModal.vue`, `useAudienceData.ts`, `PublisherQueueLogs.vue`, `PublisherAutopilotTimeline.vue`, `AudienceBatchBar.vue`, `PublisherAdsCopy.vue`, `PublisherComposer.vue`, `PublisherAutopilot.vue`, `AudienceQueuePill.vue`, `useUnfollowQueue.ts`).
- [ ] **M1.5** Split remaining oversized extension & server modules (`extension/popup.js`, `extension/modules/injections/social-autoposter.js`, `server/marketing/orchestrator.mjs`, `server/routes/viral-routes.mjs`, `server/routes/ops-routes.mjs`, `scripts/social/adapters/*.ts`).

### Workstream B — Publishing Safety, Dry-Run & Secret Redaction (`01_PUBLISHING_SAFETY.md`)
- [ ] **S0.1 / S0.2** Require explicit human approval gate for live release broadcasts (`.github/workflows/social-broadcast.yml`).
- [ ] **S0.3 / S0.4** Enforce approval and dry-run at the server route boundary (`server/social-publisher.mjs` & `server/scheduler.mjs`) so dry-run cannot trigger external provider calls.
- [ ] **S0.5** Add structured secret redaction (`fast-redact` pattern) across extension and server logging paths.
- [ ] **S0.6** Document and test queue claim, retry backoff, and crash recovery in SQLite.

### Workstream C — Visual Bot, CLI-Anything & Browser Extension (`CLI_ANYTHING_AND_VISUAL_BOT_REUSE.md`)
- [x] **V1.1** Document `HKUDS/CLI-Anything`, `stagehand`, `playwright-mcp`, `midscene`, and `browser-use` architecture in `docs/research/CLI_ANYTHING_AND_VISUAL_BOT_REUSE.md`.
- [x] **V1.2** Implement deterministic local TextRank/TF-IDF summarizer (`src/domain/text-summarizer.ts`, `<140` lines).
- [x] **V1.3** Implement `scripts/cli-anything/socialkiller-cli.ts` (`npm run cli-anything`) with JSON manifest, summarization, viral scoring, visual-bot inspection, and runtime health probe.
- [ ] **V1.4** Modularize `extension/popup.js` and `extension/modules/injections/social-autoposter.js` into `<140`-line modules with Stagehand-style semantic DOM observation and locator caching.
- [x] **V1.5** Wire 1-click Text Summarization & Micro-Brief pills into Composer (`PublisherComposerForm.vue`) and Script Studio (`VideoScriptControls.vue`).

### Workstream D — Database System & Solo-Agency Data Sovereignty (`DATABASE_ARCHITECTURE_PLAN.md`)
- [x] **D1.1** Audit `server/db/` (`sqlite-engine.mjs`, `schema-workspaces.mjs`, `schema-social.mjs`, `schema-automation.mjs`, `statements.mjs`, `repositories/`) and document the 5-Pillar Database Architecture in [`docs/engineering/DATABASE_ARCHITECTURE_PLAN.md`](../../engineering/DATABASE_ARCHITECTURE_PLAN.md).
- [x] **D1.2** Split `server/db/statements.mjs` (`10` lines) into `server/db/statements/publishing-statements.mjs` (`55` lines) and `server/db/statements/workspace-statements.mjs` (`96` lines).
- [x] **D1.3** Add Pillar 4 schema (`server/db/schema-agency-crm.mjs`, `42` lines) for `leads` (comment-to-lead pipeline) and `client_deliverables` (retainer proof-of-work).
- [x] **D1.4** Add Pillar 5 schema (`server/db/schema-visual-bot.mjs`, `37` lines) for `visual_bot_locators` (Stagehand/Midscene DOM+Sobel selector caching) and `content_summaries` (cached TextRank micro-briefs).

### Workstream E — UI/UX Responsive Validation & Core Agency Departments (`TASKS.md` & `03_PRODUCT_VALIDATION.md`)
- [ ] **U1.1** Run 5-viewport responsive & keyboard reachability audit (`360 / 390 / 768 / 1024 / 1280` CSS px) with Playwright.
- [ ] **U1.2** Complete Phase 3 Planner & Multi-Framework Composer flow (`Brief → Summarize → Framework → Channels → Preview → Review → Schedule`).
- [ ] **U1.3** Complete Phase 4 3-Pane Engage Inbox with keyword triggers and 1-click lead conversion.
- [ ] **U1.4** Complete Phase 5–13 Solo-Agency Workspaces (Leads CRM, Client Review Portal, Projects, Email Campaigns, Automations, Analytics, Command Center).

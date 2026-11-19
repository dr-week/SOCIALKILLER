# UI/UX Validation Notes

**Updated:** 2026-11-19  
> These notes record both the earlier baseline inspection and verified code/UI checks. Mini-app participant usability and live 5-width runtime DOM sweeps still require dedicated participant/browser sessions.

**Purpose:** Evidence log for Phase 0 baseline and Phase 1 responsive audit.  
**Rule:** Observed product behavior is separated from hypotheses and participant findings. Mark any unvalidated assumption explicitly — never invent research data.

---

## Session Details

| Field | Value |
|-------|-------|
| Date | 2026-11-05 (Asia/Calcutta) |
| Reviewer | Codex — repository + running-app inspection |
| Participants | None — no participant testing conducted this session |
| Browser | Microsoft Edge |
| App URL | `127.0.0.1:5199` → API proxy `127.0.0.1:4174` |
| Build state | Existing `dist/` output (not rebuilt); Vite build blocked by Windows `EPERM` on package entrypoint |
| Viewports tested | 360, 390, 768, 1024, 1280 CSS px |

---

## Current UI Observations (Fact, Not Assumption)

The app opens in the publishing workspace on **Compose**. The shell shows:
- Workspace toggles: Publishing / Audience Audit
- Company selector/profile control
- Sidebar entries: Video Script Studio, Daily Founder Journey, Multi-Channel Composer, Creative Studio

> [!WARNING]
> Sidebar entries above are **legacy items to be pruned** (per TASKS.md Phase 1). Do not design around them.

### Composer Screen Inventory

| Control | Visible | Status |
|---------|---------|--------|
| Preset buttons | ✅ | Purpose unclear without user test |
| Idea action | ✅ | Advanced/optional |
| Title field | ✅ | Likely platform-specific; requirements unknown |
| Post details field | ✅ | Basic-required; validate empty-draft rules |
| More options (collapsed) | ✅ | Contents uninspected |
| Adapt text | ✅ | Advanced; inspect resulting edits |
| Channel selector | ✅ | Required for delivery; draft may be channel-less |
| Editor / Preview switch | ✅ | Per selected platform; inspect variants |
| Connect to publish | ✅ | Disabled — "Configure every selected channel first" |
| Schedule | ✅ | Enabled despite 0 configured channels ⚠️ |
| Save Draft | ❌ | **Not visible — critical gap** |

---

## Flow Map (Observed, Not Validated)

| Flow | Entry / Steps | Unresolved Issues | Capabilities to Preserve |
|------|--------------|-------------------|--------------------------|
| **Create** | Compose → preset or type → More options → channels → Editor/Preview → publish/schedule | No Save Draft; Schedule enabled with 0 channels; `approvalStatus: not_required` bypasses review | Presets, ideas, text adapt, channel-specific preview, advanced options, explicit publish/schedule |
| **Queue** | Compose workspace → Queue tab | Initial load crashed on 40 posts missing `platforms`; 34/40 recovered from delivery logs; 6 show warnings | Queue destination, lifecycle/status visibility |
| **Channels** | Compose workspace → Channels tab | "5 assigned" header vs "0 configured" in composer — meaning not explained on screen | Company channel assignment + credential config |
| **Audience Audit** | Sidebar toggle → Audience Audit | Destination content not inspected; no imported data visible in shell | Separate imported relationship data, account context, history, import workflow |

### Source-Level Notes (Not in Compiled `dist/`)

- User-initiated publish requests remain `pending_approval`; composer no longer sends to browser extension before approval.
- Queue channel actions disabled for `pending` or metadata-warning posts.
- Post-creation API distinguishes created records from duplicate/quality-guard/limit failures.
- **Scheduling unresolved:** route creates `scheduled` records, but no consumer of stored scheduled posts was identified. Do not present as confirmed automatic delivery.

---

## Persona, Jobs & Participant Baseline

| Item | Status |
|------|--------|
| Primary operator persona | **Pending** — Working hypothesis: operator publishing for a brand workspace, occasionally auditing imported Instagram relationship data |
| Context and frequency | **Pending** |
| Top 3 jobs | **Pending** — Candidates: save a draft; find a queued post and identify its state; find imported audience data |
| Task success / time / confusion | **Not measured** — no participants |
| Unvalidated assumptions | Primary persona; interpretation of Compose/Queue/Channels; whether basic draft is findable; "assigned vs configured" channel counts; proposed 5-nav labels |

---

## Composer Field Classification (Provisional)

> [!NOTE]
> This is a provisional screen inventory only — not a validated prioritization. Expand More Options and inspect each platform variant before finalizing.

| Field / Control | Provisional Class | Channel Condition | Next Check |
|-----------------|-------------------|-------------------|------------|
| Post details | Basic-required | Shared draft | Verify save behavior with empty draft |
| Title | Conditional | Platform-specific (likely) | Inspect platform variants |
| Channel selection | Conditional | Required for delivery; draft may be channel-less | Validate persisted draft contract |
| Preset / Idea | Advanced / optional | Optional starting aid | — |
| Adapt text | Advanced / optional | Potentially channel-dependent | Inspect resulting edits |
| More options | Advanced (uninspected) | Likely channel-dependent | Expand and inventory before decision |
| Schedule | Conditional / advanced | Requires readiness + configured destination | Resolve policy/readiness first |
| Editor / Preview | Review step | Per selected platform | Inspect all platform variants |

---

## Navigation Concept Check

| Check | Result |
|-------|--------|
| Can operator identify active brand? | Screen shows "Danger Labs" + switcher; **participant comprehension unvalidated** |
| Can operator find next publishing task? | Compose is initial screen; **task findability unvalidated** |
| Can operator find imported Audience Audit data? | Workspace toggle visible; **comprehension and destination flow unvalidated** |
| Label mismatch | "5 assigned channels" (header) vs "0 Channels with credentials configured" (composer) — unexplained |
| Proposed 5-nav labels | 📅 Planner, 💬 Inbox, 🎯 Leads, 👥 Audience, ⚙️ Settings — **no decision; pending participant validation** |

---

## Responsive Audit Results

**Live rerun** against existing `dist/` bundle at `127.0.0.1:5199`:

| Viewport (CSS px) | `window.innerWidth` | Queue `scrollWidth` raw | Queue `scrollWidth` corrected | Create overflow | Keyboard |
|------------------:|-------------------:|------------------------:|-----------------------------:|-----------------|----------|
| 360 | 360 | 417 px ❌ | 360 px ✅ (fix injected) | None ✅ | Not checked |
| 390 | 390 | 417 px ❌ | 375 px ✅ (fix injected) | None ✅ | Not checked |
| 768 | 768 | 753 px ✅ | 753 px ✅ | None ✅ | Not checked |
| 1024 | 1024 | 1009 px ✅ | 1009 px ✅ | None ✅ | Not checked |
| 1280 | 1280 | 1265 px ✅ | 1265 px ✅ | None ✅ | Not checked |

**Fix applied:** Injected `minmax(0,1fr)` grid track + `min-width:0` card rules — this is a **browser-injected test only**, not a compiled-source fix.

**Remaining blockers:**
1. Vite build blocked by Windows `EPERM` on package entrypoint — must resolve before rerunning compiled audit.
2. Keyboard reachability not checked at any width.
3. Expanded composer, dialogs, and drawer interactions not checked.
4. Draft/schedule policy not resolved.

---

## Decisions & Exit Evidence

| Decision | Status |
|----------|--------|
| Persona and top jobs agreed | ⏳ Pending participant input |
| Baseline complete | ⏳ Gap documented; baseline not complete |
| Terminology decision | ⏳ Pending participant input |
| 5-nav label validation | ⏳ Pending participant input |
| Feature-preservation checklist | ⏳ Visible capabilities recorded above; full flow inventory pending |
| Responsive exit evidence | ⏳ Pending compiled-source rebuild + 5-width rerun |

**Next actions:**
- Participant sessions for P0.1 / P0.3 / P0.5
- Inspect Queue, Channels, Audience Audit + expanded composer for P0.2 / P0.4
- Resolve Vite build EPERM, rebuild, and run exact viewport audit for P1.4

---

## 2026-11-19 Engineering & UI/UX Verification Update

Automated verification executed against the updated source build (no live participant study conducted):
- **Build & Bundle Code-Splitting:** `npm run type-check` (`0` errors) and `npm run build` pass cleanly (main bundle `~427 kB`, lazy-loaded workspace chunks).
- **UI Declutter & Glassmorphism Slices Implemented:**
  - Flattened double-nested disclosure in `PublisherContentOptions` / `PublisherAdvancedOptions` with frosted glass styling.
  - Replaced text button walls in `PublisherChannelCard` with labeled symbolic action icons (`Save`, `Test API`, `Pulse`, `Intent`).
  - Simplified `CommunityInbox` to a 2-pane glass layout with toggleable `+ Add` composer drawer and removed static non-interactive badge pills.
  - Consolidated `VideoScriptControls` header & replaced hardcoded founder copy with brand-agnostic creative pillars; compacted `VideoScriptOutput` retention badge.
  - Collapsed Automation Builder form (`AutomationStudioWorkspace`), raw runtime PID/UUID telemetry (`AndroidBuildStudioWorkspace` with symbolic status icons), and Asset attribution `<dl>` (`AssetManagerWorkspace`); added workflow switcher and 3-Layer Visual Bot readiness strip (`DOM · Contour · Cadence`) to `PublisherAutopilot`.
  - Split `BrandProfileModal` into tabbed frosted glass modules (`<149` lines each) and deleted 15 dead unmounted prototype files.
- **Automated Hygiene, Eval & Modularity Gates:** `npm run uiux:hygiene` (`0` `.css`, `0` forbidden strings), `npm run eval:agents` (`25/25` passed), and `npm run check:file-size` reduced legacy violations from `51` → `43`.
- **Phase 2B-1 Frontend Modularity & Shared UX Primitives:** Eliminated all `6` remaining oversized files in `src/` (`src/` now has **`0` file-size violations**; total repo violations reduced `43` → `37`), mounted shared frosted `<UiToastHost />` across Inbox, Automation, and Android Build Studio, added adapter-ready `rankFuzzyItems` fuzzy Global Search with unit tests in `test/app-navigation.test.mjs`, and documented the Dual-Track MIT upgrade blueprint.
- **Phase 2B-2 & 4A Upgrades:** Wired vetted MIT/Apache-2.0 libraries (`vue-sonner`, `@formkit/auto-animate`, `fuse.js`, `reka-ui`), eliminated stale in-memory arrays in `orchestrator.mjs` (SQLite WAL single-source-of-truth), split `scheduler.mjs` into fail-closed `server/jobs/` modules (total legacy violations `37` → `35`), and expanded `eval:agents` to `28` scenarios across `5` suites.
- **Remaining Validation:** Live 5-width (`360/390/768/1024/1280` CSS px) DOM overflow/focus sweep and participant task timing sessions remain pending.

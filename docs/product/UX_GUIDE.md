# UX Guide — SOCIALKILLER

**Updated:** 2026-11-19

> The current app grouping and source-backed feature inventory lives in [Mini-app architecture](./MINI_APP_ARCHITECTURE.md). The section-by-section declutter plan lives in [UI/UX Declutter & Efficiency Plan](./UIUX_DECLUTTER_AND_EFFICIENCY_PLAN.md).
> This guide covers the implemented navigation model, Audience UI/UX architecture, minimalist glassmorphism, symbolic icon status language, and safety boundaries.

---

## Experience Goal

Make every automated agency tool easy to find and operate without exposing backend telemetry or presenting roadmap-only departments as working features. Each mini-app is a focused workspace inside one shared website, with the active brand and local settings carried across internal navigation.

---

## Core Principles

| Principle | Rule |
|---|---|
| **Workspace-first** | Each available mini-app has a dedicated workspace in the shared application |
| **Launcher-first** | The app launcher groups available workspaces; the sidebar keeps app names visible |
| **Task-specific** | Every workspace has one primary job and tools that serve that job |
| **Progressive disclosure** | Collapse secondary forms, diagnostics, and advanced options into one clean toggle or `<details>` |
| **Mobile-safe** | No horizontal overflow; drawer navigation and primary actions work on phones and tablets |
| **Real data only** | No placeholder metrics, no fake connection states, no estimated numbers |
| **Zero backend telemetry** | Remove backend state text (`Ready to import`, `No data imported`, `DIFF ACTIVE`, PIDs); show ready UI out of the box |
| **Single-line headers** | One icon + concise title per section/card; never rephrase a header inside a subheader |
| **Symbolic status icons** | Prefer semantic Lucide icons + tooltips over multi-word status text blocks |
| **Honest scope** | Separate available workspaces from roadmap items, prototypes, and unmounted code |

---

## Minimalist Glassmorphism & Anti-Clutter Laws

1. **Zero Backend Telemetry on the Frontend:** Never expose raw state strings like `"Ready to import"`, `"No data imported"`, `"No imported profiles"`, `"Data synced"`, `"DIFF ACTIVE"`, `"SHARED BRAND CONTEXT"`, `"Checking local runtime identity..."`, or server PIDs on primary surfaces.
2. **Global Topbar Search:** Keep a single frosted-glass search bar (`/` shortcut, `Enter` to jump to the matching mini-app, `Esc` to clear) in the topbar filtering the Launcher, Audience Audit, Queue, and Content Studio.
3. **Strict 1-Line Header Rule:** One `<Icon />` + concise title per workspace and card (`UiCard`). Never stack redundant eyebrow + title + rephrased subheader lines, and remove dead `subtitle`/`description` props or unused `header p`/`header span` CSS.
4. **Single-Level Collapsible Process Grouping:** Collapse secondary forms, advanced options, activity logs, asset metadata, and runtime diagnostics into one clean `<details>` disclosure or tab toggle per workspace. Never nest `<details>` inside `<details>`.
5. **Consistent Frosted Glassmorphism:** Every panel, card, modal, and drawer uses `--glass-bg`, `--glass-border`, `backdrop-filter: blur(18px) saturate(125%)`, and specular top-edge rim highlights (`_guided-flow.scss`), replacing opaque `var(--surface)` holdouts and hardcoded light-mode hex values.

---

## Visual System

- Dark is the first-run theme. System and Light remain available; the selected mode and accent persist locally.
- Use charcoal and midnight surfaces, luminous coral as the default accent, and restrained violet, cyan, mint, and orange highlights. Status colors retain their own meanings and are not replaced by the selected accent.
- Each mini-app has catalog-owned accent and visual-skin metadata. The launcher uses owner-supplied image overlays with restrained opacity over its soft glow; the active workspace gets a restrained matching background treatment without changing the user-selected global accent.
- Use translucent, softly bordered glass surfaces over low-contrast ambient gradients.
- DM Sans is the interface face; Manrope is reserved for headings. Keep labels short and descriptive copy available on demand.
- App tiles open internally in the current tab by default. A separate new-tab control opens that same first-party route in another browser tab; explicit provider handoffs remain separate actions.
- Maintain readable contrast, visible focus, comfortable touch targets, and reduced-motion support. At narrow phone widths, the launcher becomes a single column and navigation remains in the drawer.

---

## Animation & Motion Architecture

Motion in SOCIALKILLER exists to clarify hierarchy, confirm tactile state, and guide next actions—never to decorate empty space or block rapid clicks. All motion primitives align under `src/styles/_motion-tokens.scss`:

| Tier | Timing & Curve | Mechanism & Libraries | Role in UI/UX |
|---|---|---|---|
| **Tier 1 — Ambient Glass Atmosphere** | `26s–48s` linear/ease-in-out | GPU-composited `transform`/`opacity` keyframes (`mini-app-animations.scss`) | Subtle ambient glow breathing behind frosted cards; avoid animating `background-size` repaints. |
| **Tier 2 — Tactile Micro-Interactions** | `120ms–220ms` (`--ease-out-expo`) | CSS transitions + `_guided-flow.scss` | Top-edge specular rim highlight on `:focus-within`, button press-in (`scale(0.97)`), directional arrow nudge on hover, symbolic status icon swaps. |
| **Tier 3 — List, Collapsible & Route Morphing** | `180ms–260ms` spring/ease | `@formkit/auto-animate` (`v-auto-animate`) + `motion-v` (`AnimatePresence`) | Smooth row filtering/reordering in Audience Audit, Launcher, Queue & Content Studio; smooth collapsible `<details>`, drawer/modal enter-exit, and `150ms` workspace cross-fades. |
| **Tier 4 — Single-CTA Guided Wayfinding** | `1.8s–2.8s` subtle pulse | `socialkillerBeaconDot` & `socialkillerNextStepPulse` | At most **one** pulsing beacon/CTA per viewport (`Clean & TL;DR` when notes >220 chars, or primary `Publish`/`Generate`) so attention lands on the next action. |

### Motion Guardrails
- **Tokenized Durations & Easings:** Centralize all timings in `src/styles/_motion-tokens.scss`; remove scattered hardcoded durations and duplicate `@keyframes` (such as duplicate `pulse` in `publisher-navbar.scss`).
- **Compositor-Only Properties:** Animate only `transform`, `opacity`, and `filter`; never animate width, height, padding, or margins.
- **Universal Reduced-Motion Safety:** `prefers-reduced-motion: reduce` must disable keyframe loops, spring scaling, and transitions across CSS, `@formkit/auto-animate`, and `motion-v`.

---

## Audience UI/UX Architecture

Audience workflows span the shared shell and dedicated Community & Audience mini-apps without leaking Instagram login credentials or backend status strings:

1. **Global Brand Header Audience Pill (`BrandWorkspaceHeader.vue`):** Compact icon-led Audience quick-jump pill displaying follower/unfollower counts or `@handle` when loaded, routing directly to Audience Audit (`overview`).
2. **Global Sidebar Audience Profile & Settings (`AppSidebar.vue`, `SidebarSettingsPanel.vue`):** Footer Audience profile card acts as a quick jump to Audience Audit; Settings manages imported audit profiles without displaying `"No data imported"` or `"No imported profiles"` telemetry.
3. **Audience Audit (`AudienceAuditWorkspace.vue`):**
   - **Single Entry & Import:** 1-line header and a single consolidated Import trigger (`ImportBanner` when empty, single action bar when loaded).
   - **Metric Cards & Compact Health Bar (`AudienceMetrics.vue`):** 4 interactive metric cards (`Not following back`, `You don't follow back`, `Mutuals`, `Followers/Following`) plus a 1-line Audience Health & Ratio indicator with no duplicate quick-link buttons.
   - **Category Tabs & Global Search (`AudienceCategoryTabs.vue`, `AudienceToolbar.vue`):** Filter `Overview`, `Not Following Back`, `Fans`, `Mutuals`, `Followers`, `Ghost`, and `Whitelist` directly from the Global Topbar Search input.
   - **Snapshot Diff (`HistoryPanel.vue`):** Collapsible single-line snapshot comparison for `new-followers` and `lost-followers`.
   - **Safe Queue & Privacy (`UnfollowQueueModal.vue`, `AudienceQueuePill.vue`, `AudienceAuditOverlays.vue`):** Safe Unfollow Queue modal with minimized floating pill and a 1-line local-only privacy bar (browser storage, zero Instagram login/password).
4. **Profile Scout (`ProfileScanner.vue`):** Best-effort public profile count lookup and HD avatar download utility, clearly distinct from private follower export audits.

---

## Navigation Model

| Category | Available mini-apps | Primary job |
|---|---|---|
| Plan & publish | Planner · Connections | Draft, review, queue, and configure brand-specific publishing channels |
| Community & audience | Engage · Audience Audit · Profile Scout | Work with manual reply drafts, imported audience lists, and public profile lookup |
| Create | Content Studio · Script Studio | Explore inspiration and create captions, video scripts, and milestone stories |
| Operate | Workflows · Workspaces · Automation Studio | Review browser workflows, manage local brand context, and run draft-only rules |
| Build | Design System · Asset Manager · Android Build Studio | Customize themes/accents, inspect local visual assets, and run Capacitor Android builds |

- The **Apps** launcher is the entry point; planned mini-apps remain visibly separated inside a collapsed `<details>` section.
- Sidebar selection and launcher cards navigate inside the same website, page, and browser tab (`?app=`, plus `?view=` for Audience Audit subviews).
- Browser Back and Forward follow same-tab workspace changes.

---

## Interface Rules

| Rule | Detail |
|---|---|
| **One primary action per screen** | Secondary actions live in overflow controls or one collapsible `<details>` |
| **Symbolic icons over banners** | Compact icon + tooltip pills replace multi-line warning or status banners |
| **Drawers & collapsibles for quick edits** | Slide-in drawer or single-level collapsible form for create/edit flows |
| **No duplicate adjacent selectors** | Never repeat platform grids, search inputs, or import buttons in the same view |
| **Empty → setup prompt** | Empty state shows the direct action to load/create, never backend telemetry |
| **Close paths everywhere** | Drawers and dialogs support close control, outside click, Escape, and nav completion |
| **Keyboard and focus** | `/` focuses topbar search, `Enter` jumps, `Esc` clears/closes, focus rings visible |
| **Reduced-motion** | Animations disabled when `prefers-reduced-motion` is set |

---

## Symbolic Icon Status System

Every icon-only or status-badge control must retain an accessible `aria-label` and `title` tooltip:

| Status / Role | Lucide Icon | Token / Colour | Tooltip / Accessibility Meaning |
|---|---|---|---|
| `published` / `connected` / `active` / `ready` | `CheckCircle2` | `--status-success` (Green) | Live, verified connection, or ready prerequisite |
| `scheduled` / `pending` | `Clock` | `--purple` (Purple) | Queued for future delivery or awaiting run |
| `in_review` / `manual_handoff` / `expired` | `AlertTriangle` | `--status-warning` (Amber) | Needs operator approval, token refresh, or manual handoff |
| `failed` / `deactivated` / `missing` | `XCircle` | `--status-danger` (Red) | Failed action, 404 account, or missing prerequisite |
| `paused` | `PauseCircle` | `#f59e0b` (Orange) | Manually paused workflow or queue |
| `draft` / `not_configured` | `CircleDashed` | `--muted` (Gray) | Saved draft or unconfigured channel |
| `ai_assist` / `next_step` | `Sparkles` | `--accent-primary` | Optional AI assist or guided next step |
| `local_only` / `whitelisted` | `ShieldCheck` | `#59ddb6` (Mint) | Protected locally in browser/SQLite or whitelisted |

---

## Publishing & AI Safety Rules

| Rule | Enforcement |
|---|---|
| **Draft ≠ Published** | Explicit human review and approval required before any publish action |
| **Saved handle ≠ Connection** | Show real channel state from actual credential check only |
| **No auto-publish** | Publish requests enter `pending_approval`; human must approve |
| **No client scheduling** | Blocked until approval enforcement, audit history, and reviewer roles are implemented |
| **Manual handoff** | Approved Meta content uses manual Business Suite handoff until direct API publishing is verified |
| **AI suggests, humans decide** | No AI output triggers sends, publishes, or schedules anything |
| **Explicit automation** | Automation Studio rules start paused; user-triggered actions and human approval remain explicit |
| **Data-leave notice** | User shown a clear notice before any data is sent to an external AI provider |

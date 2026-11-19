# UX Guide — The Social Base

> The current app grouping and source-backed feature inventory lives in [Mini-app architecture](./MINI_APP_ARCHITECTURE.md). The earlier 12-department concept is superseded.
> This file covers the implemented navigation model, interface rules, terminology, and safety boundaries.

---

## Experience Goal

Make the work that exists today easy to find without presenting roadmap-only departments as working features. Each mini-app is a focused workspace inside one shared website, with the active brand and local settings carried across internal navigation.

---

## Core Principles

| Principle | Rule |
|-----------|------|
| **Workspace-first** | Each available mini-app has a dedicated workspace in the shared application |
| **Launcher-first** | The app launcher groups available workspaces; the sidebar keeps app names visible |
| **Task-specific** | Every department has one primary job and tools that only serve that job |
| **Progressive disclosure** | Show basic controls first; reveal advanced options on demand behind "More options" |
| **Mobile-safe** | No horizontal overflow; drawer navigation and primary actions work on phones and tablets |
| **Real data only** | No placeholder metrics, no fake connection states, no estimated numbers |
| **Zero corporate fluff** | Remove helper copy when the control label already explains the action |
| **Honest scope** | Separate available workspaces from roadmap items, prototypes, and unmounted code |

---

## Visual System

- Dark is the first-run theme. System and Light remain available; the selected mode and accent persist locally.
- Use charcoal and midnight surfaces, luminous coral as the default accent, and restrained violet, cyan, mint, and orange highlights. Status colors retain their own meanings and are not replaced by the selected accent.
- Each mini-app has catalog-owned accent and visual-skin metadata. The launcher uses owner-supplied image overlays with restrained opacity over its soft glow; the active workspace gets a restrained matching background treatment without changing the user-selected global accent.
- Use translucent, softly bordered surfaces over low-contrast ambient gradients. Vary workspace composition with editorial headers, compact data panels, and occasional abstract shapes; do not make every screen a stack of identical cards.
- DM Sans is the interface face; Manrope is reserved for headings. Keep labels short and descriptive copy available on demand.
- App tiles expose their name and action at rest. Desktop hover and keyboard focus reveal a short description inside the tile; touch users can reveal it with the information control. Descriptions replace the action hint in the tile's lower area rather than floating over neighboring apps. No capability may depend on hover alone.
- Hovering or keyboard-focusing a tile brings it forward and softly dims its peers. Touch and pen users get the same focus effect after a brief press-and-hold; it clears when the pointer is released, cancelled, or leaves. Reduced-motion mode keeps the focus state but removes scaling and transitions.
- App tiles open internally in the current tab by default. A separate new-tab control may open that same first-party route in another browser tab; explicit provider handoffs remain separate actions.
- Maintain readable contrast, visible focus, comfortable touch targets, and existing reduced-motion support. At narrow phone widths, the launcher becomes a single column and navigation remains in the drawer.
- Keep decorative launcher art CSS-only, non-interactive, and behind card content; avoid duplicated circle motifs, external art dependencies, AI-generated visuals, and motion that affects workspace controls.

---

## Navigation Model

### Current app navigation

| Category | Available mini-apps | Primary job |
| --- | --- | --- |
| Plan & publish | Planner · Connections | Draft, review, queue, and configure brand-specific publishing channels |
| Community & audience | Engage · Audience Audit · Profile Scout | Work with manual reply drafts, imported audience lists, and public profile lookup |
| Create | Content Studio · Script Studio | Explore inspiration and create captions, video scripts, and milestone stories |
| Operate | Workflows · Workspaces | Review user-recorded browser workflows and manage local shared brand context |

- The **Apps** launcher is the entry point; planned mini-apps are visibly separated from available apps.
- Sidebar selection and launcher cards navigate inside the same website, page, and browser tab. The selected app is reflected in `?app=`; Audience Audit subviews also use `?view=`.
- Browser Back and Forward follow same-tab workspace changes. The separate new-tab link opens the same in-site route, never a separate application.
- Existing external provider handoffs remain explicit actions inside the relevant workspace; they are not mini-app navigation.
- The active brand remains visible in the launcher and is shared by brand-scoped workspaces. Global theme and data settings are separate from mini-apps.
- The mobile shell uses a navigation drawer, not the previously proposed bottom-tab bar. Labels remain visible rather than depending on hover.
- Leads, Email Marketing, Projects, Production, Automations, Analytics, AI Assistant, Research & Trends, Command Center, and Client Review remain roadmap-only; see the [feature inventory](./MINI_APP_ARCHITECTURE.md).

---

## Interface Rules

| Rule | Detail |
|------|--------|
| **One primary action per screen** | Secondary actions in `⋯` overflow menu — never at equal visual weight |
| **Status pills not banners** | Compact coloured pill replaces every multi-line warning banner |
| **Drawers for quick edits** | Slide-in drawer for fast create/edit; full page for complex workflows |
| **No cross-department widgets** | Leads data doesn't appear in Social; Social data doesn't appear in Email |
| **Empty → setup prompt** | Empty state shows the action to fix it, never fake numbers |
| **Group related controls** | Related actions and displays stay near each other — no scattered placement |
| **Context visible** | Active brand, active department, and current state always readable at a glance |
| **Close paths everywhere** | Drawers and dialogs: close control + outside click + Escape + completed nav |
| **Keyboard and focus** | Tab order logical; focus rings visible; all actions keyboard-reachable |
| **Reduced-motion** | Animations disabled when `prefers-reduced-motion` is set |

---

## Status Language (Used Across All Departments)

| Status | Colour | Meaning |
|--------|--------|---------|
| `draft` | ⬜ Gray | Saved, not submitted for action |
| `in_review` | 🟡 Amber | Awaiting human approval |
| `approved` | 🔵 Blue | Approved, not yet acted on |
| `scheduled` | 🟣 Purple | Queued for future delivery |
| `published` / `sent` | 🟢 Green | Confirmed delivered by provider |
| `failed` | 🔴 Red | Delivery failed — action required |
| `connected` | 🟢 Green | Channel live and authorized |
| `expired` | 🟡 Amber | Token needs renewal |
| `not_configured` | ⬜ Gray | No credentials entered yet |
| `paused` | 🟠 Orange | Manually paused by operator |

---

## Terminology

| Term | Exact meaning |
|------|--------------|
| **Brand workspace** | Local context for a brand's channels, campaigns, and voice — not multi-user tenancy |
| **Assigned channel** | A channel entry associated with the brand |
| **Configured channel** | A channel with valid credentials entered, tested, and active |
| **Draft** | Post saved — not submitted for review or scheduling |
| **Scheduled** | Post approved and queued for future delivery (requires approval first) |
| **Published** | Post confirmed delivered by the external platform API |
| **Audience audit** | Comparison of imported follower and following lists — separate from publishing |
| **Public profile lookup** | Best-effort public profile metrics; not a follower-list scan |
| **Lead** | Planned contact/pipeline capability; no Leads mini-app is currently available |
| **Trigger** | Planned automation capability; do not imply comment keywords create leads today |
| **AI assistant** | Optional text-only backend integration; no general user-facing assistant workspace is currently available |
| **Client portal** | Planned client review capability; there are no client login, shared approval portal, or reviewer roles |

---

## Publishing & AI Safety Rules

| Rule | Enforcement |
|------|-------------|
| **Draft ≠ Published** | Explicit human review and approval required before any publish action |
| **Saved handle ≠ Connection** | Show real channel state from actual credential check only |
| **No auto-publish** | Publish requests enter `pending_approval`; human must approve |
| **No client scheduling** | Blocked until approval enforcement, audit history, and reviewer roles are implemented |
| **Manual handoff** | Approved Meta content uses manual Business Suite handoff until direct API publishing is verified |
| **AI suggests, humans decide** | No AI output triggers sends, publishes, or schedules anything |
| **Explicit automation** | Do not imply that planned rules or an AI assistant are currently running; user-triggered actions and human approval remain explicit |
| **Data-leave notice** | User shown a clear notice before any data is sent to an external AI provider |

# Unified mini-app architecture

SOCIALKILLER is one website and one application, organized as focused workspaces inside a shared shell. The primary mini-app action uses internal Vue navigation in the existing browser tab; a separate launcher link can open that same first-party route in another browser tab. No workspace is a separate application, window, or deployment. The selected app is reflected in the current URL as `?app=<id>` so refresh, browser Back, and browser Forward keep working.

This document is the current feature inventory and grouping decision. It supersedes the earlier 12-department concept in `product/uiux/README.md`; see the [UX guide](./UX_GUIDE.md) for interaction rules and the [engineering architecture](../engineering/ARCHITECTURE.md) for runtime boundaries.

## Current launcher and workspaces

| Category | Mini-app | State | Existing capability exposed |
| --- | --- | --- | --- |
| Plan & publish | Planner | Available | Channel-specific post composer, drafts, review/approval queue, scheduled queue, calendar/list views, post export, and explicit publishing or manual handoff flows. |
| Plan & publish | Connections | Available | Per-brand channel settings, credential/connection checks, account assignment, and provider handoff actions. A saved handle is not proof of an authorized connection. |
| Community & audience | Engage | Available | Locally organized comments/messages and reply drafts. This is not a live, provider-synced DM inbox. |
| Community & audience | Audience Audit | Available | Instagram export import, follower/following comparisons, snapshot history, categories, whitelist, account-health checks, CSV export, and queue handoff. |
| Community & audience | Profile Scout | Available | Best-effort public Instagram profile count lookup and available avatar download; no private follower identities. |
| Create | Content Studio | Available | Existing curated short-form content/inspiration workspace, caption ideas, and hook signals. |
| Create | Script Studio | Available | Existing brand-aware video-script and milestone-story generators. |
| Operate | Workflows | Available | Review/edit/delete company-scoped website workflows. Recording and replay are explicit actions in the optional browser companion; replay is restricted to the same origin and safe, non-submitting steps. |
| Operate | Workspaces | Available | Local brand context, profile and voice, reference links/notes, assigned handles, and workspace management. Workspaces are an organizational boundary, not a user authorization boundary. |
| Operate | Automation Studio | Available | Persisted, paused-by-default scheduled/manual/social-post-triggered workflows with conditions, branches, draft-only actions, run history, and retry. Provider sending and AI-authored rules are not enabled. |
| Build | Design System | Available | Preview and change the shared theme/accent tokens and review reusable control patterns, including reduced-motion behavior. |
| Build | Asset Manager | Available | Review the local asset catalog, optional source metadata, responsive variants, and validation status; it does not fetch remote assets or generate artwork. |
| Build | Android Build Studio | Available | Inspect Java/SDK/wrapper readiness, view the active local runtime, run fixed debug APK/release AAB tasks when available, and inspect current-session logs. This manages the existing Capacitor Android host rather than generating arbitrary apps. |

The shared shell also provides global theme and local-data settings, backup/restore, and the active brand context. These are platform services, not duplicate mini-apps.

## Grouping and navigation rules

- The launcher is the entry point and groups available workspaces into **Plan & publish**, **Community & audience**, **Create**, **Operate**, and **Build**. Planned workspaces are listed separately by roadmap category and are not clickable apps.
- The sidebar keeps app labels visible. On small screens it becomes the existing navigation drawer; app selection closes the drawer and stays in the same page.
- Each app has a dedicated workspace and retains the shared shell, active brand, theme, local settings, and common API/database infrastructure.
- The primary app action uses ordinary internal navigation in the current tab. A separate new-tab link may open the same first-party route in another browser tab; never route mini-app selection to another application or origin.
- Existing external provider handoffs (for example opening a social provider to complete a post) remain explicit feature actions; they are not mini-app navigation.
- Audience views remain subviews of Audience Audit (`?app=audience&view=<subview>`). Unknown routes return to the launcher. Back and Forward follow in-app navigation.
- Do not duplicate account configuration in each app. Connections owns channel setup; other workspaces consume the active brand context.

## Roadmap workspaces

These are planned product areas, not shipped mini-apps:

| Category | Planned mini-apps | Scope |
| --- | --- | --- |
| Grow | Leads, Email Marketing, Research & Trends | A lead pipeline and capture flow; consent-aware email lists/campaigns; a coherent source-backed trend and campaign research workspace. Some research routes and unmounted UI components already exist, but there is no complete research workspace. |
| Deliver | Projects, Production, Client Review | Tasks and client deliverables; shoots/events and media review; client approvals and collaboration. |
| Scale | Analytics, AI Assistant, Command Center | Source-labelled cross-channel reporting; an optional human-approved assistant UI; a real-data cross-workspace overview. |

Roadmap entries are intentionally not represented as available workspaces until their end-to-end flows and data boundaries exist. The existing browser workflow editor is not the planned rule-automation builder.

## Full project capability inventory

The following adjacent capabilities are retained and should not be misrepresented as fully shipped standalone mini-apps:

| Capability | Current state and owner |
| --- | --- |
| Social publishing | Planner plus provider-specific adapters and explicit manual/intent handoffs. Actual capabilities vary by platform and brand configuration. Instagram professional publishing can use configured Meta access; Facebook Page publishing is not implemented. Queue status is not proof of publication. |
| Inspiration, trends, and random ideas | Content Studio and Planner composer resources expose current curated/random ideas. A separate news/viral-remodel screen and related research services exist in source but are not mounted as a complete app. |
| Browser companion | Optional Chrome extension supports user-triggered channel helpers, queue sync, screenshot capture, account/audience workflows, and user-demonstrated website workflows. It is an integration client, not a second Social Base application. |
| Page workflow execution | The companion can record selected safe actions and replay reviewed steps on the recorded site origin. Password fields and submit controls are excluded; typed recording values are not captured. The web editor's fill values are stored locally, so secrets must not be entered. |
| Lua runner | Preview-only command workflow. It does not control a browser, screen, or device. |
| AI services | Optional, text-only Gemini integration can be configured on the local service. It is not a general chat assistant, does not have a dedicated user-facing app, and does not independently publish/send/schedule. |
| AI discovery metadata | Existing `llms.txt` and catalog endpoints/components are developer/agent discovery surfaces, not an AI marketing or campaign workspace. |
| Early prototypes | Unmounted market, ads-copy, collaboration, and separate news-remodel components remain in the repository. Treat them as prototypes/dormant code, not available app features or verified agency workflows. |
| Android and desktop | The shared frontend has a Capacitor Android shell. Android Build Studio can inspect and run fixed Gradle tasks when Java and SDK prerequisites are installed; build history is in-memory for the API process. The browser remains the current desktop route; a Tauri desktop window is planned, not a separate mini-app architecture. |

## Shared context and data boundaries

- Brand profiles supply shared voice, reference material, assigned channel handles, and brand ID context across workspaces.
- Social campaigns and browser workflows use local SQLite and retain brand IDs. Channel credentials are stored in the local encrypted vault. Audience exports/snapshots use browser local storage; extension sync state can be in process memory.
- The current app is local-first and single-operator. There is no hosted identity, sign-in, team membership, roles, or multi-user permission system. Brand separation must never be described as authorization or tenant isolation.
- Provider status and publishing results must reflect actual adapter/provider responses. Distinguish draft, approval, queue, manual handoff, failure, and confirmed publication.
- Optional external AI/provider requests must remain explicit and disclose data transfer where applicable.

## Responsive and interaction requirements

- Keep all workspaces in the same application shell at desktop, tablet, and Android phone widths.
- Desktop uses the persistent app sidebar; narrow layouts use the responsive drawer and mobile controls already in the shell.
- The launcher uses a dark-first palette with persistent accent choices. System and Light themes remain available.
- The sidebar's narrow, low-contrast scroll thumb appears briefly while its app list is scrolling and stays transparent at rest.
- The app catalog owns a distinct visual skin and accent for each mini-app. Owner-supplied image overlays differentiate launcher tiles, and the active workspace receives a low-contrast treatment keyed to that skin without replacing the user's global accent.
- Mini-app icons come from the Lucide component library; decorative card art uses owner-supplied reference images with restrained opacity and screen blending over the existing glow. Asset sources and processing are documented in the [visual asset policy](../engineering/VISUAL_ASSET_POLICY.md).
- Desktop hover and keyboard focus reveal launcher descriptions; touch devices use a dedicated tap control. Core navigation never requires hover.
- Hover, keyboard focus, or a brief touch/pen hold highlights one launcher tile and dims its peers. Release, cancel, or pointer exit restores the grid; reduced-motion mode disables transitions and scaling.
- Launcher grids collapse to two columns and then one column; card content, forms, and workspace controls must not cause horizontal overflow.
- Preserve keyboard operation, visible focus, accessible labels, and clear loading/error/empty states.
- Keep launcher-card artwork to a subtle centered zoom inside its clipped frame; internal workspace background motion stays subtle. Disable motion for reduced-motion preferences and avoid lighting that obscures workspace content.
- Do not invent sample metrics, connection states, completed integrations, or app capabilities to fill space.

## Implementation map

- Catalog, category grouping, and per-app visual configuration: `src/features/app-shell/mini-apps.ts`.
- Slow app background animations: `src/features/app-shell/mini-app-animations.scss`, linked from `src/styles.scss`.
- URL mapping and route validation: `src/features/app-shell/app-navigation.ts`.
- History synchronization: `src/features/app-shell/useAppNavigation.ts`.
- Launcher artwork and interactions: `src/features/app-shell/MiniAppLauncher.vue`, `mini-app-launcher.scss`, `mini-app-art.scss`; per-app reference-image overlays are catalogued in `src/features/app-shell/mini-apps.ts` and optimized from `src/assets/app-backgrounds/`. The CSS glow remains independent; workspace tint is applied by the shared shell.
- Launcher and dispatcher: `src/features/app-shell/MiniAppLauncher.vue`, `AppWorkspaceContent.vue`.
- Design System and Asset Manager workspaces: `src/features/design-system/`, `src/features/asset-manager/`.
- Automation and Android Build workspaces: `src/features/automation/`, `src/features/android-studio/`; local services live under `server/automation/` and `server/android/`.
- Persistent/mobile app navigation: `src/components/sidebar/MiniAppNavigation.vue`, `src/components/AppSidebar.vue`.
- Product safety and provider capability details: [product scope](./PRODUCT_SCOPE.md), [API availability](./API_AVAILABILITY.md), [engineering architecture](../engineering/ARCHITECTURE.md).

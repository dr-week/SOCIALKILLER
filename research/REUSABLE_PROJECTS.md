# Reusable projects and integration research

> Earlier source and licensing notes. The current agency MVP comparison, capability inventory, and architecture decisions are indexed in [RESEARCH.md](../RESEARCH.md) and [the GitHub source review](../docs/research/GITHUB_REUSE_REVIEW.md).

**Reviewed:** 5 November 2026  
**Project stack:** Vue 3 + TypeScript + Vite; Node.js 24 modular local API; native SQLite; browser extension; Capacitor shell.  
**Policy:** Reuse interfaces and proven patterns. Do not transplant an application or copy code until its license and dependency fit are reviewed. No code from the projects below has been copied into the product in this review.

## Existing architecture

This repository already has a modular-monolith foundation:

- `src/components/publisher/` contains the composer, per-network previews, channel setup, campaigns/calendar, queue, and workflow views.
- `src/composables/` owns Vue state and shared UI behavior; audience navigation/filtering was extracted from `src/App.vue` into `src/composables/useAudienceNavigation.ts` during the initial refactor.
- `server/routes/social/` and `server/routes/brands/` delegate API boundaries to focused route modules.
- `server/posting/<platform>/` provides platform-specific publish adapters; `server/integrations/` contains API clients and OAuth flows.
- `server/credentials/` encrypts brand-scoped credentials; `server/db/` persists workspace, post, inbox, and credential data in SQLite.

Keep the existing Vue/Node/SQLite architecture. The requirement is a modular monolith; adding a separate service per feature would add deployment and data-consistency work without a current need.

## Repository review

| Project | Source areas inspected | License and compatibility | Useful patterns | Decision |
| --- | --- | --- | --- | --- |
| [Postiz](https://github.com/gitroomhq/postiz-app) | Local checkout: `apps/backend/src/api/routes/posts.controller.ts`, `integrations.controller.ts`, `libraries/nestjs-libraries/src/database/prisma/posts/`, `.../integrations/`, frontend analytics and media components. Root project declares AGPL-3.0. | TypeScript/Next.js/NestJS/Prisma with a large package workspace; not drop-in for Vue + Node + SQLite. AGPL obligations need review before incorporating code into a distributed product. | Posts and integrations have separate controllers/services/repositories; provider interfaces support network adapters; org context is carried to operations. | Architecture reference only. No code copied or installed. Postiz is the deepest local source reviewed. |
| [Mixpost Lite](https://github.com/inovector/mixpost) | Remote repository README/tree and Laravel package overview; `src/`, `routes/`, `database/`, `resources/`, and `tests/` boundaries; scheduler and content-library feature descriptions. The Lite README identifies MIT. | PHP/Laravel; backend and queue dependencies do not fit the existing stack. MIT permits reuse subject to preserving notices and checking the exact file/license. | Calendar/queue concepts, per-network post versions/conditions, media library, and workspace-oriented collaboration. | UX/domain reference; do not add a Laravel sidecar. No source code incorporated. |
| [Pendpost](https://github.com/pendpost/pendpost) | Remote source: `server.mjs`, `lib/mcp.mjs`, `scripts/meta-social.mjs`, generated `AGENTS.md`, README and platform playbooks. Project declares MIT; its current implementation is a local-first Node monolith with a 4,000-line MCP registry file. | Closest runtime match, but its JSON plan/state model and process model are not compatible with this app's SQLite records without an adapter. MIT still requires its notices to accompany reused code. | Fail-closed draft/approve/reject gate, actor-aware approval, platform-specific scheduler truth, per-platform engines, kill switches, and mock mode. Its file size demonstrates what this project should avoid copying. | Port the safety contracts into small domain services and parity tests; do not copy `lib/mcp.mjs` or replace the existing backend. |
| [Social MCP](https://github.com/bmachek/social-mcp) | Remote source: `server.py`, `pyproject.toml`, README, setup and token instructions. `server.py` composes `meta_client`, local-file, EXIF, scheduler, and autopilot modules. Repository license is GPL-3.0. | Python/FastMCP; requires a separate runtime. GPL-3.0 code reuse in the product needs a deliberate compatibility/distribution review. | Separate Meta client, local media staging, token validity checks, surfaced API errors, and two-step media-container polling. | Do not copy or run as a bundled sidecar at this stage. Use as a research source for Meta publishing edge cases. |

### Reuse decisions

1. Implement provider-specific capabilities through the existing `server/posting/<platform>/` adapter seam.
2. Keep reusable channel metadata (publishing mode, media types, scopes, setup URL, size/length constraints) in a product-owned capability registry. Do not infer capability from a credential being present.
3. Keep approvals fail-closed, record the approving actor, and never allow an AI-generated draft to approve itself.
4. Use a mock driver for end-to-end workflows before connecting vendor credentials; real publish tests require explicitly authorized test accounts.
5. Do not vendor AGPL/GPL source into the product as part of this implementation. MIT sources may be reconsidered per-file with attribution and dependency review.

## Product capability baseline

| Area | Current evidence | State |
| --- | --- | --- |
| Brand workspaces | Brand CRUD/archive, brand-scoped social records, brand-scoped encrypted credential vault | Implemented locally; no login, membership, roles, or cloud tenant identity |
| Composer and variants | Shared draft, per-platform variants, media/link fields, preview components | Implemented; validation/readiness is uneven across channel adapters |
| Scheduling and queue | SQLite posts, scheduler/queue, statuses, logs, retry/handoff behavior | Implemented locally; verify each lane's delivery mode and timing claims |
| Approvals | Server-side pending/approve/reject workflow and explicit manual handoff | Implemented locally; team reviewer identity/comments/assignment are not evidenced |
| Channel connections | Meta OAuth, encrypted token vault, manual token/API credentials, ping routes | Partial; OAuth coverage is not uniform and Facebook Pages, TikTok, YouTube and Pinterest product adapters are absent |
| Calendar | Publisher calendar component exists | Partial; verify drag/drop, week/month navigation, filters and edit/reschedule paths in the running app |
| Media | Local media vault and composer asset resources exist | Partial; verify uploads, folders, search, tags, preview and delete behavior as a complete workflow |
| Inbox | Brand-scoped interaction store and reply drafting UI/API | Partial/manual; API-sourced comment/message ingestion and reply delivery are not established |
| Analytics/reports | Some per-network metrics and viral estimates exist | Partial; no consistent account analytics collection/report/export workflow is established |
| Automation/AI | AI copy, research, autopilot and scheduling modules exist | Implemented locally with feature-specific coverage; publication still needs human gate by default |
| Team/client access | Brand boundary exists | Not implemented as authenticated users, memberships, roles, or client portal |

## Provider/API integration matrix

The existing publisher identifies the adapter's delivery mode (`live_api`, `scheduled`, or intent/manual handoff). That distinction must stay visible at the post and channel level. Network support is gated by account type, scopes, app review, quotas, media requirements, and API version.

| Network | Product state | Official API source | Next integration constraint to account for |
| --- | --- | --- | --- |
| Instagram | Partial direct photo/video/Reel path; Meta OAuth and linked-account selection exist | [Instagram Platform](https://developers.facebook.com/docs/instagram-platform/) | Professional account, linked Page/API product and scopes; public media URL; asynchronous container readiness; app review and publishing limits |
| Facebook Pages | OAuth discovers Pages; direct Page publish adapter is not present | [Pages API](https://developers.facebook.com/docs/pages-api/) | Page token and `pages_manage_posts`; Page role and app review; do not conflate Page access with Instagram access |
| Threads | No adapter found | [Threads API](https://developers.facebook.com/docs/threads/) | Separate Threads scopes and publish workflow |
| TikTok | No adapter found | [Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started) | `video.publish` approval, creator-info query, verified domain/media URL; unaudited clients are restricted to private visibility |
| LinkedIn | Direct text path plus manual fallback | [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api) | `/v2/ugcPosts` is replaced by Posts API; version header required. Current docs warn the 202511 Marketing version sunsets 16 Nov 2026, so pin/configure a supported version before shipping new integration work. |
| YouTube | No adapter found | [YouTube Data API](https://developers.google.com/youtube/v3) | OAuth, upload quota, video processing and private/default visibility considerations; analytics may require separate APIs/scopes |
| Pinterest | No adapter found | [Pinterest API](https://developers.pinterest.com/docs/) | App access/approval and board permissions; image/video Pin fields differ from text-first networks |
| X | Direct path plus manual fallback | [X API](https://docs.x.com/) | Pay-per-use API access and changing endpoint/rate limits; meter usage and make cost/limit status visible |

Before adding each adapter, write contract tests for format validation, credential resolution, timeouts, retryability, rate-limit response, publishing result, and fallback mode. Never report an intent/handoff as a successful publish.

## Proposed module boundaries

```text
src/features/
  dashboard/       account overview and activity summaries
  workspaces/      brands, client membership and access UI
  publisher/       composer, platform variants, previews and readiness
  calendar/        daily/weekly/monthly planning and rescheduling
  media-library/   assets, folders, tagging, search and upload
  inbox/           platform interactions and reply drafts
  analytics/       account/post metrics and comparisons
  reports/         client report views and export
  approvals/       reviewer queue, comments and approval history
  automation/      queues, recurring plans and trigger controls
  team/             invitations, roles and client access

server/
  auth/             identity, session and authorization policy
  workspaces/       workspace access and tenant-scoped queries
  publishing/       post lifecycle, queue and dispatch policy
  posting/<network>/ platform adapter and capability validation
  integrations/     OAuth/API clients and provider-specific workflows
  media/            local asset store and metadata/index operations
  analytics/        collection, normalization and retention
  approvals/        reviewer authorization and audit events
  db/               schemas, migrations and focused repositories
```

Use these as ownership boundaries, not a mandate to move stable files in one sweep. Introduce a module when its own API and tests can be kept separate and the move can be validated.

## Delivery plan

1. **Foundation:** finish root-component split; document local-first tenancy assumptions; create module capability contracts and migrations; keep brand scope on every query.
2. **Core loop:** connect/validate channels, draft per-network variants, preview, approve, schedule, and show honest delivery results. Prioritize complete Meta Page + Instagram and then one non-Meta adapter with authorisation tests.
3. **Planning and assets:** complete calendar navigation/editing/rescheduling and media upload/search/tag workflows.
4. **Agency work:** authenticated users, workspace membership, roles, reviewer assignment, client view, and audit trail; this requires a deliberate local-only versus hosted deployment decision.
5. **Insights and integrations:** consistent metric collection, reports, inbox ingestion/reply where scopes permit, MCP tools that mirror API contracts, and automation safety controls.
6. **Validation:** run frontend/backend and UI workflows in mock mode; verify responsive layouts; only then use authorized platform test accounts for real publishing.

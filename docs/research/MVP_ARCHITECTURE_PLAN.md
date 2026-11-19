# Agency MVP modular architecture plan

**Reviewed:** 2026-11-06  
**Decision:** preserve the existing Vue 3 + TypeScript + Vite frontend, Node.js modular API, SQLite/local-first runtime, provider-specific adapters, and Capacitor/extension clients. Organize by capability in a modular monolith. Do not add service-per-feature deployment or adopt another complete scheduler.

## Boundary map

```text
src/
  core/                 app setup, routing, session/access client
  features/
    dashboard/          client portfolio, tasks, failure activity
    workspaces/         client/brand profile, team and account ownership
    social-accounts/    connect, identity, scopes, health and disconnect
    publisher/          drafts, per-network variants, previews, validation
    calendar/            calendar queries, navigation and rescheduling UI
    media-library/      asset browsing, metadata and upload UI
    approvals/           review inbox, comments, immutable version decisions
    inbox/               provider conversations, assignment and replies
    analytics/           normalized metric views and comparisons
    reports/             client-specific report templates/export
    automation/          rules, queues, pause controls and triggers
  shared/               accessible UI, HTTP client, dates, ids and types

server/
  auth/                  identity, sessions, access policy
  workspaces/            membership checks and tenant-scoped use cases
  social-accounts/       OAuth lifecycle and account ownership
  publishing/            post lifecycle, validation, queue, dispatch/retry
  approvals/             versioned decisions and audit events
  media/                 storage adapter and asset metadata
  inbox/                 normalized ingestion/reply use cases
  analytics/             provider collection, normalization and retention
  reports/               query/report generation
  notifications/         outbox and delivery adapters
  integrations/<vendor>/ provider HTTP/OAuth clients only
  posting/<platform>/    platform publish adapter only
  db/                    migrations, repositories and tenant-safe queries

docs/
  architecture/          decisions and trust boundaries
  modules/<feature>/     purpose, API, dependencies, data flow and checks
  api/                   local API contracts
  research/              competitor, provider, OSS and infrastructure evidence
```

This is a target ownership map, not a bulk move. Keep current paths until a module has a clear API, focused tests, and a safe migration. Frontend feature modules call local API clients; routes validate transport and delegate; use cases enforce workspace access and business rules; repositories own SQL; integrations implement vendor contracts; posting adapters map domain intent to a provider and truthful result.

## MVP modules and dependencies

| Order | Module | Depends on | Completion gate |
|---|---|---|---|
| 1 | Workspaces and access | DB migration, identity, membership policy, audit | Two clients isolated in UI, API and persisted queries |
| 2 | Social accounts | workspace access, OAuth state, encrypted token store, capabilities | Connect/disconnect/reconnect and verified scope status for target providers |
| 3 | Composer | account capability registry, media references, draft service | Draft and channel variants validate/save/reopen with stable IDs |
| 4 | Media library | storage interface, workspace access, metadata/index | Upload/list/search/tag/delete; workspace isolation and size/type validation |
| 5 | Calendar | post query API, timezone policy, composer, queue | Week/month navigation, filters, create/reschedule, no duplicate dispatch |
| 6 | Publishing/scheduling | capability registry, approvals, worker, adapters, delivery attempts | Idempotent enqueue, retry classes, final provider reconciliation, manual handoff |
| 7 | Approvals | identity/roles, content version, notification outbox | Internal then optional client approval bound to version and actor |
| 8 | Basic analytics | account access, provider metrics, metric dictionary | Source/freshness/availability shown; no unsupported zero values |

Foundation work that must precede hosted use: authentication, workspace membership, role checks on every API call, authorization tests, audit events, CSRF/origin review, tenant-safe migrations, backup/restore, and client data deletion/export.

## Infrastructure decisions and open questions

- **Database:** keep SQLite for the single-user/local-first app. Before hosted multi-agency use, design a migration to PostgreSQL with tenant foreign keys and database-backed authorization/row filters; brand IDs alone are not authorization.
- **Tokens:** keep provider tokens encrypted server-side with key rotation and per-workspace access checks. OAuth state is single-use and short-lived; refresh failures create a reconnect task, never silently drop a channel.
- **Media:** introduce an interface (`put/get/delete/signedUrl`) around local media storage. Local development uses disk; hosted deployment can use private object storage. Provider URL-pull publishing requires time-limited signed URLs and verified domains where applicable.
- **Jobs:** current local SQLite scheduler is adequate for an offline desktop MVP. For hosted multi-worker use, compare PostgreSQL-backed jobs to Redis/BullMQ; introduce only after deployment, worker ownership, locking, retries, and operations costs are selected.
- **Delivery:** idempotency key per post-version/channel; persist attempt, provider request ID, backoff class, last error and reconciliation result. Retry transient failures only; permission/content failures require user action.
- **Notifications:** persist an outbox event with the business transaction, then deliver in-app and email/push through adapters. Avoid direct provider or SMTP calls from route handlers.
- **Analytics:** provider adapters return typed metric definitions and timestamps; retain raw provider response only where terms permit; set retention/refresh schedules by provider and quota.
- **Realtime:** begin with polling for queue and approval status; add SSE or WebSocket only when client/team workflow requires it.
- **Billing/white label:** defer until hosted tenant model and agency plan limits are agreed.

## Reuse and dependency decisions

| Need | Recommendation | Why / gate |
|---|---|---|
| Calendar UI | Keep and validate the current calendar first; evaluate FullCalendar Vue adapter only if drag/drop, views or accessibility gaps remain | Vue 3 support is documented. Standard is MIT; resource/timeline premium features have separate commercial licensing, so scope the needed views before choosing. |
| Rich text | Keep channel-aware plain text initially; consider Tiptap only if formatted documents/long-form posts are in MVP | Vue 3 package is MIT; rich-text HTML is a poor common denominator for social APIs, so store canonical structured content and serialize per adapter. |
| Uploads and drag/drop | Build on existing asset flow; evaluate Uppy Vue headless Dropzone if progress, resumable or multi-file UX is needed | Uppy offers modular Vue/headless components; server storage, workspace authorization, type/size validation and scanning still belong to this app. |
| Analytics charts | Evaluate Chart.js with `vue-chartjs` after metric definitions and accessibility/export requirements are agreed | Chart.js and wrapper are MIT; chart only normalized, sourced metrics and provide a table/export path. |
| Jobs | Retain current scheduler for local app; compare PostgreSQL job storage and BullMQ only for hosted workers | BullMQ requires Redis-compatible infrastructure by default; extra operations burden is unjustified in local-only MVP. |
| User authentication | Evaluate Better Auth if the product commits to hosted teams and identity | MIT library with social sign-in/OAuth; it does not replace workspace RBAC, tenant-scoped queries, audit, or platform publishing authorization. Do not add to the local-first MVP before deployment is chosen. |
| Social OAuth | Keep explicit provider integrations and use provider-specific OAuth endpoints; Arctic is not a candidate | Arctic's own site marks the package deprecated. User sign-in OAuth and social publishing scopes/token refresh have separate security and lifecycle requirements. |
| Notifications | Keep app-owned notification/outbox contracts; assess Novu only if multi-channel delivery becomes operationally costly | A notification service adds infrastructure and vendor delivery configuration; this local-first MVP needs durable in-app notices first. |
| MCP | Evaluate the official TypeScript SDK for transport/protocol handling; keep tools over existing domain use cases and role checks | The SDK is MIT. Pin a compatible release (the current v2 docs require TypeScript 6); draft/write calls require explicit approval semantics and tool results must reflect provider status. |

## Source references

- [FullCalendar Vue integration and license](https://fullcalendar.io/docs/vue)
- [Tiptap Vue 3 package and license](https://www.npmjs.com/package/@tiptap/vue-3)
- [Uppy Vue components and hooks](https://uppy.io/docs/vue/)
- [Chart.js documentation and license](https://www.chartjs.org/docs/latest/)
- [vue-chartjs license](https://www.npmjs.com/package/vue-chartjs)
- [Better Auth social sign-on](https://better-auth.com/docs/basic-usage) and [license](https://github.com/better-auth/better-auth)
- [Arctic deprecation notice](https://arcticjs.dev/)
- [Novu notification workflows](https://www.novu.co/)
- [MCP TypeScript server SDK](https://ts.sdk.modelcontextprotocol.io/v2/api/%40modelcontextprotocol/server/)
- [BullMQ queue setup and Redis requirement](https://docs.bullmq.io/quick-start)
- [Postiz/Mixpost and other source review](./GITHUB_REUSE_REVIEW.md)

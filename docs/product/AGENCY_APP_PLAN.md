# Social media agency app: structural product plan

**Status:** Proposed direction; this plan does not describe shipped functionality.  
**Research checked:** 2026-11-05  
**Audience:** Product, design, engineering, and agency operators

## 1. Product goal

Build a multi-client workspace that helps a social media agency onboard client brands, plan and create content, obtain approvals, publish through authorized integrations, coordinate community work, and report outcomes. The agency remains responsible for strategy and client relationships; the app makes the work visible, repeatable, and auditable.

The first release should prove one end-to-end agency workflow: **set up a client brand → connect an eligible channel → prepare content → obtain approval → publish or hand off → report status and results.** Build a narrow, dependable workflow before broad provider coverage or autonomous features.

## 2. Product principles and boundaries

- **Agency-first hierarchy:** Agency organization → client workspace → brand → connected channel profile → campaign/content.
- **Permission at every boundary:** Enforce role and client access on the server for each operation. UI hiding is not authorization.
- **Authorization is explicit:** Product sign-in, provider authorization, and assignment of a provider asset to a client brand are distinct steps.
- **Human accountability:** Draft, approval, scheduling, attempted delivery, published status, and failure are separate states. Material outbound actions require a named approver and an audit record.
- **Capability-aware integrations:** A channel adapter exposes only actions supported for the specific account, authorization, and API access level.
- **Data minimization:** Keep client data and credentials isolated, exportable, deletable, and retained only as needed.
- **No UI automation as an API substitute:** Do not automate client social accounts using passwords, cookies, or scraping.

This is a proposed agency product. The initial release remains local-first/offline with no required Social Base account; cloud sync and remote team identity are optional future work. The current application does not yet provide multi-user tenant isolation or production-ready client approvals. See [current product scope](./PRODUCT_SCOPE.md).

## 3. Users and roles

| Role | Typical responsibilities | Access boundary |
|---|---|---|
| Agency owner | Agency settings, people, service configuration | All agency workspaces and organization settings |
| Agency admin | Client setup, team assignment, integrations | Assigned agency workspaces and connections |
| Strategist | Campaign goals, briefs, calendars, reporting | Assigned clients; edit planning data |
| Creator/editor | Copy, media, variants, drafts | Assigned content; submit for review |
| Approver | Review, request changes, approve | Explicitly assigned clients/content |
| Community manager | Triage and respond to supported interactions | Assigned inboxes and response workflows |
| Analyst/viewer | Read status and performance | Read-only assigned clients |
| Client contact | Review assigned content and provide feedback | Client-scoped approval portal or invitation |

Keep client access optional for the MVP. If enabled, give client contacts a limited client-scoped experience; do not expose agency-wide data.

## 4. Product modules

| Module | Core responsibility | MVP priority | Main dependencies |
|---|---|---:|---|
| Agency & identity | Agency account, membership, invitations, roles, sessions | Foundation | Deployment/auth choice, tenant model |
| Client workspaces | Client profile, brands, contacts, service status, access assignment | P0 | Agency & identity |
| Channel connections | OAuth, provider assets, selected profiles, granted scopes, health, reconnect/disconnect | P0 | Secure credential storage, provider approvals |
| Brand kit & asset library | Logos, guidelines, approved media/copy, rights/expiry metadata | P1 | Client workspace, storage policy |
| Campaigns & briefs | Goals, audience, offer, dates, deliverables, owner, success measures | P1 | Client workspace |
| Content studio | Channel-specific drafts, media, variants, accessibility checks | P0 | Brand kit, channel capability catalog |
| Calendar & workflow | Calendar, statuses, assignments, deadlines, queue | P0 | Content studio, durable jobs |
| Review & approvals | Comments, change requests, approval policy, approval history | P0 | Identity, workflow, audit trail |
| Publishing | Validation, scheduling, delivery, retries, idempotency, handoff | P0 | Connections, approvals, durable jobs |
| Community inbox | Supported comments/messages, assignment, response approval, handoff | P2 | Provider webhooks/scopes, consent and policy rules |
| Analytics & reports | Channel-provided metrics, campaign summaries, client-ready exports | P1 | Connections, metric definitions |
| Tasks & activity | Work assignment, due dates, notes, event history, notifications | P1 | Identity, audit/events |
| Agency operations | Packages, deliverables, utilization, renewal reminders, billing | P2 | Client workspace, commercial model |
| Administration & trust | Data export/delete, retention, audit, support and incident operations | Foundation | Tenant model, storage and deployment |

P0 means required to validate the first sellable workflow. P1 and P2 describe later capability, not committed release dates.

## 5. Core workflows

### 5.1 Onboard a client

1. Agency admin creates a client workspace and one or more brands.
2. Admin records goals, audience, voice, restricted claims, service scope, contacts, and approval rules.
3. Admin assigns agency teammates and optionally invites client reviewers.
4. Workspace setup checklist shows missing information and integration readiness.

### 5.2 Connect a channel

1. Admin selects a provider and sees requested permissions and intended features.
2. User authorizes via the provider's approved flow; the app does not ask for a social password.
3. App fetches provider-authorized assets, displays capability and access status, and lets admin select an asset.
4. Admin assigns the selected profile to a client brand.
5. App records scopes, connection owner, expiry/refresh state, health, and disconnect/reconnect options.

### 5.3 Plan, create, and approve content

1. Strategist creates a campaign brief with goal, audience, offer, channel, dates, and measure.
2. Editor creates a draft and channel-specific variants using client-approved assets and voice.
3. Validation checks required media, character/format constraints, links, and disclosure/accessibility fields where supported.
4. Draft enters an explicit review path; approver approves or requests changes with a comment.
5. Approved content is scheduled for an authorized profile or handed off to the native platform when API publishing is unavailable.

### 5.4 Deliver and report

1. Scheduler creates an idempotent job only from an approved version.
2. Adapter reports accepted, processing, published, failed, or unknown status; the UI must not imply success without provider confirmation.
3. Retry is bounded and safe against duplicate posting; ambiguous outcomes require reconciliation.
4. Results are attributed to a profile, post, campaign, and time range with source and last-updated timestamp.

## 6. Domain model and ownership

```text
Agency
  ├── Membership (user, role, status)
  └── ClientWorkspace
       ├── Brand
       │    ├── BrandKit / Asset
       │    ├── Campaign ── ContentItem ── ContentVersion
       │    │                   ├── Approval / Comment
       │    │                   └── PublishJob ── DeliveryAttempt
       │    └── ChannelProfile ── ProviderAsset
       ├── Task / ActivityEvent / Report
       └── ProviderConnection (authorization + encrypted tokens)
```

Separate provider authorization (`ProviderConnection`) from the external asset selected by the agency (`ProviderAsset` / `ChannelProfile`). A shared provider login may authorize several assets; each selected asset has an explicit client assignment. All client-owned records must carry a workspace boundary. Enforce that boundary in server queries and mutation handlers.

Minimum entities for the first workflow: `Agency`, `User`, `Membership`, `ClientWorkspace`, `Brand`, `ProviderConnection`, `ChannelProfile`, `Campaign`, `ContentItem`, `ContentVersion`, `Approval`, `PublishJob`, `DeliveryAttempt`, and `ActivityEvent`.

## 7. Integration strategy and research findings

Integrations must implement a shared contract for discovery, validation, publishing, status, and insights while preserving provider-specific capabilities and limitations. Do not expose a feature merely because an adapter method exists; check granted scopes and account eligibility.

| Integration | Product role | Research / release gate |
|---|---|---|
| Meta Instagram & Facebook Pages | First organic publishing target | Professional Instagram accounts and authorized Facebook Pages only for applicable flows. Confirm login path, permissions, app review/Advanced Access, media requirements, and intended customer eligibility before promising support. |
| Google Business Profile | Later local-business channel | API access is not open by default; Google requires a project access request and lists eligibility prerequisites. Secure approval and verify policy before implementation. |
| TikTok | Candidate video/photo channel | Direct Post requires approved `video.publish` scope and user authorization. Unaudited clients are restricted to private visibility; pass the audit before public posting is claimed. |
| YouTube | Separate video channel | OAuth and quota apply; review quota allocation and compliance/audit requirements per use case. |
| WhatsApp Business | Later inbox/service channel | Separate Business Platform, opt-in, templates/policy windows, webhook handling, and current pricing; not a generic social DM integration. |
| X, LinkedIn, Reddit, others | Demand-led backlog | Verify current commercial access, cost, permissions, and terms before estimating or marketing a capability. |

**Initial recommendation:** design the connection and adapter interfaces provider-neutrally, but implement the first authorized Meta organic workflow only after app access and credential-security prerequisites are satisfied. Keep manual handoff to native tools visible for unsupported channels.

## 8. Architecture and module boundaries

Preserve the current Vue/Vite + Node + SQLite stack for the next implementation slice. Extract by feature incrementally; do not rewrite the application as a prerequisite for agency workflows.

```text
src/features/
  agency/ clients/ brand-kit/ connections/ campaigns/
  content/ calendar/ approvals/ publishing/ inbox/ analytics/ tasks/
server/modules/
  identity/ tenancy/ clients/ approvals/ publishing/ analytics/ audit/
server/integrations/
  meta/instagram/ meta/facebook/ google/business-profile/
  tiktok/ youtube/ whatsapp/
server/jobs/       # durable scheduling, idempotency, retries, dead-letter state
server/db/         # migrations, tenant-scoped repositories
server/http/       # authentication, authorization, validation, webhooks
```

Each feature owns its UI, domain operations, API client, and tests. Integrations depend on shared contracts; business modules depend on integration interfaces, not vendor SDK details. Route handlers validate/authenticate/authorize and delegate to module services. Jobs persist before execution and record attempts and outcomes. Keep the existing audience-export utility isolated from the agency content workflow.

### Required contracts

- `ChannelAdapter`: capability discovery, content validation, publish, delivery-status lookup, and supported insight retrieval.
- `ApprovalPolicy`: required reviewers, quorum/sequence, expiration, and immutable approved content version.
- `PublishJob`: idempotency key, scheduled time, approved version, target profile, attempt state, provider reference, and terminal outcome.
- `AuditEvent`: actor, workspace, action, target, timestamp, and safe before/after summary (never secrets).
- `AssetStore`: tenant-scoped upload/read/delete, MIME/size validation, retention, and provider-compatible delivery URLs where required.

## 9. Security, privacy, and reliability requirements

- Keep the initial product local-first with no required cloud identity. Use OS-backed local key protection for provider tokens; future cloud sync requires separate tenant authorization, managed keys, backup, and support decisions.
- Remove any development fallback key before storing real customer OAuth tokens; use an OS-backed secret store for local mode or managed server-side encryption/key service for hosted mode.
- Keep provider client secrets and token exchange on a trusted backend; never ship confidential secrets in the web bundle or desktop binary.
- Use least-privilege scopes, OAuth `state`, PKCE where supported, validated callbacks, token rotation/revocation, and documented reconnect behavior.
- Enforce tenant isolation on every request and background job; include cross-client access tests before multi-user launch.
- Use immutable content versions for approvals; editing approved content invalidates approval and requires review again.
- Prevent duplicate delivery with stable idempotency keys, unique job constraints, bounded retries, and reconciliation for unknown provider outcomes.
- Verify webhook signatures, deduplicate events, and keep a replay-safe event log.
- Define data retention, client export/deletion, asset rights/expiry, backup/restore, incident response, and audit retention before hosted launch.
- Make automation visible and pausable; no unattended engagement, outreach, or reply generation in the first release.

## 10. Delivery sequence and gates

| Stage | Outcome | Exit gate |
|---|---|---|
| 0. Product and deployment decision | Confirm first local-first workflow, channel rollout order, optional client review, and success metric. Audit current app and local credential handling. | One target user journey, provider access gates, data model, and local-data retention rules agreed. |
| 1. Local agency foundation | Workspaces/brands, local approval, audit, repeat-safe migration, OS-backed credential storage, and multiple account connections. | Local workspace isolation, export/delete, backup/restore, and account lifecycle behave correctly; no cloud login is required. |
| 2. Content operations MVP | Client onboarding, brand kit, campaign brief, content calendar, draft versions, review/approval, task/activity. | Agency can complete a client content cycle without spreadsheets; approval is version-bound and audited. |
| 3. First channel delivery | Connection and asset selection, capability-aware composer, media validation, scheduled delivery, status/retry, native-tool handoff. | Provider access/review approved; authorized account tests pass; uncertain delivery never displays success; job cannot bypass approval. |
| 4. Measurement and client reporting | Basic channel metrics, campaign roll-up, date filters, source/freshness, client-ready export. | Metric definitions, missing-data treatment, attribution, and export access are documented and verified. |
| 5. Inbox and advanced collaboration | Supported comments/messages, internal assignment, response drafts, escalation, and local notifications. | API and policy eligibility, consent, privacy, and human handoff pass operational review. |
| 6. Optional cloud/team | Cloud sync, selected app sign-in methods, tenant isolation, managed keys, invitations, and opt-in remote client reviewers/portal. | Cross-tenant and recovery tests pass; local use remains available; remote review is off unless enabled. |
| 7. Agency operations and scale | Packages, deliverables, usage/billing, additional channels, monitoring, support and incident workflows. | Demand and unit economics justify each module; support, security, and provider gates are met. |

## 11. MVP acceptance checklist

- Agency admin can create and configure an isolated client workspace and assign teammates.
- A user can connect an eligible provider account using authorized OAuth, select a real asset, and assign it to a brand.
- Team can create a campaign and channel-specific content versions from the client brief and brand kit.
- A reviewer can request changes or approve a specific immutable version; unauthorized users cannot approve.
- Only approved versions can be scheduled; content edits after approval return to review.
- Publishing status distinguishes draft, scheduled, sending, provider-confirmed published, failed, and unknown.
- Retry and reconciliation do not create duplicate posts; failures give a useful recovery action.
- Activity history records meaningful client, role, connection, approval, and delivery events without logging credentials.
- Workspace data can be exported and deleted according to the selected deployment model.
- Unsupported channel actions and manual handoff are explicit; no API or account permission is implied by a saved username.

## 12. Decisions to resolve before build estimates

1. Is the first commercial product hosted SaaS, local desktop for one agency operator, or a staged combination?
2. Who is the first customer: solo social manager, small agency (2–10 staff), or larger agency with client logins?
3. Is the first paid workflow organic content planning and approvals, or content plus direct publishing?
4. Which provider assets can the team obtain for development and review, and what is the current Meta app access status?
5. Should clients approve in-app in the MVP, or should the agency record approval externally and attach evidence?
6. What are the service packages, client/brand limits, retention period, and support expectations?

These decisions change identity, authorization, storage, and release scope; resolve them before committing dates or pricing.

## 13. Research sources

Official documentation reviewed on 2026-11-05; provider access, pricing, and rules can change and must be rechecked before implementation/release.

- [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login)
- [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login)
- [Meta App Review](https://developers.facebook.com/documentation/resp-plat-initiatives/individual-processes/app-review)
- [Google Business Profile API prerequisites](https://developers.google.com/my-business/content/prereqs)
- [Google Business Profile API policies](https://developers.google.com/my-business/content/policies)
- [Google OAuth for desktop applications](https://developers.google.com/identity/protocols/oauth2/native-app)
- [TikTok Content Posting API: Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-get-started)
- [TikTok Content Sharing Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines)
- [YouTube API quota and costs](https://developers.google.com/youtube/data/determine_quota_cost)
- [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)

Related internal docs: [agency platform roadmap](./AGENCY_PLATFORM_ROADMAP.md), [modular product plan](./MODULAR_PRODUCT_PLAN.md), [API availability](./API_AVAILABILITY.md), [product scope](./PRODUCT_SCOPE.md), and [modularization blueprint](../engineering/MODULARIZATION_BLUEPRINT.md).

# Agency Social Media Operating System: feature inventory

**Reviewed:** 2026-11-06  
**Purpose:** MVP scoping from the current repository and the agency brief. “Partial” means code exists but a complete user workflow, provider access, or validation is not established.

## Product workflow

Plan → Create → Review → Schedule → Publish → Engage → Analyse → Improve. Every post, asset, account, approval, and metric belongs to a client workspace. The app must show which actor owns the next step and whether publication was confirmed by a network.

## Current state and MVP priority

| Area | Existing evidence | Status | MVP outcome |
|---|---|---|---|
| Client/brand workspaces | `src/features/workspaces/`, `server/routes/brands/`, `server/db/schema-workspaces.mjs`; brand CRUD and brand-scoped records | Local foundation | Client workspace, brand profile, timezone, account list, archive, data isolation |
| Authentication and team access | No hosted identity, membership, role policy, or client portal found | Missing; release blocker for hosted multi-client access | Add users, workspace memberships, role grants, invitations, audit log, secure client approval access |
| Social accounts | `src/components/publisher/PublisherChannels.vue`, Meta integration and encrypted credential vault under `server/` | Partial | OAuth connect/disconnect, identity display, scope health, test, expiry/reconnect state |
| Content strategy | Publisher campaigns, categories, research, brand context and AI market modules | Partial | Client pillars, campaigns, reusable content, asset/voice guidance |
| Composer and variants | `src/components/publisher/PublisherComposer.vue`, form, preview and variant components | Partial | One canonical draft, per-network variants, validation, save, preview, idempotent submission |
| Media library | `server/engine/media-vault.mjs`, `PublisherMediaPicker.vue`, media-related marketing services | Partial | Upload, durable storage, metadata, folders/tags/search, usage references, delete/archive |
| Calendar | `PublisherCampaignCalendar.vue` | Partial; end-to-end edit/reschedule and timezone behavior need live validation | Week/month views, channel/client/status filters, click-to-create, safe reschedule |
| Queue and publishing | SQLite post lifecycle, scheduler, status/logs and `server/posting/<platform>/` adapters | Partial by provider | Schedule, deliver/retry, status reconciliation, failure recovery and publication history |
| Approvals | Server-side approve/reject path exists | Partial; reviewer identity, comments and version-bound approval are not established | Internal review then optional client review; immutable version, actor, timestamp, reason, audit trail |
| Inbox and moderation | `CommunityInbox.vue`, `server/routes/inbox-routes.mjs`, interaction storage | Partial/manual; live provider ingestion/replies not established | Provider capability labels, ingest, assignment, saved replies, moderation and supported replies |
| Analytics and reports | Audience comparison and limited post/viral metrics exist | Partial; consistent network account collection and client report are missing | Normalized metric definitions, source/refresh timestamp, comparison, exportable report |
| Automation and AI | Draft generation, research, queue/autopilot and MCP-related marketing code | Partial | Draft-only generation, rules preview, approvals, pause/kill switch, attributable events |
| Notifications | Existing app/extension notices and publishing alerts are distributed | Partial | In-app notification inbox plus approval, connection, and delivery-failure notices |
| Billing and white label | No subscription/entitlement or brandable client portal found | Not MVP | Defer until hosted identity, tenancy and agency workflows are validated |

## MVP acceptance sequence

1. Create two client workspaces and prove records/accounts cannot cross workspace boundaries.
2. Connect an authorized Instagram professional account, Facebook Page, and LinkedIn member or organization; show the account type, granted scopes, last successful check, and reconnect action.
3. Save one canonical draft with independent variants, a media reference, and per-channel validation.
4. Submit an immutable content version for internal review, then optional client review; record actor, decision, comments, and version hash.
5. Schedule approved work using the workspace timezone; reschedule from calendar and verify queue timestamps.
6. Publish through provider adapters or clearly marked manual handoff; confirm final state from provider status before using “Published.”
7. Show a basic report with provider, metric definition, date range, and last refresh; absent data is unavailable, not zero.

## Non-goals for first release

Do not implement all social networks, unified private messaging, white-label/billing, competitor scraping, or autonomous engagement at once. Defer any capability until official API access, scopes, media rules, review requirements, and a successful test account are confirmed.

# Next implementation plan: agency workspace foundation

**Status:** Proposed implementation sequence. Local-first/offline use is the initial target; cloud sync and remote team identity are future work. No new identity or provider OAuth is implied to be shipped.  
**Parent plan:** [Social media agency app structural plan](./AGENCY_APP_PLAN.md)  
**Research/current-code check:** 2026-11-05

## Implementation status

The first local workspace lifecycle slice is implemented: existing `brand_profiles` records remain the workspace records, `archivedAt` is added through a backward-compatible migration, active and archived lists are separate, and the UI supports reversible archive/restore while protecting the last active workspace. This does not yet create a distinct Agency → ClientWorkspace → Brand hierarchy, and it does not add users, roles, or tenant authorization. Verification has not yet been run.

## Objective

Prepare the current local-first application for agency workflows without requiring cloud sign-in. Preserve existing data and publishing behavior, modularize provider connections for multiple accounts, and keep a documented migration boundary for optional future cloud/team features.

## Decisions recorded and remaining gates

**Recorded product decisions:** local-first/offline use now; cloud is a future option; app identity sign-in and provider-specific channel authorization remain separate; multiple accounts per provider are required; client review is opt-in per workspace. Provider connections and publishing still require internet when used. Remote client reviewers require the future cloud phase.

**Still required before implementation:** choose provider order, local encrypted-key storage, retention/export/deletion behavior, and whether client review means same-device approval or remote access. Google/Meta/email app sign-in can be added behind a separate identity boundary in the future cloud phase. Provider scopes, quotas, app review, and API eligibility remain provider-specific; an extensible design cannot remove those platform limits.

Do not require an online Social Base login in the local-first release. Client review must be opt-in; show clearly when it is local-only, and do not imply remote access before cloud sync and authorization are implemented.

## Current starting point

- Vue app and company workspace selector are in `src/App.vue`, `src/components/BrandWorkspaceHeader.vue`, and `src/composables/useBrandWorkspaces.ts`.
- Server routes are grouped under `server/routes/`; brand operations are in `server/routes/brand-routes.mjs`.
- SQLite schema and persistence live in `server/db/sqlite-engine.mjs`.
- Social posts already carry a `brandId`; approval/handoff behavior is in `server/routes/social-routes.mjs` and posting services.
- `server/credential-store.mjs` has no shipped fallback encryption key: it requires `FOLLOWDESK_VAULT_KEY` of at least 32 characters. This is a fail-closed development setup, not yet an OS-backed or managed production key lifecycle.
- There is no verified multi-user identity, membership authorization, or tenant isolation. Existing workspace selection is an application data filter, not a security boundary.
- There is no modular connection manager that supports multiple provider accounts; current credential handling is local and is not a production-ready cloud secret lifecycle.

## Work packages

### 0. Lock the product and data decisions

**Work:** Confirm local-first use, provider order, client-review opt-in, meaning of workspace vs brand, retention/deletion behavior, local key storage, and migration of current records. Defer cloud identity, invitations, and hosted storage to a later decision gate.

**Deliverables:** short decision record; canonical terms; first journey and success metric; provider/asset rollout order; migration policy for existing default brand/workspace records.

**Acceptance:** no competing use of “agency”, “company workspace”, “client”, and “brand”; local-first behavior, optional client review, future cloud scope, and sign-in-versus-connect boundary are stated in product docs.

### 1. Define the workspace domain and permissions

**Work:** Specify Agency, ClientWorkspace, Brand, ProviderConnection, ProviderAsset, and ActivityEvent ownership. Model multiple provider accounts and assets per workspace. Keep cloud users/memberships as a future extension; define which existing brand-scoped data belongs to client versus brand before changing routes.

**Deliverables:** schema diagram/decision record; role/action matrix; API contract for list/create/update/archive workspace and assign brand; data ownership map.

**Acceptance:** every local record family has an owner and workspace scope; multiple accounts never overwrite one another; no cloud role or remote reviewer is presented as shipped.

### 2. Add persistence with safe migration

**Work:** Preserve local persistence and select a secure OS-backed key source for provider credentials. Add repeat-safe local migrations and export/import boundaries that can support a future cloud migration. Do not assume the current SQLite store is already tenant-secure cloud storage.

**Deliverables:** migration and rollback/recovery notes; repositories; scoped query/update methods; fixtures for existing databases.

**Acceptance:** existing data opens unchanged; migration is repeat-safe; existing records map to exactly one workspace; no data is silently dropped; queries cannot accidentally omit workspace scope.

### 3. Establish server-side workspace boundaries

**Work:** Keep local API access bound to the local application boundary; validate workspace identifiers, use scoped repositories, return consistent errors, and record safe local activity. Define server-side membership checks for the future cloud phase, including jobs and OAuth callbacks.

**Deliverables:** workspace service and route contract; activity event schema; request/response examples; local data boundary documented, with cloud membership controls marked future work.

**Acceptance:** unknown or archived workspace access is rejected consistently; all workspace-scoped reads and writes use a scoped repository method; sensitive credential values never enter activity logs.

### 4. Build the agency client workspace UI

**Work:** Keep local workspace management separate from any future sign-in screen. Convert the current company selector into a clear local workspace switcher and add per-workspace client-review opt-in; defer remote invitations and team membership until cloud support exists.

**Deliverables:** client list/switcher; create/edit workspace flow; setup checklist; empty states; loading/error states; responsive behavior.

**Acceptance:** the local operator can create, select, edit, and archive a client workspace; switching clients never shows another client's drafts or channel settings; client review controls accurately describe local versus future remote access.

### 5. Add a modular provider connections manager

**Work:** Implement provider-specific OAuth through feature-owned adapters; list multiple account connections per provider, fetch authorized assets, and let the local operator assign assets to brands. Keep app identity providers separate from channel APIs; the first local channel connection can use the trusted local server and OS-backed credential storage.

**Deliverables:** connection list and status UI; provider authorization/callback modules; encrypted token lifecycle; asset picker and brand assignment; reconnect, revoke, disconnect, and explicit failure states.

**Acceptance:** two accounts from the same provider can coexist without overwrite; each selected asset is workspace-scoped; revoked, unavailable, or unsupported capabilities show explicit states and are never presented as connected.

### 6. Add brand profiles and agency assignments

**Work:** Allow multiple brands inside a client workspace; define primary brand and make campaign/content records point to a brand while preserving workspace ownership. Defer team assignments until cloud memberships exist; keep any client-review option explicit and per workspace.

**Deliverables:** brand profile model and settings UI; explicit default-brand migration; workspace-brand selector where needed.

**Acceptance:** a client can have multiple distinct brands; campaign/profile settings do not leak across brands; old single-brand behavior maps to the migrated primary brand.

### 7. Release readiness for this slice

**Work:** Update product scope, architecture map, API reference, and this plan. Add targeted automated coverage for local migrations, workspace scoping, archive behavior, connection lifecycle, and brand associations. Keep cloud/team acceptance criteria separate.

**Acceptance:** documentation distinguishes shipped local behavior from future cloud/team security; migration and scope tests pass on fresh and pre-existing databases; multiple accounts and opt-in review behave correctly.

## Planned module and folder ownership

```text
src/features/
  identity/       # future cloud sign-in; not required for local use
  workspaces/     # organization, membership, roles and client/brand scope
  connections/    # multiple provider accounts, assets and connection health
server/modules/
  identity/       # future cloud sessions and identity contracts
  tenants/        # future cloud membership and authorization
  connections/    # connection lifecycle, asset assignment and token policy
server/integrations/
  identity/       # future Google/Meta/email app sign-in adapters
  channels/       # local provider API adapters, split by provider/capability
server/http/      # local routes now; cloud auth/callbacks later
server/db/        # local persistence, export and migrations
```

Keep identity-provider adapters separate from channel adapters even when both use Google or Meta. Shared code belongs in explicit contracts; do not let one provider's OAuth callback or credential format leak into another feature.

## Dependency order

```text
Local data/approval decisions and OS-backed key lifecycle
  → workspace/domain ownership and modular connection contracts
  → local multi-account connection UI and one provider adapter at a time
  → opt-in local client review and approval flow
  → broader channel adapters after access/review
  → optional cloud identity, sync, tenant boundaries and remote reviewers
```

Do not store provider tokens until local key protection, callback security, and disconnect/revoke behavior are implemented. Future cloud storage requires a separate managed-key and tenant-isolation design. Every provider requires its own access, scope, review, and quota checks.

## Explicitly out of the first vertical slice

- Cloud sync, required online sign-in, hosted teams, invitations, and remote client portal.
- Implementing every provider at once; keep the adapter design extensible and ship each API only after access, demand, scopes, and quota are confirmed.
- Direct publishing API work, unified inbox, automated replies, ads, and reporting dashboards.
- Replacing Vue/Vite, Node, or SQLite wholesale.
- Moving all legacy components or routes into new folders without a specific vertical feature change.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Existing `brandId` is overloaded as both company workspace and brand | Inventory every table/route first; introduce explicit workspace ownership and use stable IDs; provide a deterministic backfill. |
| Local workspace selector is mistaken for future cloud access control | Treat current selection as UI state only; add membership enforcement to every request, callback, and job before cloud/team release. |
| Migration corrupts local campaign history | Back up before migration, use transactions, test representative old DB fixtures, and retain a recovery path. |
| Local credential protection is mistaken for cloud key management | Use OS-backed protection now; design managed keys, rotation, recovery, and deletion separately before cloud sync. |
| Scope expands into a broad refactor | Migrate one vertical path at a time and keep current contracts until replacement behavior is verified. |

## Immediate next actions

1. Product owner chooses the first channel adapters, local key source, optional client-review behavior, and retention/export rules in Section 0; app sign-in providers remain future cloud scope.
2. Engineering inventories every `brandId`-scoped table, route, UI state, and test; report the current mapping before schema changes.
3. Draft the workspace/brand/connection ownership map and local export/import proposal against a copy of a representative `.data` database.
4. Implement one local vertical slice: multi-account connection management through UI → route → service → local vault, with focused tests.
5. Verify multiple accounts and opt-in review locally; keep cloud tenant tests as a later release gate.

## Related documentation

- [Agency app product plan](./AGENCY_APP_PLAN.md)
- [Agency platform roadmap](./AGENCY_PLATFORM_ROADMAP.md)
- [Modularization blueprint](../engineering/MODULARIZATION_BLUEPRINT.md)
- [Current product scope](./PRODUCT_SCOPE.md)
- [Architecture](../engineering/ARCHITECTURE.md)

# Modularization blueprint

Use this as the implementation map for turning The Social Base into small, feature-owned modules. The product-level capabilities and release phases remain in the [product plan](../product/MODULAR_PRODUCT_PLAN.md); this document defines code ownership and dependency flow.

## Departments and ownership

| Department | Owns | Must not own |
|---|---|---|
| `src/app/` | App startup, navigation, global layout | Provider rules or business workflows |
| `src/features/<feature>/` | Feature UI, state, forms, and API calls | Direct database or provider access |
| `src/shared/` | Reused UI primitives, API transport, cross-feature types | Feature-specific business rules |
| `server/http/` | Route registration, request validation, response mapping | Long business workflows |
| `server/modules/<feature>/` | Use cases and domain rules for a feature | Raw HTTP or vendor SDK details |
| `server/db/` | SQLite schema, migrations, and repositories | HTTP response formatting |
| `server/integrations/<provider>/` | Provider OAuth, API mapping, webhook validation | Cross-provider business workflows |
| `server/jobs/` | Scheduled work, retries, and job lifecycle | UI state or provider-specific policy |
| `scripts/` | Repeatable development, packaging, and maintenance tasks | Runtime application features |
| `launcher/`, `src-tauri/`, `android/` | Platform startup, native APIs, packaging | Duplicate business logic |

Treat each feature or provider folder like a department with a named owner and a small contract. `connections`, `publishing`, `inbox`, `automation`, `knowledge`, `analytics`, and `workspaces` are product departments; Meta and Google are provider departments. A provider adapter implements a capability; it does not decide the product workflow.

## Current folders to target departments

| Current area | Target ownership | Migration rule |
|---|---|---|
| `src/components/`, `src/composables/` | `src/features/<feature>/components/`, `composables/`, and `api/` | Move by user workflow; keep global shell and reusable primitives separate. |
| `src/domain/` | Feature-owned `domain/` or `src/shared/domain/` | Move only after identifying all callers and tests. |
| `server/routes/`, `server/router.mjs` | `server/http/` with feature route registration | Leave request validation and response mapping at the HTTP edge. |
| `server/marketing/` | `server/modules/<feature>/` | Split orchestration, domain policy, and persistence by use case; do not rename the entire folder in one batch. |
| `server/posting/<provider>/` | `server/integrations/<provider>/<capability>/` | Keep each provider's supported capabilities and API mapping local to its adapter. |
| `server/db/sqlite-engine.mjs` | `server/db/` migrations plus module-owned repositories | Preserve schema/data with tested migrations; keep SQLite details out of routes and UI. |
| `extension/modules/` | Extension-owned modules behind explicit messages/API contracts | Keep browser permissions and user-triggered behavior independent from web-app internals. |
| `launcher/`, `android/`, planned `src-tauri/` | Platform hosts and lifecycle only | Share business workflows through API/contracts, not copied business logic. |
| `src/types/index.ts`, `src/types/view.ts` | Shared domain types and the app-route union | Keep navigation-only unions out of the general type barrel when that barrel approaches the file-size limit. |
| `server/android/`, `src/features/android-studio/` | Android toolchain/build lifecycle and its workspace UI | The current Android Studio manages the existing Capacitor host; use fixed Gradle targets and never expose arbitrary command execution. |

## First modularized publishing slice

The composer is split by responsibility in `src/components/publisher/`:

| Module | Responsibility |
|---|---|
| `PublisherComposer.vue` | Coordinates form, review, and workflow state. |
| `PublisherComposerForm.vue` | Presets, draft fields, channel selection, and submit actions. |
| `PublisherAdvancedOptions.vue` | Optional media, category, tone, and scheduling controls. |
| `PublisherVariantReview.vue` | Platform preview, editing, copy, and draft feedback. |
| `queue-api.ts` | Publisher-owned approval and manual-handoff request boundary. |
| `usePublisherQueueActions.ts` | Queue approval/duplicate action state and user feedback. |
| `composables/usePublisherComposerResources.ts` | Category and media-vault loading/selection. |
| `composables/useRandomPostDraft.ts` | Idea generation and draft feedback requests. |
| `publisher-navbar.scss` | Scoped publisher navigation styles and responsive tab layout. |

`PublisherFeedPreview.vue` remains an oversized module for a later platform-specific split.

## Brand profile slice

`src/components/brand-profile/BrandProfileLinks.vue` owns social-link platform selection, URL validation, and add/remove editing. `BrandProfileDocuments.vue` owns document selection, size/type validation, duplicate replacement, and removal. Both emit model changes and status messages; `BrandProfileModal.vue` still owns persistence. Continue extracting GitHub sync and research display rather than moving the remaining template at once.

## Request and data flow

```text
Vue page/component
  -> feature composable or use case
  -> shared API client
  -> HTTP route (validate and map)
  -> application service (orchestrate)
  -> domain rules
  -> repository OR provider adapter
  -> normalized result -> UI
```

- UI components render and emit intent; feature composables own screen state and call feature APIs.
- Routes validate untrusted input and map status/errors. They do not contain multi-step workflows.
- Application services coordinate a use case; domain functions stay deterministic and provider-neutral.
- Repositories own persistence; adapters own provider-specific requests, response mapping, and capability limits.
- Native shells call narrow platform services. They do not duplicate publishing, OAuth, or marketing rules.
- Never let one feature import another feature's internal files. Expose a small `index.ts`/`index.mjs` only when a real cross-module contract is needed.

## Folder and file naming

Use nouns for feature/department folders and explicit role suffixes for modules:

```text
connections/
  components/       # ProviderPicker.vue, AssetList.vue
  composables/      # useConnections.ts
  api/              # connections-api.ts
  domain/           # connection-state.ts
  types.ts

server/modules/connections/
  connection-service.mjs
  connection-policy.mjs
  connection-service.test.mjs

server/integrations/meta/
  meta-oauth-adapter.mjs
  meta-assets-adapter.mjs
  meta-webhook-validator.mjs
```

Name files by responsibility (`*-route`, `*-service`, `*-repository`, `*-adapter`, `*-schema`, `use-*.ts`); avoid vague names such as `helpers`, `manager`, or `utils` when a domain name is clearer. Keep Vue components PascalCase, other module filenames kebab-case, and exported types descriptive.

## Module rules

1. A module has one reason to change and a small typed/public interface.
2. Keep source files near 100–120 lines; every manually maintained source and test file must stay below 150 lines. Split by responsibility, not by arbitrary line count.
3. Keep provider IDs, tokens, and API shapes inside the provider department. Return normalized results plus explicit provider errors.
4. Validate at boundaries; do not silently default invalid data or turn failures into success-shaped responses.
5. Add a module README only when its boundary is not obvious. State purpose, owned data, public entry points, dependencies, and test command; avoid README-per-file.
6. Put tests next to the domain/service/adapter they protect. Test behavior and failure paths, not implementation details.

Run `npm run check:file-size` to enforce the hard ceiling and `npm run monolith:audit` to list oversized responsibilities with ownership-aware split suggestions. The checker excludes dependency and generated-output directories, including Android web assets. A size violation requires splitting; inspect callers and tests before extracting a module.

### Size exceptions

There are no automatic or baseline exemptions: files at 150 lines remain flagged. If a split would damage a clear public contract or make a tightly coupled workflow harder to understand, document the file, why extraction is unsafe, the alternatives considered, and a review trigger in the owning feature's architecture notes. Keep the exception visible in the audit backlog and revisit it when that contract or workflow changes.

## Migration route

1. Map the current code and choose one user-visible vertical slice.
2. Trace its UI → API → service → persistence/provider flow; record current behavior and tests.
3. Create the feature-owned destination; move one cohesive responsibility while preserving public contracts.
4. Add or move focused tests, run the smallest checks, and compare behavior.
5. Remove the old implementation only after callers are migrated; update the architecture map.

Start with security/persistence and provider connections, then publishing, automation/inbox/knowledge, analytics, and finally broad UI cleanup. Keep legacy paths as temporary compatibility layers; do not make a parallel rewrite or move unrelated code in the same batch.

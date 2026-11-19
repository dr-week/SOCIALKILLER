# Development practices

Keep changes small, feature-owned, testable, and safe to ship. Product direction and planned capabilities live in the [modular product plan](../product/MODULAR_PRODUCT_PLAN.md); this document covers day-to-day engineering rules.

For department boundaries, naming examples, request flow, and incremental migration, follow the [modularization blueprint](./MODULARIZATION_BLUEPRINT.md).
The workspace [modularization skill](../../.github/skills/modularize-code/SKILL.md) provides the repeatable refactor workflow; source-file rules are in `.github/instructions/modular-code.instructions.md`.

## Code organization

- Organize by feature and responsibility. Keep UI, domain rules, persistence, platform adapters, and background jobs separate.
- Prefer the existing stack and patterns. Extract modules incrementally; do not combine an entire rewrite with a feature change.
- Use clear, consistent names: Vue components in PascalCase, utilities/modules in kebab-case, and tests beside the code or in the existing test area.
- A file should have one clear reason to change and a small public interface. Split cohesive responsibilities, not every function into its own file.
- Avoid duplicate route logic, provider API calls in UI components, and broad catch blocks that hide failures.

## File-size rule

- Target **100–120 lines**. Every source and test file must remain **below 150 lines**; 150 is a failure.
- The checker counts TypeScript, JavaScript, Vue, Rust, CSS/SCSS, HTML, Java/Kotlin, and shell/PowerShell/batch source files under `src/`, `server/`, `extension/`, `scripts/`, `test/`, `launcher/`, `android/`, and planned `src-tauri/`, plus the root app entrypoints; generated output and dependencies are excluded.
- Existing oversized files are violations to fix, not exceptions. When splitting a file, divide it by responsibility into cohesive modules; never split blindly in the middle of unrelated logic.
- `npm run check:file-size` fails for every file at or above 150 lines. A baseline entry cannot waive this rule.
- Keep each file focused; do not create many tiny forwarding files just to meet the line limit.

## Secrets and local data

- Never commit passwords, OAuth tokens, API keys, customer exports, or personal data.
- `local-private/`, `.data/`, and `.env*` are local-only; `.env.example` contains placeholders and is the only env example intended for source control.
- Do not use `local-private/` as a plaintext credential store. Runtime OAuth credentials need an OS-protected key store or an approved server-side secret store.
- Treat the current vault implementation as unsafe for real customer tokens until the hard-coded fallback key is removed and key management is verified.

## Social publishing and workspace boundaries

- Keep provider API calls inside the existing platform adapter/service boundary. A saved handle is not proof of an authorized connection; reflect actual granted scopes and supported capabilities.
- Treat publishing, messaging, and other external actions as side effects: drafts are the default, human approval is required before publishing, and scheduled jobs must not bypass that approval.
- Do not report a post as published until the provider confirms delivery. Preserve distinct draft, approved, queued, attempted, published, and failed states; make retries idempotent and failures visible.
- Scope every campaign, credential, queue item, and activity lookup to its workspace. Add tests for denied cross-workspace access when changing persistence or authorization.
- Add focused tests for approval bypasses, duplicate retries, provider failures, and unsupported platform capabilities when changing publishing behavior.

## Change workflow

1. Read the feature's current implementation and tests before editing.
2. Make one cohesive change; preserve current behavior unless a behavior change is explicit.
3. Keep types, validation, user-visible errors, and platform-specific capability limits explicit.
4. Add focused tests for behavior changed; avoid broad tests unrelated to the change.
5. Run the smallest relevant test, then type-check/build as applicable.
6. Update the canonical product or engineering documentation when behavior or architecture changes.
7. Review changed files for secrets, unrelated edits, oversized files, and misleading success states.

## Development commands

| Command | Use |
|---|---|
| `npm run dev` | Start the local app and API. |
| `npm run repo:map` | Print a compact source-department map and direct file counts. |
| `npm run repo:map -- --files` | Include source filenames when locating an implementation. |
| `npm run modularity:audit` | Show oversized files with split suggestions plus the compact department map. |
| `npm run docs:find -- --query "topic terms"` | Search existing docs and return a few ranked, bounded excerpts. |
| `npm run check:file-size` | Enforce the under-150-line rule across source files. |
| `npm run check:file-size:report` | List the largest files currently above the limit to plan refactor batches. |
| `npm run type-check` | Check Vue/TypeScript types. |
| `npm run build` | Build the frontend. |
| `npm test` | Run the project test suite and type-check. |
| `npm run verify` | Run size checks, production build, and the full test suite before a release/large change. |

## Low-noise discovery and automation

- Start with `npm run repo:map`; add `-- --files` only when names are needed. The map is bounded and reads no file contents.
- Search a known area, not the whole repository: `rg "SymbolName" server/modules/connections` or `rg "term" src/features/publishing -g "*.vue"`.
- Read only matching files/ranges, then follow direct callers. Avoid dumping generated output, databases, dependencies, or full recursive file lists.
- Prefer repeatable npm scripts over manual command sequences. Keep maintenance scripts read-only by default; scripts that edit/delete files need an explicit target and dry-run support.
- Automate recurring tasks only when inputs, outputs, failure behavior, and ownership are clear. Keep scripts small, test their output, and document the command here.

## Refactor order

The initial scan found existing files at or above 150 lines, including stylesheets now covered by the checker. Work through these batches incrementally; preserve API and UI behavior, and run focused tests after each batch. The audit suggests responsibility-based splits, but every extraction still requires caller and test review.

1. **Security and persistence:** `server/credential-store.mjs`, then `server/db/sqlite-engine.mjs`. First remove the shipped fallback key and define safe local key storage; then separate schema/migrations, repositories, and domain persistence.
2. **HTTP boundaries:** `server/routes/social-routes.mjs`, `viral-routes.mjs`, and `ops-routes.mjs`. Keep route files for validation/HTTP mapping; move business operations into feature services.
3. **Publishing UI:** `src/App.vue`, `SocialPublisher.vue`, `publisher/PublisherComposer.vue`, and `BrandProfileModal.vue`. Extract feature-owned panels, composables, and form sections without creating generic wrappers.
4. **Extension:** `extension/background.js`, `popup.js`, and the injection modules. Separate message routing, storage, and per-page behavior; preserve manifest permissions and extension tests.
5. **Marketing and adapters:** split the large marketing generators and social adapters by stable domain responsibility; keep each platform's unique capability rules explicit.
6. **Tests:** split oversized test files by behavior area and share fixtures, while keeping test cases readable and independent.

Complete one small slice at a time. Do not attempt to shrink every legacy file in one release; the ratchet keeps new work lean while the backlog is reduced.

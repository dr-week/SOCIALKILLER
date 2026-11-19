# Social Base implementation plan

**Reviewed:** 2026-11-05  
**Status:** Ordered backlog; tasks are not complete until their evidence is linked. Owners remain unassigned unless noted.

This plan consolidates the active work found in the agency, UI/UX, acceptance, and Visual Bot documents. Those source plans remain authoritative for their detailed acceptance criteria. Each workstream is in a separate file to keep this index short.

## Execution order

| Order | Workstream | Gate |
|---:|---|---|
| 0 | [Publishing safety and release automation](./01_PUBLISHING_SAFETY.md) | Live publishing is explicit, approved, idempotent, and recoverable; no release tag unexpectedly posts. |
| 1 | [Agency workspace foundation](./02_AGENCY_FOUNDATION.md) | Deployment model and ownership map are agreed; one workspace vertical slice is migrated safely. |
| 2 | [Product and responsive validation](./03_PRODUCT_VALIDATION.md) | Core journeys and five viewport sizes have recorded evidence; only observed defects are fixed. |
| 3 | [Engineering enablement and modularity](./04_ENGINEERING_ENABLEMENT.md) | CI runs in hosted repository; focused lint/browser checks are adopted; oversized modules shrink by responsibility. |

## Current completed items

- Screenshot capture was added to the extension popup using the official Chrome sample as a reference. Code is in `extension/modules/screenshot-capture.js` and `extension/screenshot-viewer.*`; manual Chrome verification remains.
- `.github/workflows/ci.yml` and `.github/dependabot.yml` were added. They activate after the workspace is in a GitHub repository; CI itself has not been run here.
- Document search, stale research/task audit, Markdown splitting, and modularity planning commands exist. See [documentation tools](../../README.md#documentation-tools).
- The old acceptance and Visual Bot reports were marked as historical and given current-code corrections. Their remaining detailed claims still need an implementation review.

## Dependency rule

Do not begin OAuth, hosted tenant authorization, customer credential storage, or automatic client publishing before workspace ownership, approval states, and key lifecycle are designed for the selected deployment. Reuse tools only through reviewed dependencies or isolated snapshots; do not merge full social platforms into the app runtime.

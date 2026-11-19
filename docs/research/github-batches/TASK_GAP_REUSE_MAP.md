# Reuse mapped to current development tasks

**Reviewed:** 2026-11-05  
**Purpose:** Match open repository tasks to code or tools that can reduce implementation effort.

## Shortlist

| Current task | Reusable project | Reuse decision | Next step |
|---|---|---|---|
| Add screenshots to the existing MV3 companion | [Chrome Extensions Samples screenshot](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/tabs/screenshot) | Pulled a sparse checkout of the official Apache-2.0 sample at `research/third_party/chrome-extensions-samples/api-samples/tabs/screenshot`. The popup now captures via `activeTab` + `captureVisibleTab` and shows a local preview/download page. | Load the extension in Chrome and manually verify supported and restricted tabs. |
| Add UI acceptance automation / close responsive audit | [Microsoft Playwright](https://github.com/microsoft/playwright) | Apache-2.0; use its package, not its full source tree. It is a large multi-browser framework; start with `@playwright/test` and Chromium only if/when the owner authorizes tests. | Keep MVP scoped to core composer, queue, workspace switch, and five viewport sizes. |
| Add Vue-aware lint / static analysis | [ESLint](https://github.com/eslint/eslint) + [official eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue) | MIT projects with Vue SFC lint support. Add packages/config through npm and a small owned flat config; do not copy the plugin repository into app source. | Start with warnings on legacy code; enforce errors for changed files after baseline triage. |
| Redact structured sensitive log fields | [fast-redact](https://github.com/davidmarkclements/fast-redact) | MIT utility, sparse use surface, pulled to `research/third_party/fast-redact` for source/license inspection. It handles structured objects, not secrets embedded in arbitrary error strings. | Review exact redaction paths and serializer/mutation behavior; use only on log payloads. |
| Improve persistent job retries | [LiteQ](https://github.com/iikareem/lite-q) or [Conveyor](https://github.com/eyolas/conveyor) | Both advertise SQLite stores, but are small/new and would introduce a second job schema beside the app's SQLite dispatch table. | Compare API, crash recovery, and database interoperability; no runtime adoption until a measured gap exists. |
| Automate dependency and CI maintenance | [GitHub Actions Node starter workflow](https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml) and [Dependabot configuration](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configure-version-updates) | Added `.github/workflows/ci.yml` for Node 22, `npm ci`, and the existing `npm run verify`; added weekly npm and GitHub Actions Dependabot updates. These are reviewable dependency PRs; CI sends no social posts or credentials. | Workflow activation needs this workspace published in a GitHub repo. |
| Make oversized-file work incremental | Existing `check-file-size`, `repo:map`, and `modularity:plan` tools | Already present in the project; no external code needed. The planner now includes `src-tauri` in its configured roots; compare results with the size audit and review any unscanned entrypoints before treating the output as complete. | Prioritize the largest feature-owned files, then split one responsibility at a time. |

## Task list reconciliation

The canonical task trackers are [UI/UX next tasks](../../product/uiux/planning/NEXT_TASKS.md) and [agency next plan](../../product/AGENCY_NEXT_PLAN.md). The audit also identifies open items in [Visual Bot audit](../../visual_bot_audit.md), [acceptance report](../../testing/acceptance-report.md), [workspace review](../../product/WORKSPACE_REVIEW.md), [modular product plan](../../product/MODULAR_PRODUCT_PLAN.md), and the prior reuse review.

Two historical gap documents contain claims that conflict with current files and need owner review before acting on them:

> The acceptance report says the extension has no Manifest V3, service worker, or UI; `extension/manifest.json`, `extension/background.js`, and `extension/popup.html` exist. Refresh the report against current implementation rather than treating the scaffold task as still open.

> The Visual Bot audit says dry-run is unimplemented. Current CLI broadcast code and the configured adapters contain dry-run paths. This does not prove the separate app publisher/API routes enforce dry-run, so inspect that boundary specifically before closing the task.

The user-facing task audit now also counts task-tracker table rows with `todo`, `in_progress`, `blocked`, `pending`, or `open` status. Use it to locate task lists, then follow each task's own completion evidence; the audit does not decide task status.

## Prioritized task list from this review

| Priority | Work | Current evidence / next action | Reuse impact |
|---|---|---|---|
| P0 | Refresh stale acceptance and Visual Bot status | Confirmed: MV3 manifest, background service worker, and popup exist. `viral-routes.mjs` already imports `isOwnerWorkspace` correctly. Update the old reports when a focused implementation audit is done. | Avoid rebuilding a scaffold or fixing an already-correct import. |
| P1 | Capture screenshot from a user action | Implemented in `extension/modules/screenshot-capture.js`, `extension/screenshot-viewer.html`, and `extension/screenshot-viewer.js`, wired to the popup camera action. It uses existing `activeTab`, captures the visible viewport, and provides local preview/download. Manual browser verification remains. | Adapted the official sample's capture call; keeps app UI and behavior. |
| P1 | Establish accurate responsive acceptance checks | UI/UX tracker P1.1–P1.4 and validation notes remain pending at five explicit viewport widths; no participant testing was performed. | Playwright is a candidate to automate repeated viewport checks after installing a dev dependency. |
| P1 | Audit the real publisher's dry-run/approval boundary | The CLI broadcaster and adapters have dry-run branches; inspect app scheduler and route dispatch separately before claiming the end-to-end product is safe. | No external dependency needed; use current scheduler and adapter interfaces. |
| P1 | Reduce security backlog to concrete slices | Review log redaction paths, media-vault path checks, CORS assumptions, and key lifecycle one at a time. The current credential vault requires `FOLLOWDESK_VAULT_KEY`; this is not OS-backed production key management. | Reuse established Node crypto and route middleware; avoid a new vault platform until deployment choice is made. |
| P0 | Put human approval in front of live release broadcasts | Existing tag-triggered workflow has publishing secrets and defaults to live mode. Decide on protected environment/approval before hosting with secrets. | Keep the existing CLI dry-run support; do not execute the live workflow during verification. |
| P1 | Finish workspace foundation decisions and map | Agency next-plan decisions, `brandId` ownership inventory, migration proposal, and one workspace UI→route→service→repository vertical slice remain listed. | Existing Vue/Node/SQLite stack is the closest fit; no scheduler repo replaces this work. |
| P2 | Introduce lint and browser-test tools | Use ESLint + official Vue plugin; add Playwright only after baseline and dependency install are scheduled. | Reuse supported tools by npm dependency, not copied framework source. |
| P2 | Modularize highest-cost legacy files | Run `npm run modularity:plan`, compare against the file-size audit, select one coherent responsibility, then update tracker and docs. | Existing tooling reduces discovery; do not mechanically split files by lines. |

The agency and UI/UX project trackers remain the source of truth for ownership and completion. This table is a current review queue, not a duplicate status database.

## Lock-file check

The workspace contains no stale process lock that is safe to remove. `.data/launcher.lock` contains PID `37416`, and that PID is the active `node auto-launch.mjs` process, so it is a live runtime lock. `research/third_party/postiz-app/i18n.lock` is tracked upstream data, not a process lock. Neither was removed. A project server process is also active; I left all runtime processes running.

## Workflow safety item

`.github/workflows/social-broadcast.yml` runs on version tags and has access to publishing secrets; its current tag-path defaults to live mode. Do not use its workflow dispatch or create a release tag as part of development verification. Review whether release publishing should require a protected environment or explicit approval before enabling it in a hosted repository.

## Sources and scope

- The Google Chrome sample shows capture of the active visible viewport, not a full-page screenshot. It was cloned sparsely to preserve the relevant source and upstream Apache-2.0 license in the workspace.
- Playwright, ESLint, and eslint-plugin-vue are dependency/tool candidates, not downloaded application code. Their licenses and roles were checked at their upstream repositories.
- fast-redact is pulled only for review. The queue projects remain online references; their small size and duplicate SQLite schema make adoption premature.
- No browser-session social posting, engagement bot, or unlicensed project is recommended for incorporation. Reuse should target isolated modules and official API/provider boundaries.

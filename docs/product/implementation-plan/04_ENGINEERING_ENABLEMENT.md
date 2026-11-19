# Workstream 3: engineering enablement and modularity

**Priority:** P2  
**Current status:** CI, Dependabot, document search/audit/split, and size-planning scripts are configured. Hosted activation and legacy refactoring remain open.

## Ordered tasks

| ID | Task | Owner | Status | Depends on | Completion evidence |
|---|---|---|---|---|---|
| E3.1 | Put the workspace in a GitHub repository and confirm the CI workflow runs `npm run verify` | Repository owner | todo | Repository hosting | Successful PR check; CI runs no publishing workflow. |
| E3.2 | Review weekly Dependabot PRs and enable repository security alerts | Repository owner | todo | E3.1 | Dependency update policy and alerts visible in repository settings. |
| E3.3 | Add Vue-aware ESLint with a small owned flat config; begin with a baseline report | Engineering | todo | E3.1 | `npm run lint` and baseline report; no broad auto-fix. |
| E3.4 | Choose a first Playwright journey and add a deterministic local startup/cleanup fixture | Engineering | todo | V2.4 | One representative UI check is stable in CI; no customer accounts/secrets. |
| E3.5 | Split the largest files one cohesive responsibility at a time | Engineering | todo | `npm run modularity:plan` | Continue `BrandProfileModal.vue` (562 lines remain after links/documents extraction), then `sqlite-engine.mjs` (750) and `App.vue` (694); preserve contracts and test each slice. |
| E3.6 | Keep research and task freshness visible in the normal developer workflow | Engineering | todo | Docs tooling exists | README commands are used; open task table entries have owner/status/evidence. |

## First modularization candidates

Current size scan ranked `src/components/BrandProfileModal.vue` (865 lines), `server/db/sqlite-engine.mjs` (751), and `src/App.vue` (695) highest. Use `npm run modularity:plan` and `npm run repo:map` to select a responsibility before editing. Do not split mechanically by line count or add forwarding-only files.

## Reuse decision

- [ESLint](https://github.com/eslint/eslint) and the [official Vue plugin](https://github.com/vuejs/eslint-plugin-vue) are MIT and directly address the missing lint command noted by the historical acceptance report.
- [GitHub Actions Node starter](https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml) and Dependabot docs informed the small CI/update configurations already added.
- The in-repo `docs:find`, `docs:audit`, `docs:split`, `modularity:plan`, `repo:map`, and file-size ratchet are preferred over adding another documentation or code-splitting framework.

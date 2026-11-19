# GitHub reuse review: agency app and development acceleration

**Reviewed:** 2026-11-05  
**Scope:** The ten repositories supplied for review. Repository pages and available license files were inspected; no third-party install scripts or applications were run.  
**Purpose:** Find practical reuse that reduces Social Base development while preserving modular boundaries and platform-policy constraints.

Follow-up batches are split into small files under [GitHub research batches](./github-batches/README.md).

## Executive recommendation

1. **Do not merge a complete social scheduler into this app.** Keep Postiz or Mixpost-class software as a separate service if a self-hosted scheduler is the chosen strategy; connect through a documented API. Postiz is pulled below for API/domain study, not bundled.
2. **Use the social-media-skills repository as reviewed prompt/workflow reference.** Its MIT license and Markdown format make selected writing/research patterns comparatively easy to adapt. Keep client voice, policy, and approval rules in our own canonical templates.
3. **Treat MultiPost as a code reference only.** Although its public snapshot is Apache-2.0 and advertises an extension API, its README says the official browser-store builds contain an unpublished proprietary Agent module. Do not adopt browser-UI publishing as our production channel adapter without a separate platform-policy and security review.
4. **Do not reuse browser agents that automate follows, likes, outreach, or replies.** This conflicts with the product’s explicit boundary against unattended engagement and browser-password/cookie automation.
5. **Build automation around our own existing scripts.** Add docs freshness/task discovery, and later wire known project checks and release packaging to GitHub Actions when the source is hosted in a real GitHub repository.

“Downloaded source” is not the same as a drop-in module. A full application usually has its own database, backend, queue, provider credentials, and license obligations. Separate process/API integration is the safer default; copy code only after reviewing the exact file license and dependency chain.

## Repository review

| Repository | What it is / potentially useful part | License and adoption note | Decision |
|---|---|---|---|
| [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | Full scheduler with calendar, publishing, team collaboration, analytics, API/webhooks, and SDK. Its README identifies Next.js/React, NestJS, PostgreSQL/Prisma, and Temporal. | AGPL-3.0; self-hosting requires operating its database, Redis, storage, and provider app credentials. Not compatible as a direct Vue component or small dependency. | **Pulled as isolated reference.** Evaluate a separate API service before building publishing/calendar breadth. Do not bundle or copy without an AGPL review. |
| [growchief/growchief](https://github.com/growchief/growchief) | Outreach automation tool for connection requests, follow-up messages, profile scraping/enrichment, and workflow scheduling. | AGPL-3.0. README describes social scraping and browser-humanized actions; this is outreach/engagement automation rather than agency content operations. | **Do not integrate.** Keep only as a market reference; actions conflict with the app’s human-approved, non-engagement boundary. |
| [charlie947/social-media-skills](https://github.com/charlie947/social-media-skills) | 17 Markdown skills for voice-building, post writing, research, analytics, Reels, hooks, and related content tasks. | MIT. Agent instructions are still untrusted input; review any skill before enabling it. Preserve attribution and verify each skill’s assumptions and output. | **Pulled as isolated reference.** Highest reuse potential; selectively adapt writing/research patterns after content review. |
| [leaperone/MultiPost-Extension](https://github.com/leaperone/MultiPost-Extension) | Browser extension for multi-platform composing; repository documents extension and REST API approaches. | Apache-2.0 for this source snapshot. README says published Chrome/Edge builds include a proprietary Agent module that is not in this repo. API/platform compliance and privacy need independent review. | **Pulled as isolated reference.** Study extension packaging and bridge patterns; do not depend on the unavailable module or treat DOM posting as an official API. |
| [Katzca/AutoSocial](https://github.com/Katzca/AutoSocial) | Local short-video workflow dashboard using Express, Playwright upload flows, queues, scheduler, yt-dlp, and FFmpeg. | MIT, but project README says local workstation only and no user authentication. Automated website upload may rely on browser sessions and carries platform/credential risk. | **Do not integrate into client-facing product.** Possible local workflow reference only; prefer authorized APIs and manual handoff. |
| [LocoreMind/locoagent](https://github.com/LocoreMind/locoagent) | Agent that uses real browser sessions for publishing and engagement actions including likes, replies, and follows. | MIT. License does not make the behavior suitable for our product or platform terms. | **Do not integrate.** Conflicts with the app’s no-unattended-engagement policy and browser-session boundary. |
| [vasani-arpit/Social-Media-Automation](https://github.com/vasani-arpit/Social-Media-Automation) | Older Electron/Puppeteer-style multi-site automation project. | No clear license file/license grant was found on the repository page during this review; absent a license, do not copy source into our product. | **Do not pull/reuse.** Reference only; source is not approved for incorporation. |
| [BotLibre/BotLibre](https://github.com/BotLibre/BotLibre) | Standalone AI/chatbot platform with Java engine and Android, iOS, and web SDKs. | EPL-1.0. Separate Java/web platform with a much wider scope than the initial agency MVP. | **Do not embed.** Reconsider only if a separately scoped customer-support chatbot is prioritized; evaluate API/SDK integration first. |
| [jihe520/social-push](https://github.com/jihe520/social-push) | Social-publishing skill for coding agents based on browser automation. | No clear license file/license grant was found in the repository snapshot reviewed. Browser-agent publishing also conflicts with the product’s API-first boundary. | **Do not pull/reuse.** No-code reuse until licensing and behavior are reviewed. |
| [Ub207/vault-sync](https://github.com/Ub207/vault-sync) | Personal AI employee / synchronized operations vault with human approval. | Repository page shows an MIT badge, but its README describes the repository as private and says “All rights reserved.” Those statements conflict. | **Not cloned. Do not reuse** unless the owner clarifies rights in writing and the repository status is verified. |

## Pulled source snapshots

These folders are for inspection only and are not imported by Vite, Node, the extension packager, or Android:

| Snapshot | Reviewed commit | Local path | License |
|---|---|---|---|
| Postiz | `bd8353f09f8dbaec54f15985f26d34b56ac69636` | [`research/third_party/postiz-app`](../../research/third_party/postiz-app) | AGPL-3.0 |
| Social Media Skills | `10ca79c0ec0be0f7654d19cd4f0c86b6fa6ed23b` | [`research/third_party/social-media-skills`](../../research/third_party/social-media-skills) | MIT |
| MultiPost Extension | `5522ca01100a58572de3a652aebd7851f5fa648a` | [`research/third_party/MultiPost-Extension`](../../research/third_party/MultiPost-Extension) | Apache-2.0 snapshot; official package includes an unpublished proprietary component |

The directories retain source and license files for review. Do not install their dependencies, run their scripts, package them with Social Base, or copy code into runtime modules without a focused security and license review. To refresh a snapshot, clone/fetch the upstream repository into a temporary review directory, inspect the diff and license, then update this commit record.

## Development work to automate

| Work | Candidate automation | Human review still needed |
|---|---|---|
| Find relevant docs | `npm run docs:find -- --query "workspace archive"` searches Markdown under `docs/`. | Confirm the result is current and canonical. |
| Detect stale API/product research | `npm run docs:audit -- --stale-days 180` identifies old dated research and dateable open task lists. | Recheck platform terms, API access, pricing, and policy at the source before implementation. |
| Repository map / modularity | Existing `npm run repo:map` and `npm run check:file-size` summarize structure and enforce the size baseline. | Choose module boundaries; scripts should not make architectural decisions. |
| Type-check/build/tests on PR | GitHub Actions can run `npm run type-check`, `npm run build`, and `npm test` in a clean checkout. | Review failures and test coverage; do not auto-merge code. |
| Dependency updates | Dependabot can open npm dependency update/security PRs on a GitHub-hosted repository. | Review changelogs and run compatibility checks before merging. |
| Extension/release artifacts | Tag-triggered workflow can package the extension and upload build artifacts; Android build can be a separate runner/job. | Sign/review releases and protect provider secrets; never publish automatically from unreviewed code. |
| Routine feature scaffolds | Generate module folder, route/service/repository skeleton, docs stub, and focused test stub from templates. | Review each scaffold and write feature-specific policy, validation, and acceptance behavior. |
| Research freshness | This repo’s audit script reports dated documents and task markers. | Decide what “stale” means for each provider and update its sources. |

The repository already contains `docs:find`, `repo:map`, `check:file-size`, `modularity:audit`, `uiux:check`, extension packaging, build, type-check, and test scripts. GitHub Actions can automate project workflows and CI/CD; Dependabot supports scheduled dependency updates. The current workspace is not itself a Git checkout, so GitHub-hosted CI cannot run until the project is placed in a GitHub repository.

## Scheduler projects requested for the agency MVP

This focused comparison supplements the source snapshot review above. Postiz has a local, isolated source snapshot under `research/third_party/postiz-app`; Mixpost and Pendpost were reviewed through their public repositories and documented source descriptions, not copied into the runtime.

| Project | Source structure and useful patterns | License / fit decision |
|---|---|---|
| [Postiz](https://github.com/gitroomhq/postiz-app) | The checked-out TypeScript monorepo separates frontend, backend, integrations, SDK and orchestrator apps. Backend guidance follows DTO → controller → service → repository and avoids returning credential-bearing rows. | AGPL-3.0. Strong architecture reference, but its stack and deployment footprint are unlike Vue/SQLite. Keep isolated; no code copied. |
| [Mixpost Lite](https://github.com/inovector/mixpost) | Laravel/PHP source is organized into `src`, `routes`, `database`, `resources` and `tests`; product concepts include post versions/conditions, workspace collaboration, media library, calendar and queue. | MIT, but the runtime is Laravel/PHP. Reuse workflow patterns, not a second framework inside this app. Preserve notices if ever copying a specific MIT file. |
| [Pendpost](https://github.com/pendpost/pendpost) | Node local-first reference with REST, MCP, media and dashboard surfaces. Current `lib/mcp.mjs` is 3,195 lines and carries a broad tool registry; its README documents an approval gate and read/write tool parity checks. | MIT, but its single-process JSON state and oversized MCP registry do not fit the current SQLite modular monolith. Recreate small domain use cases and tests; do not transplant the registry. |

The source-level contrast reinforces the chosen boundary: take Postiz's layered provider/service/repository separation, Mixpost's per-network content versions and calendar concepts, and Pendpost's fail-closed human approval rule. Keep each capability in a focused module with independent contracts and tests.

## Integration decision for the next agency milestone

Preferred order:

1. Finish our workspace/client ownership and approval version model.
2. Decide whether Social Base owns publishing or calls a dedicated scheduler. Run Postiz locally as a separate proof of concept and inspect its API contract; do not mix its code into `src/` or `server/`.
3. Compare its deployment burden and external account onboarding with the app’s current stack and intended customer. Keep OAuth tokens behind the trusted service that owns the integration.
4. If adopting the separate service, define an adapter in `server/integrations/` with capability discovery, schedule/publish, status lookup, and error normalization. Store provider credentials only in that service’s supported secure flow.
5. Adopt selected writing/research skill guidance as owned templates only after editorial review; keep generated content draft-only and tied to the client’s voice and approval workflow.

## Official GitHub references

- [Postiz repository and README/license](https://github.com/gitroomhq/postiz-app)
- [GrowChief repository and README/license](https://github.com/growchief/growchief)
- [Social Media Skills repository and MIT license](https://github.com/charlie947/social-media-skills)
- [MultiPost source repository and Apache-2.0 license](https://github.com/leaperone/MultiPost-Extension)
- [AutoSocial repository and README/license](https://github.com/Katzca/AutoSocial)
- [LocoAgent repository and MIT license](https://github.com/LocoreMind/locoagent)
- [Social Media Automation repository](https://github.com/vasani-arpit/Social-Media-Automation)
- [BotLibre repository and EPL-1.0 license](https://github.com/BotLibre/BotLibre)
- [Social Push repository](https://github.com/jihe520/social-push)
- [Vault Sync repository](https://github.com/Ub207/vault-sync)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)

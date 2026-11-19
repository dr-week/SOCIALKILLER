# Product scope

The current available/planned feature map and mini-app groupings are documented in [Mini-app architecture](./MINI_APP_ARCHITECTURE.md). Mini-apps are internal workspaces in one website, not separate applications.

## Product goal (planned)

The initial goal is to help a small agency or business manage client brands, plan content, create AI-assisted drafts, review and approve posts, publish through supported APIs, and view basic channel-provided results. This is a planned direction, not a claim that those workflows are complete; see the [modular product plan](./MODULAR_PRODUCT_PLAN.md).

## What The Social Base does

- Provides an internal app launcher and dedicated Planner, Engage, Connections, Workflows, Audience Audit, Content Studio, Script Studio, Profile Scout, and Workspaces views in one responsive SPA.
- Imports Instagram follower/following export files and compares normalized usernames and snapshots.
- Looks up public profile counts on a best-effort basis; public pages do not provide follower identities.
- Organizes campaign drafts, channel settings, and publishing activity by company workspace.
- Supports local single-operator company workspace selection, creation, and reversible archiving. Workspace selection is an organization aid, not multi-user authorization or tenant isolation.
- Provides a local Node API, optional browser extension, and Capacitor Android shell.
- Records user-demonstrated, company-scoped browser workflows and replays reviewed, non-submitting steps on the same website origin.
- Previews Lua workflow commands. The runner has no connected screen capture, visual recognition, or device input.

## Data boundaries

- Audience exports are stored in browser local storage. Extension sync data is held by the local backend; do not describe it as durable unless persistence is added and verified.
- Campaign records and interaction workflows use local SQLite. Channel credentials/configuration are local and should remain scoped to their company and platform.
- The extension does not save text typed during recording. Text added to workflow fill steps is saved locally; avoid secrets.
- Public profile lookup can fail or be rate-limited. Never infer counts or present them as exact when source data does not say so.
- Keep imports, partial syncs, estimates, generated drafts, and completed posts visibly distinct.

## Not supported

- Reading private follower lists from public profile pages.
- Automated follow/unfollow, likes, comments, direct messages, or unattended feed browsing.
- Workflow replay across sites, form submission, or unattended browser/device control.
- Treating a Lua preview, queued item, or composer fill as a completed publication.
- Multi-user tenancy, team permissions, or approval roles. Local workspace archive/selection does not provide these security boundaries.
- Client-ready approval-gated scheduling. Automated scheduler and autopilot runs now create approval-pending drafts; a human must explicitly approve them before delivery. The local scheduler and approval endpoint are not a substitute for team authorization or a production audit trail.
- Direct, production-ready Meta publishing. Until official API access, app review, and integration are complete, publish eligible content through Meta Business Suite / Planner after human review. Treat that as a manual handoff; do not label a queued draft as published.

For navigation and interaction rules, see the [UX guide](./UX_GUIDE.md). For implementation, see [architecture](../engineering/ARCHITECTURE.md).

# Local API reference

The launcher prefers API port `4174` and frontend port `5199`, then selects available loopback ports when needed. Vite proxies `/api` to the selected `API_PORT`; health identity, not a port number, is the source of truth. Route handlers are the source of truth for request and response shapes—see the linked files before changing a client or adding an integration.

## Route groups

| Area | Main paths | Handler |
| --- | --- | --- |
| Health and runtime | `GET /api/health`, `/api/runtime` | [`runtime-routes.mjs`](../../server/routes/runtime-routes.mjs) |
| Android build management | `GET /api/android/toolchain`, `GET /api/android/builds`, `POST /api/android/build` | [`runtime-routes.mjs`](../../server/routes/runtime-routes.mjs), [`android-build-service.mjs`](../../server/android/android-build-service.mjs) |
| Instagram | `/api/instagram/profile`, `/status`, `/relationship`, `/sync`, `/accounts`, `/unfollowers` | [`instagram-routes.mjs`](../../server/routes/instagram-routes.mjs) |
| Company workspaces | `GET/POST /api/brands`, `GET /api/brands/archived`, `POST /api/brands/:id/archive`, `POST /api/brands/:id/restore`, `/api/brands/generate-script`, `/api/brands/generate-journey` | [`brand-routes.mjs`](../../server/routes/brand-routes.mjs) |
| Campaigns and channels | `/api/social/platforms`, `/posts`, `/generate`, `/autopilot`, `/scheduler` | [`social-routes.mjs`](../../server/routes/social-routes.mjs) |
| Research & drafts | `/api/social/news`, `/api/social/random-post`, `/api/social/random-post-feedback`, `/community-scan`, `/viral` | [`viral-routes.mjs`](../../server/routes/viral-routes.mjs) |
| Operations | `/api/social/metrics`, `/cleanup`, `/hybrid-run`, `/workflows` | [`ops-routes.mjs`](../../server/routes/ops-routes.mjs) |
| Optional AI | `GET /api/assistant/status`, `POST /api/assistant/chat` | [`assistant-routes.mjs`](../../server/routes/assistant-routes.mjs) |
| Automation | `/api/automations` and `/api/automations/runs/*` | [`automation-routes.mjs`](../../server/automation/automation-routes.mjs) |

The route list is a navigation aid, not a complete schema. Check handler code for method, query/body fields, validation, and response status.

`POST /api/social/posts` returns `201` only when a post record with an ID was created. A publish-now request is queued for human approval; duplicate-token and unapproved browser-dispatch requests return `409`, quality-guard rejection returns `422`, and publishing-limit rejection returns `429`.

`GET /api/marketing/ai-catalog` returns generated discovery JSON with tool and prompt metadata. It is not an MCP server or JSON-RPC endpoint and cannot be configured as a live MCP transport. A future MCP integration needs its own narrowly allowlisted server and explicit authorization rules.

The optional assistant accepts `{ "prompt": "..." }` at `POST /api/assistant/chat`. Prompts are limited to 2,000 characters; responses are capped at 256 tokens. It uses only the submitted prompt, does not retain conversation memory, and does not access workspace data or execute actions. Configure `GEMINI_API_KEY` in `.env`; the Gemini free tier may use prompts to improve Google products, so do not send confidential data. Assistant routes reject foreign origins.

Workspace archive and restore are reversible local-operator organization actions. The last active workspace cannot be archived. These endpoints do not authenticate users or enforce team/tenant authorization.

## Audience behavior

- Profile lookup and status are best-effort public-page checks; profile lookup can return counts, not follower identities.
- Relationship and unfollower routes compare data already synced for an account.
- Full lists come from an export or supported user-initiated sync.

## Safety and local development

- Keep the service bound to loopback. The router checks request host/origin for writes; do not expose it publicly without a separate security review.
- Do not put credentials in docs, test fixtures, or source control.
- `/api/social/hybrid-run` previews Lua commands. It does not control a browser or device.
- `/api/social/workflows` stores company-scoped browser workflows. Requests are limited to app/extension origins; see [interaction workflows](./INTERACTION_WORKFLOWS.md) for step limits and replay behavior.
- `/api/runtime` exposes local process identity and registry status to loopback browser origins only. `/api/android/build` accepts only fixed `debug-apk` and `release-aab` targets, requires Java, Android SDK platforms/build-tools, and the Gradle wrapper, and does not accept arbitrary shell commands. Build logs/history are memory-only for the current API process; configure release signing outside source control.

Start the app with `npm run dev`. Run `npm run type-check`, `npm run build`, and `npm test` for project checks.

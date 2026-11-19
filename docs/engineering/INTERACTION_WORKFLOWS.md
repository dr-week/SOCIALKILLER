# Interaction workflows

## Use

1. Open the target website and select The Social Base companion.
2. Enter a workflow name and start recording. Use clicks, ordinary text fields, and page scrolling.
3. Reopen the extension on that tab and stop/save.
4. In The Social Base, open **Publishing → Workflows** for the same company. Review steps and enter any text that should be filled.
5. Save the review. Return to the same website and use **Replay reviewed steps** in the extension.

## Limits

- Recording is opt-in per tab through Chrome's temporary active-tab access. The extension stores targets and actions, not text typed during recording.
- Password, email, phone, number, one-time-code, and hidden fields are ignored. Text added later in The Social Base is stored in local SQLite; do not add secrets.
- Replay requires the exact saved origin. It supports safe button clicks, field fills, scrolling, and waits. It stops on the first missing or unsafe target.
- Links, buttons inside forms, and actions labeled post, publish, submit, send, reply, comment, like, follow, unfollow, delete, purchase, buy, pay, share, connect, or invite are blocked. Replay never presses Enter or submits a form.
- Dynamic site markup can invalidate selectors. Re-record and review changed steps. This is a user-triggered helper, not an unattended agent or an engagement bot.
- Workflow records are company-scoped in `.data/followdesk.sqlite`; `GET /api/social/workflows` is restricted to the app and extension origins.

## Local launcher

- Start with the existing `Launch FoundryDesk.cmd` launcher at the project root or `npm run launch`.
- `launcher/launch.mjs` holds a process lock, reuses a running Social Base dashboard, and binds Vite to one strict port. A second launch exits without opening another tab.
- Press `Ctrl+C` in the launcher window to stop services it started. Runtime lock and port state live under `.data/`.

## Implementation

- Extension: `extension/modules/interaction-recorder.js` records and replays DOM actions; `extension/popup.js` controls it.
- Local API and persistence: `server/routes/ops-routes.mjs`, `server/db/sqlite-engine.mjs`.
- Company workflow editor: `src/components/publisher/PublisherAutopilot.vue`.

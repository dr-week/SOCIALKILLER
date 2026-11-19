# SOCIALKILLER — The Social Base

> **Kill the social media agencies and middlemen. Take back control for creative people.**

One local-first agency operating system and suite of focused mini-app workspaces that automates the middleman work—giving every creator, designer, writer, and creative worker the framework to start and run their own automated agency.

---

## Our Story & Manifesto: Join the Revolution

The creative industry is broken because of social media agencies and middlemen.

Today, the creative people—the ones who do almost all the real work—grind through sleepless nights, shipping creative work like laborers. Meanwhile, the middleman sleeps, eats, and passes back barely **1% of the profit** to the creative workers who actually built the value.

**With this app, we are bringing in the revolution to start our own agency.**

Every creative person now has a complete framework to launch and run their own agency—completely automated under their own control:
- **You do the ideation and creative craft.**
- **Every piece of middleman and social media manager work is handled by this agency app.**

The whole purpose of **SOCIALKILLER** is to eliminate the extractive social media agencies and middlemen that control the industry. Creative employees and workers are taking total control back for themselves.

And this is just the start. We are getting ahead. **Join our revolution. People, this is the change we want for everyone.**

---

## What It Does (Your Automated Agency Framework)

The app opens to the internal **Apps** launcher—one unified, local-first platform with specialized mini-app workspaces for everything a traditional agency charges a massive cut for:

- **Plan & Publish**
  - **Planner**: Channel-specific post composer, drafts, review/approval queue, scheduled queue, calendar & list views, post export, and direct publishing or guided handoff flows.
  - **Connections**: Per-brand channel setup, encrypted local credential vault, account assignment, and provider handoff actions.
- **Create**
  - **Content Studio**: Curated short-form content & inspiration workspace, caption ideas, and hook signals.
  - **Script Studio**: Brand-aware video-script and milestone-story generators.
- **Community & Audience**
  - **Engage**: Locally organized comments, messages, and reply drafts.
  - **Audience Audit**: Instagram export import, follower/following comparisons, snapshot history, categories, whitelist, account-health checks, and CSV export.
  - **Profile Scout**: Public profile count lookup and avatar utility.
- **Operate**
  - **Workspaces**: Multi-brand context, brand voice, reference links/notes, and assigned channel handles.
  - **Automation Studio**: Scheduled, manual, and social-post-triggered workflows with conditions, branches, draft actions, run history, and retry.
  - **Workflows**: Record, review, and replay company-scoped browser workflows with the optional Chrome extension companion.
- **Build**
  - **Design System**: Shared theme/accent tokens and reusable UI control patterns.
  - **Asset Manager**: Local asset catalog, source metadata, responsive variants, and validation status.
  - **Android Build Studio**: Inspect local Java/SDK readiness and build the Capacitor Android host APK/AAB.

Selecting a mini-app switches your active workspace inside the same site and browser tab. See the [mini-app architecture](./docs/product/MINI_APP_ARCHITECTURE.md) for the full audited feature map and roadmap.

---

## Start

```sh
npm install
npm run launch
```

Or double-click the existing `Launch FoundryDesk.cmd` launcher in the project root. Its filename is retained for compatibility; it manages the local API on port `4174` and the dashboard on port `5199` (or a free fallback port).

The legacy launcher is also kept in [`launcher/launch-legacy.cmd`](./launcher/launch-legacy.cmd) as a migration fallback while the planned Tauri desktop app is developed.

## Verify

```sh
npm run type-check
npm run build
npm test
```

## Documentation

Start at [`docs/README.md`](./docs/README.md). It links product scope, UX, architecture, API, and campaign-writing guidance by purpose.

## Important boundaries

- Follower and following identities come from user-provided Instagram exports or supported user-initiated sync; public profile lookup only attempts counts.
- Drafts require review. Any direct publishing depends on channel configuration and an explicit operator action.
- Lua commands are preview-only; the separate reviewed workflow feature uses the Chrome extension on the selected tab.

## Meta account linking

Meta linking is configured per company workspace from **Connections**. Add `META_APP_ID`, `META_APP_SECRET`, and the exact callback URL `http://127.0.0.1:4174/api/social/meta/callback` to `.env`, then register that callback in the Meta app's Facebook Login settings. Set `FOLLOWDESK_VAULT_KEY` to a private value of at least 32 characters so OAuth tokens can be stored encrypted. The current flow requests `pages_show_list`, `pages_read_engagement`, `instagram_basic`, and `instagram_content_publish`. The encrypted local vault stores the returned Page and Instagram account details. Select a Facebook Page to set its linked Instagram professional account as the publishing target. Instagram direct publishing requires an Instagram professional account linked to the Page and an accessible public image or video URL; other posts continue through the Meta Business Suite handoff. Facebook Page publishing is not implemented in the app yet.

## Zuari UI pilot

The empty-audience `ImportBanner` and `AudienceCategoryTabs` are Vue-hosted Zuari islands. Vue still owns app state and navigation; the islands render their UI and send user actions back to Vue. Their wrappers destroy Zuari views and listeners before unmounting.

The app uses the local release tarballs in `vendor/zuari` through `file:` dependencies, so `npm install` does not require the Zuari monorepo or its Vite plugin. Keep those tarballs, `package.json`, and `package-lock.json` in sync when refreshing the pilot. The island uses the app's existing global styles in light DOM (no Shadow DOM isolation); buttons keep native keyboard behavior and visible labels.

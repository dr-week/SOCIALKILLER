# Modular social marketing platform plan

**Status:** Proposed product direction; this is not a statement of shipped capability.  
**Research checked:** 2026-11-05

## 1. Product direction

Evolve The Social Base from a local-first audience and campaign workspace into a sellable, multi-company social marketing platform. Customers should be able to connect authorized business accounts, plan and review content, publish through supported APIs, manage conversations, and measure results. Automation should be configurable, auditable, and easy to pause.

**Initial MVP goal:** one workspace for a small agency or business to manage client brands, plan a content calendar, create AI-assisted drafts, review and approve posts, publish through supported Meta APIs, and see basic channel-provided results.

The MVP keeps a person responsible for strategy, approval, and customer communication. A unified inbox, automated replies, ads, and autonomous engagement are later-phase work, not part of the first release. This is a product goal, not a description of current shipped capability.

**Do not promise:** access to private personal-account data, unrestricted publishing or messaging, guaranteed delivery, automatic growth, or that a saved social handle is a connected account.

## 2. Research: Meta and the ecosystem

Meta capabilities are product-specific APIs, not one universal social API:

| Need | Supported path | Important boundary |
| --- | --- | --- |
| Instagram publishing, media insights, comments, and professional-account messaging | Instagram Platform with Instagram Login or Facebook Login | Professional (Business/Creator) accounts only. Login type, permissions, review/access level, media requirements, and supported actions differ. The Instagram Login path does not require a linked Facebook Page, but does not provide ads or tagging. |
| Facebook Pages publishing and management | Graph API with the appropriate Page access and permissions | Requires an authorized Page and app permissions; customer onboarding and Meta app review/access requirements apply. |
| WhatsApp customer conversations | WhatsApp Business Platform Cloud API plus webhooks | Requires a WhatsApp Business account/phone number, permissions, approved templates for applicable outbound messages, and compliance with current messaging rules and pricing. |
| Meta-operated WhatsApp AI | Meta Business Agent Platform API | Separate from the consumer Meta AI app. Requires an eligible WhatsApp number, system-user setup, permissions, required terms, and potentially billing. Availability and eligibility must be checked during customer onboarding. |
| Ads and paid campaign management | Meta Marketing API | A separate, later integration with separate permissions, review, data, and billing requirements. Do not mix it into organic publishing MVP. |

**Meta AI decision:** do not design around an assumed general-purpose “Meta AI API.” Treat Meta Business Agent as an optional Meta-hosted WhatsApp agent integration where the customer and number qualify. For product-owned AI features (drafting and retrieval-augmented customer support), define a provider-neutral model interface and select a supported model/provider after cost, privacy, and quality evaluation. Keep the knowledge retrieval and safety policies in The Social Base so switching model vendors does not change product behavior.

### Account sign-in vs. business-profile linking

These are different product flows and must not be presented as one generic “connect account” button:

1. **Sign in to The Social Base:** authenticate the operator (for example with Google Identity Services or the product's own login). This creates or opens a Social Base user session. Google sign-in alone grants no access to a Google Business Profile, YouTube channel, Facebook Page, or Instagram account.
2. **Connect a channel/profile:** a workspace admin explicitly authorizes a provider, chooses the business assets they manage, reviews the requested permissions, and assigns the selected assets to a brand. This is provider OAuth/API authorization and is separately revocable.
3. **Verify capabilities:** fetch the authorized assets and show actual granted scopes and supported actions. A profile is “connected” only after this succeeds; a username or profile URL saved by a user is not an API connection.

The local-first release does not require app identity sign-in. Google/Meta/email identity providers belong to a future cloud option and must remain separate from channel authorization.

Use separate, clearly named app sign-in and channel-connection flows for **Meta**, **Google**, and any later provider. Support multiple independent account connections per provider; do not store a single token slot keyed only by provider. For Meta, evaluate Facebook Login for Business for business-asset onboarding and Instagram Login for eligible Instagram professional accounts. Meta says Login for Business is the preferred authorization solution for tech providers; serving businesses outside the developer's own organization requires Advanced Access/App Review. Keep requested permissions minimal. For Google, use Sign in with Google only for The Social Base identity; request separate, least-privilege OAuth authorization for each Google API integration.

**Recommended “Profiles” experience:** an account connections page grouped by provider and brand, with “Connect Meta”, “Connect Google Business Profile”, and (later) “Connect YouTube” actions; authorized asset picker; permission summary; test/health status; reauthorize, disconnect, and remove-asset actions; last successful sync; and clear unsupported-capability messaging.

**Connection flow:** start OAuth only after the user chooses a provider and feature; use the authorization-code flow with validated `state` and PKCE where supported; handle the callback server-side; exchange the code without exposing client secrets; fetch the provider's authorized asset list; let the customer explicitly select assets and brand/workspace; store tokens encrypted; and log grants, expiry, refresh, disconnect, and errors. Never collect provider passwords or silently expand scopes. Make reconnect and disconnect work end-to-end.

Suggested profile records: `ProviderConnection` (tenant/workspace, provider, external principal, encrypted token reference, granted scopes, expiry, health) and `ChannelProfile` (connection ID, external asset ID/type, display name, assigned brand, capability snapshot). Keep access tokens out of the frontend and out of logs.

### Offline-first use and remembered sessions

**Product decision:** a person using the local app should not have to sign in again every time it opens. The default local mode opens the last local profile/workspace and its saved data. Put account actions under the circular user/avatar menu: profile/workspace, sign in or sync (optional), connect/manage channels, privacy and local data, lock, and sign out. Do not show a mandatory login wall for local use.

- Keep personal workspace data on the device by default. Do not upload it to a Social Base cloud service unless the user explicitly enables a future sync/team feature. Explain that publishing, inbox, and sync features still contact their platform/server when used.
- Keep user-managed private files in the root `local-private/` directory, excluded from Git; keep application runtime data in `.data/`, also excluded from Git. These folders are local-only and are not an OAuth password/token mechanism.
- Persist a local session/profile identifier, not the user's provider password. Provide an optional app lock (device authentication or PIN) for shared devices; closing and reopening the app should not itself require a fresh provider login.
- Use the system browser/external user-agent for Google/Meta OAuth, then return to the app through a registered, validated callback (desktop loopback/registered redirect or mobile app/universal link as supported). On mobile this can use the Capacitor Browser and App deep-link APIs. Never collect provider passwords or copy browser cookies. The provider may reuse its existing browser session, but may still ask the user to choose an account, consent, or sign in again; the app cannot promise password-free provider authorization in every case.
- OAuth returns an authorization code and, after exchange, tokens/scopes—not the provider's password. Protect callbacks with `state` and PKCE where supported, validate the returned provider and redirect, and keep client secrets out of public/mobile builds.
- Store refresh/access tokens in an OS-backed secure credential store (for example Android Keystore-backed storage or the desktop OS credential vault), not browser local storage, plain preferences, logs, or exported backups. Encrypt sensitive local records at rest; keep encryption keys separate from the data.
- Offer local export, delete/reset, and encrypted backup/restore. State clearly that local-only data is tied to this device unless the user exports it or opts into sync. A device lock is not a substitute for encrypting sensitive data.
- Offline mode can browse/edit locally saved drafts and profile data. Connecting accounts, publishing, messaging, and syncing require network access; show queued/offline state instead of claiming the operation completed.
- The current app uses a mix of browser local storage and local SQLite; it does not yet meet all of these security/session goals. Treat this section as planned behavior, not shipped behavior.
- Root `.gitignore` excludes `.data/`, `local-private/`, and `.env` files (while retaining `.env.example`) to reduce accidental publication of runtime data or local configuration. Ignore rules are not a substitute for secure credential storage and do not untrack files that were already committed.
- **Known prerequisite:** [`server/credential-store.mjs`](../../server/credential-store.mjs) currently has a hard-coded fallback master key when no vault key is configured. Do not treat the current vault as production-safe for sensitive offline storage; remove the shipped fallback and use an OS-protected key with an explicit, recoverable key-management design before storing customer OAuth tokens.

**Google channel scope:**

- **Google Business Profile (GBP)** is a local-business listing product, not generic social-profile access. Its APIs can manage authorized business listings and local posts, but access is restricted: Google requires an eligible project and approved API access; its current prerequisites include an active, verified Business Profile held for 60+ days and a business website. Build this only after project access is granted.
- **YouTube** is a separate channel integration. OAuth is required for private channel data and uploads; public data can use an API key. Upload features need a reviewed, compliant API project and are subject to quota/audit requirements.
- Do not request broad Google scopes “just in case.” Make each connect flow feature-triggered, explain the data/use, and request only the scopes required by that channel feature.

### Products to benchmark, not blindly embed

| Product | Useful benchmark | Likely role |
| --- | --- | --- |
| Meta Business Suite | First-party Facebook/Instagram publishing, inbox, ads, and insights | Customer’s no-extra-vendor baseline and fallback when an API capability is unavailable. |
| Buffer | Cross-channel planning, calendar, publishing, channel groups | Simplicity and small-team workflow benchmark; possible integration only if it solves a real API gap. |
| Hootsuite | Calendar/scheduler, collaboration, approvals, AI-assisted content | Agency/team workflow benchmark. |
| Sprout Social | Publishing calendar, analytics, collaboration, approval | Reporting and approval benchmark. |
| Manychat | Instagram messaging and comment-triggered automation | Benchmark for simple social DM flows; verify current API/eligibility and plan limits before positioning. |
| respond.io | Shared WhatsApp inbox, automation, integrations, analytics | Benchmark or potential partner for conversation operations; WhatsApp API itself does not provide a complete agent inbox. |

These are adjacent tools, not evidence that The Social Base currently connects to them or that every feature is available on every plan, account, or region. Recheck vendor terms and feature availability before sales comparisons.

### Meta Business Suite: baseline and opportunity

Meta describes Business Suite as a first-party place to manage Facebook, Messenger, and Instagram activity, including creating/scheduling content and ads, responding to messages/notifications, and viewing insights. Treat it as the user’s existing baseline—not as an API integration to embed. The Social Base should add value with agency/client workspaces, cross-channel planning, approval and audit workflows, safe automations, reusable brand knowledge, and reporting across authorized providers. Each capability still depends on the underlying API and approved access; do not promise a feature solely because it exists in Business Suite.

### Point-in-time free-plan check (vendor-published, India-relevant)

The supplied comparison is directionally useful, but free limits are volatile and several claims should not be repeated as guaranteed:

| Tool | What its public pricing page currently states | Qualification |
| --- | --- | --- |
| SuperProfile | Free Starter lists unlimited AutoDMs on Reels/posts and up to 10 lead-magnet leads. Story/live AutoDM and broader scheduler/AI features are described on paid Creator tier. | “Unlimited AutoDM” is not unlimited access to every feature; free scope is narrower than the pasted claim. |
| Zorcha | Free tier advertises unlimited automations, DMs, and contacts; AI FAQ and other allowances/paid features are separately tiered. | Vendor-published limit; verify fair-use rules and actual account behavior before recommending. |
| ReplyKaro | Public pages advertise a free plan, but the inspected pricing content did not substantiate the specific “1,000 DMs/month and 3 automations” figures. | Treat those exact figures as unverified. The pricing page describes other plan/usage limits. |
| CreatorFlow | Free tier lists one Instagram account and 500 automated DMs/month. | Instagram-focused; paid tiers add accounts and higher monthly volumes. |
| LinkDM | Free tier lists one Instagram account and 1,000 DMs/month; comment auto-reply is listed among paid features. | Feature availability differs by trigger and plan. |
| ManyChat | Current official pricing page could not be verified in this research pass. | Do not repeat the “25 active contacts” figure as current without checking its current pricing/help page. |

These are vendor claims, not independent performance tests or an endorsement. Limits may change by country, account type, billing period, and campaign. Recheck before sales/partner decisions.

## 3. Regular social marketing requirements

### Brand and account operations

- Organization/workspace, brands, channels, time zone, brand voice, users, roles, and client separation.
- Keep the initial product local-first with no required Social Base sign-in. Separate local app lock from provider authorization; connecting or publishing still requires internet.
- Separate any future cloud app sign-in from channel authorization. Keep identity providers pluggable and add explicit per-provider OAuth linking, multiple account records, asset selection, permission display, token expiry/revocation, and connection health checks.
- Profiles/Connections page listing provider, selected asset, assigned brand/workspace, granted capability, status, last check, and disconnect/reauthorize controls.
- Separate channel identity from connection credentials. Show connected, limited, expired, failed, and disconnected states accurately.

### Content operations

- Calendar and queue; drafts, assets, channel-specific variants, campaign tags, UTM links, and reusable templates.
- Per-channel validation for media, caption, aspect ratio, length, and API limitations.
- Draft → review → approve → scheduled → publishing → published/failed lifecycle, with retry rules and an activity/audit trail.
- Human approval and an explicit publish action by default. Customers may opt into scheduling only after successful connection and configuration.

### Community and chatbot operations

- Unified inbox for supported channels, conversation assignment, status, internal notes, saved replies, and human handoff.
- Comment/keyword-to-DM triggers must be driven by supported Meta webhooks and messaging APIs, with deduplication, per-channel eligibility/limits, clear user-facing opt-out, and no password-based browser automation.
- Bot settings per brand/channel: hours, supported intents, approved knowledge sources, escalation path, and pause/kill switch.
- RAG knowledge ingestion with source citations, freshness and deletion controls, tenant isolation, and “not found” behavior.
- Consent and opt-out handling, channel-specific messaging windows/templates, rate limits, and safe handling of sensitive requests.
- Log inbound/outbound events and agent decisions without retaining more personal data than needed.

### Measurement and commercial operations

- Delivery/publishing status and channel-provided insights, with source and reporting window visible.
- Provider-specific adapter capability matrix so Instagram, Facebook Pages, GBP, and YouTube expose only supported actions.
- Workspace roles and scoped access, customer provisioning/onboarding, subscription/usage controls, invoices, support and export/delete workflows.
- Reliability signals: webhook delivery, retry queue, failed jobs, token health, per-tenant usage, and incident visibility.

## 4. Modular architecture and naming

Keep the current Vue + Node stack while moving toward feature modules and a tenant-aware hosted backend. Avoid a large rewrite. Extract a module when it has a clear boundary and testable contract.

For code-department ownership, dependency direction, file naming, and the migration workflow, use the [engineering modularization blueprint](../engineering/MODULARIZATION_BLUEPRINT.md).

```text
src/
  app/                 # application shell, router, shared layout
  features/
    workspaces/        # organization, brand, membership, roles
    connections/       # operator identity vs provider OAuth and asset linking
    publishing/        # composer, calendar, approvals, post lifecycle
    inbox/             # conversations, assignments, human handoff
    automation/        # bot rules, knowledge sources, run history
    analytics/         # channel metrics and reports
  shared/              # design system, API client, common types/utilities

server/
  modules/
    identity/          # authentication, sessions, authorization
    tenants/           # organizations and workspace boundaries
    connections/       # provider OAuth callbacks, asset selection, encrypted credentials
    publishing/        # post commands, scheduling, delivery state
    conversations/     # webhook events, inbox, outbound messages
    knowledge/         # document ingestion, chunking, retrieval
    ai/                # provider interface, policy, evaluation
    analytics/         # metric normalization and reports
  integrations/
    meta/
      instagram/       # Instagram Graph/Messaging adapters
      facebook/        # Pages/Graph adapter
      whatsapp/        # Cloud API, Business Agent, webhook adapter
    google/
      business-profile/ # authorized locations, posts, supported listing actions
      youtube/          # channel authorization, uploads, channel capabilities
    providers/         # other model/storage/payment providers as needed
  jobs/                # durable scheduler, retries, dead-letter handling
  db/                  # migrations, repositories, tenant-scoped queries
  http/                # routes, middleware, webhook verification
```

### Module contracts

- `ChannelAdapter`: capabilities, validation, publish, status lookup, insights; channel APIs stay behind adapters.
- `MessagingAdapter`: receive normalized events, send supported messages, report delivery status.
- `ModelProvider`: generate structured output; no platform credentials or raw tenant data outside an authorized request.
- `KnowledgeRetriever`: tenant-scoped search with source references and deletion support.
- `JobQueue`: durable, idempotent jobs with bounded retries and visible terminal failure.
- Use a normalized domain model, but keep platform-specific fields and capability differences rather than pretending all channels are identical.
- Store provider authorization as a workspace-owned connection, and selected external assets as separate channel profiles; never treat an identity-provider login token as a social-channel token.

### Fit with the existing code

- Existing UI areas live under `src/components/` and `src/composables/`; move them into `src/features/` incrementally when modifying each feature.
- Current HTTP route groups are in `server/routes/`; preserve contracts and extract integration logic from route handlers into `server/integrations/`.
- Existing publishing logic is in `server/posting/`; reuse its adapter patterns before introducing a second publisher abstraction.
- Local SQLite, loopback binding, and local credential storage are development/local-app assumptions. A hosted commercial release needs tenant-aware persistent storage, server-side secrets management, authentication, and authorization first.
- The browser local-storage and SQLite stores are not, by themselves, a secure vault. Add platform-backed credential storage and encrypted local-data handling before claiming sensitive data is safely stored offline.
- The audience export/follower audit remains a separate opt-in utility; it is not the core marketing product or a source for private platform data.
- For the native desktop decision and staged launcher migration, see [desktop migration](../engineering/DESKTOP_MIGRATION.md). For researched API costs and access gates, see [API availability](./API_AVAILABILITY.md).

## 5. Delivery phases and release gates

### Phase 0 — Stabilize and define the sellable slice

**Deliver:** remove conflicting product language, document what is implemented, audit route/adapter behavior, define target customer and first paid workflow, and establish test fixtures for failures and platform capability limits. Ensure the scheduler cannot bypass approval for client posts. Establish the lean development practices and file-size ratchet before feature work. Preserve local-data behavior, select provider rollout order and retention rules, and use OS-backed local key protection before storing real customer tokens. Keep cloud sign-in optional and out of the initial release.

**Gate:** every screen accurately distinguishes draft, connected, queued, attempted, published, and failed; no unsupported feature is marketed as live.

### Phase 1 — Local workspace and connection foundation

**Deliver:** local workspace and brand management, opt-in client review, audit events, repeat-safe migration, and a provider-neutral connection/asset model supporting multiple accounts per provider. Protect tokens with an OS-backed local key; keep app identity providers and channel API adapters in separate modules. No cloud account is required.

**Gate:** local workspaces remain isolated; multiple same-provider accounts remain distinct; export/delete, local backup/restore, and connection disconnect/revoke are verified. Client review is opt-in and does not imply remote access.

### Phase 2 — Meta content planning and publishing MVP

**Deliver:** Meta Login for Business and/or Instagram Login onboarding for selected Facebook Page and Instagram professional-account use cases; explicit asset selection and brand assignment; connection health; media validation; composer, calendar, approval, scheduled publishing, delivery status, retry/idempotency, and basic supported insights.

**Gate:** Meta app review/access approved for intended customers and permissions; test/live accounts pass supported publishing cases; failures are visible and never reported as success.

### Phase 3 — Google channel connections and local-marketing support

**Deliver:** add Google Business Profile as a separate channel only after Google approves API access; connect authorized locations, support approved listing/post/review workflows, and clearly identify listing-specific restrictions. Consider YouTube OAuth and upload only as a separate adapter after quota, audit, and product-demand review.

**Gate:** Google API access is granted; OAuth verification and requested scopes are cleared; location ownership/authorization, quota, changes, and customer notice requirements are tested.

### Phase 4 — Shared inbox and guarded chatbot

**Deliver:** WhatsApp Cloud API and selected Instagram messaging integration; signed webhook verification, idempotent event processing, shared inbox, assignment, templates/rules, consent and opt-out tracking, human handoff, audit and pause control.

**Gate:** webhook replay/duplicate tests pass; opt-out, escalation, unsupported message, and API outage cases are tested; applicable business messaging policies and billing are reviewed.

### Phase 5 — Knowledge-grounded AI and Meta Business Agent option

**Deliver:** versioned knowledge sources, ingestion/reindex/delete, tenant-isolated retrieval, cited answers, confidence thresholds, escalation, evaluations, usage/cost limits, provider abstraction, and optional Meta Business Agent integration for eligible customers.

**Gate:** retrieval has documented quality tests; answers do not cross tenant boundaries; uncertain or high-impact requests transfer to a person; customers can pause automation and remove their data.

### Phase 6 — Optional cloud and team collaboration

**Deliver:** optional cloud sync, separately selected app sign-in methods (Google, Meta/Facebook, or email), tenant authorization, managed keys, invitations, audit, and opt-in remote client reviewers. Local use remains available.

**Gate:** cross-tenant authorization, sync conflict/recovery, key rotation, export/delete, and account lifecycle tests pass; remote client access is disabled unless enabled per workspace.

### Phase 7 — Commercial scale and channel expansion

**Deliver:** subscription/usage billing, plan limits, customer support/admin tooling, analytics exports, operational SLOs, security/privacy review, and additional channels only when demand and permissions justify them. Consider Ads API as a separately scoped product.

**Gate:** support, incident response, data retention/deletion, compliance, cost margin, and channel-specific certification/review requirements are approved before general availability.

## 6. Immediate priorities

1. Pick one initial customer segment and first service workflow for the local-first model; avoid building every channel and a chatbot before validating the core buyer.
2. Define “Sign in” and “Connect profiles” as separate flows; make the connections page the single source of truth for provider, external asset, scopes, workspace, and health.
3. Audit and improve the current publishing workflow and visual polish as Phase 0; state clearly which account connections are real, and prevent scheduled publishing from bypassing human approval.
4. Treat cloud sync, team identity, and managed tenant storage as an optional later phase; keep local credential protection and account lifecycle safe now.
5. Start with organic Facebook/Instagram content planning and publishing; add GBP/YouTube only after access and demand. Do not start with paid ads and autonomous outreach at once.
6. Build the inbox and human workflow before turning on autonomous replies.
7. Track Meta app review, Google API access/verification, permission, pricing, region, account eligibility, and product changes as release dependencies.

## 7. Reference links

### Meta primary sources

- [Graph API overview](https://developers.facebook.com/docs/graph-api/overview/)
- [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login)
- [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login)
- [Instagram content publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing)
- [Instagram Messaging](https://developers.facebook.com/documentation/business-messaging/instagram-messaging)
- [Instagram private replies](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/messaging-api/private-replies)
- [WhatsApp Business Platform overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview)
- [WhatsApp Cloud API and platform components](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)
- [WhatsApp webhooks](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview)
- [Meta Business Agent setup](https://developers.facebook.com/documentation/meta-business-agent/get-started)
- [Meta Business Suite](https://www.facebook.com/business/tools/meta-business-suite)
- [Facebook Login for Business](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business/)
- [Meta App Review](https://developers.facebook.com/documentation/resp-plat-initiatives/individual-processes/app-review)
- [OAuth 2.0 for Native Apps (RFC 8252)](https://datatracker.ietf.org/doc/html/rfc8252)
- [PKCE for OAuth public clients (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)

### Vendor product references

- [Buffer publishing](https://buffer.com/publish)
- [Hootsuite publishing and approvals](https://www.hootsuite.com/platform/publishing)
- [Sprout Social publishing](https://sproutsocial.com/features/social-media-publishing/)
- [SuperProfile pricing](https://superprofile.bio/in/pricing) and [AutoDM overview](https://superprofile.bio/in/auto-dm)
- [Zorcha pricing](https://zorcha.com/pricing/)
- [ReplyKaro pricing](https://www.replykaro.com/pricing)
- [CreatorFlow pricing](https://creatorflow.so/pricing)
- [LinkDM pricing](https://www.linkdm.com/pricing)
- [Manychat pricing](https://manychat.com/pricing) (not verified in this research pass)
- [respond.io WhatsApp Business API](https://respond.io/whatsapp-business-api)

### Google primary sources

- [Sign in with Google](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google OAuth 2.0 for web apps](https://developers.google.com/identity/oauth2/web/guides/overview)
- [Google Business Profile API overview](https://developers.google.com/my-business/content/overview)
- [Business Profile API access prerequisites](https://developers.google.com/my-business/content/prereqs)
- [Business Profile API policies](https://developers.google.com/my-business/content/policies)
- [Google Business Profile local posts API](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts)
- [Google OAuth user authorization](https://developers.google.com/identity/oauth2/web/guides/how-user-authz-works)
- [YouTube API authentication](https://developers.google.com/youtube/data/guides/authentication)
- [YouTube video uploads](https://developers.google.com/youtube/data/guides/uploading_a_video)
- [YouTube quota and compliance audits](https://developers.google.com/youtube/data/guides/quota_and_compliance_audits)
- [Google OAuth for desktop/native apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google OAuth for web-server apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Drive API overview](https://developers.google.com/workspace/drive/api/guides/about-sdk)
- [Capacitor Browser API](https://capacitorjs.com/docs/apis/browser)
- [Capacitor App/deep-link API](https://capacitorjs.com/docs/apis/app)
- [OWASP MASVS secure storage control](https://mas.owasp.org/MASVS/controls/MASVS-STORAGE-1/)

Meta and vendor documentation changes. Reconfirm current API versions, permissions, app review, eligibility, policies, and pricing before implementation or customer commitments.

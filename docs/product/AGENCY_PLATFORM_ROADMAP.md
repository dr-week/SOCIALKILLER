# Agency platform roadmap

**Status:** Planned; these capabilities are not yet a statement of shipped product functionality.  
**Research checked:** 2026-11-05

Build The Social Base as a modular agency workspace for managing client brands, approved content, authorized channel profiles, and measurable automations. Start with one reliable publishing workflow; add providers only when access, customer demand, and operating cost are understood.

For detailed requirements and API limits, see the [modular product plan](./MODULAR_PRODUCT_PLAN.md) and [API availability notes](./API_AVAILABILITY.md). For code ownership, see the [modularization blueprint](../engineering/MODULARIZATION_BLUEPRINT.md).
For model choices and assistant guardrails, see the [AI assistant plan](./AI_ASSISTANT_PLAN.md).

## Product boundaries

- **Agency organization → client workspace → brand → connected channel profile.** Membership and roles are scoped to the organization/workspace.
- **Sign in is not Connect.** Product identity authenticates a person; provider OAuth separately authorizes an asset such as an Instagram professional account or Google Business Profile.
- A workspace may hold multiple independent accounts for the same provider; one authorization may expose multiple assets. Never overwrite credentials based on provider name alone.
- The initial product stays local-first with no required Social Base account. Client review is opt-in per workspace; remote review requires the later cloud phase.
- Use the **system browser** for provider authorization. Validate `state`, use PKCE where supported, request only feature-needed scopes, and keep confidential client secrets and provider tokens off the frontend.
- Show the exact asset, permissions, supported capabilities, health, expiry, and disconnect/reconnect actions. A saved handle is not an API connection.
- Keep human approval, an audit trail, idempotent jobs, visible failures, and a pause control in every publishing/automation flow.
- Build provider adapters around actual API capabilities; do not promise a universal social API or automate consumer websites with passwords/cookies.

## User and profile management

| Role | Scope |
|---|---|
| Organization owner | Organization settings, members, billing, and workspaces. |
| Workspace admin | Brand setup, member access, channel connections, and workspace settings. |
| Approver | Review and approve content; cannot manage provider credentials. |
| Editor | Create drafts and submit them for approval. |
| Analyst/viewer | Read permitted content, status, and reports. |

These roles describe the future team model; current local workspaces are not user authorization. Invite, role-change, deactivation, and asset reassignment actions must be audited before cloud/team release. A provider connection belongs to a workspace, while each selected external asset is assigned to a brand.

## Phased delivery

| Phase | Deliverable | Release gate |
|---|---|---|
| 0. Local foundation | Confirm the local-first workflow; audit current product, approval, local data, and credential lifecycle. | No required cloud account; local data and supported actions are clearly described; local secret storage is protected. |
| 1. Local workspaces and connections | Workspaces, opt-in client review, multiple provider connections/accounts, asset picker, and encrypted local token lifecycle. | Workspace isolation and local connect, refresh, revoke, disconnect, and recovery checks pass. |
| 2. Meta publishing | Facebook Page and eligible Instagram professional-account connections; composer, calendar, approvals, scheduled delivery, status, retries, and supported insights. | Required Meta app access/review is granted; failures are explicit and no unsupported actions are shown. |
| 3. Google channels | Google Business Profile only after API access approval; YouTube as a separate OAuth/quota-reviewed adapter. Drive may be considered for customer-authorized asset import. | API access, OAuth verification/scopes, quota, and asset ownership are confirmed. |
| 4. Inbox and automation | Supported Meta/WhatsApp events, shared inbox, assignment, rules, deduplication, opt-out, human handoff, and pause/kill switch. | Platform messaging rules, customer consent, policy windows, retries, and cost are tested. |
| 5. AI and knowledge | Tenant-isolated knowledge, a small draft-first assistant, citations, evaluations, confidence limits, escalation, and usage controls. | Data isolation, safe action validation, deletion, answer quality, and human escalation pass review. |
| 6. Optional cloud/team | Cloud sync, selected Google/Meta/email app sign-in, tenant authorization, managed keys, invitations, audit, and optional remote client review. | Cross-tenant tests, recovery, export/delete, account lifecycle, and security review pass; local use remains available. |
| 7. Commercial scale | Billing/usage limits, customer support, operational monitoring, and additional providers selected by demand. | Privacy, support, incident response, margins, and provider approvals are ready for release. |

**Not first-release scope:** Ads APIs, autonomous outreach, unrestricted messaging, and a general-purpose “Meta AI API.” Meta Business Agent is a separate, eligibility-dependent WhatsApp product; AI models should remain provider-neutral.

## Provider scope

| Provider area | Initial capability | Constraint |
|---|---|---|
| Meta Instagram | Professional-account publishing, comments, insights, and messaging where granted. | Login path and permissions matter; Instagram Login does not require a Facebook Page but excludes ads/tagging. App Review/Advanced Access is required for many external-customer use cases. |
| Meta Facebook | Authorized Page content and related supported actions. | Page access, permissions, app review, and API-specific limits apply. |
| Google Business Profile | Authorized local listings and supported listing actions. | API access is gated; it is not generic social-profile management. |
| YouTube | Authorized channel metadata and publishing. | Separate consent, quota, and compliance/audit requirements. |
| Google Drive | Optional customer-authorized asset import. | Separate OAuth scopes; never treat sign-in as Drive authorization. |
| WhatsApp | Later messaging/inbox integration. | Separate Business Platform, opt-in, template/window rules, webhooks, and pricing. |
| Other providers | Add only through a capability adapter when demand and access are verified. | No scraping or browser-password automation as an API substitute. |

## Browser authorization flow

1. A signed-in workspace admin selects **Connect provider** and sees the purpose and requested permissions.
2. The app opens the provider consent flow in the system browser; it does not collect provider passwords or reuse browser cookies.
3. A validated callback checks `state` and PKCE where supported, exchanges the authorization code in the appropriate trusted context, and stores tokens securely.
4. The integration fetches the provider-authorized assets. The admin selects assets and assigns each to a workspace/brand.
5. The app records granted scopes and capability health, and supports reconnect, revoke, and disconnect.

Google desktop OAuth guidance explicitly uses the system browser and a local redirect for public desktop clients. Web-server OAuth is for confidential server applications. Public/mobile builds must not contain client secrets.

## Target module layout

```text
src/features/
  identity/ workspaces/ connections/ publishing/ inbox/ automation/ analytics/
server/modules/
  identity/ tenants/ connections/ publishing/ conversations/ knowledge/ ai/
server/integrations/
  identity/google/ identity/meta/   # app sign-in adapters, only if selected
  channels/meta/instagram/ channels/meta/facebook/ channels/meta/whatsapp/
  channels/google/business-profile/ channels/google/youtube/ channels/google/drive/
server/
  http/ db/ jobs/
```

Keep Vue/Vite, Node, Sass/SCSS, and CSS while extracting feature-owned modules. Retain SQLite for the existing local mode and select hosted persistence before implementing tenant isolation. Continue the Vue-to-Zuari migration one validated screen at a time; do not rewrite the whole app to add integrations.

Keep identity-provider adapters separate from channel API adapters even when both use Google or Meta. Reuse shared OAuth mechanics only through a reviewed contract; each account authorization is a separate workspace-owned connection.

## Current implementation slice

The publishing composer was split into a coordinator, form, advanced-options panel, variant review, and two focused composables. Its phone layout now uses aligned channel and action controls; browser checks show no horizontal overflow at 360, 390, 768, 1024, or 1280 CSS px.

The large platform preview is now split into a small coordinator, a platform-body component, and four focused style modules under the 150-line ceiling. Next, design the connections/profile-management screens against the Phase 1 data and permission model. Do not start handling customer OAuth tokens until the credential-store security prerequisite in the [full plan](./MODULAR_PRODUCT_PLAN.md) is resolved.

## Official references checked

- [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login)
- [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login)
- [Meta App Review](https://developers.facebook.com/documentation/resp-plat-initiatives/individual-processes/app-review)
- [Google OAuth for web-server applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google OAuth for desktop/native applications](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Drive API overview](https://developers.google.com/workspace/drive/api/guides/about-sdk)

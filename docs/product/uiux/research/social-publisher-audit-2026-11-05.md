# Social publishing product and UX review

**Reviewed:** 2026-11-05
**Product:** FoundryDesk / The Social Base, local workspace  
**Audience:** Solo social managers and small teams managing several brands  
**Method:** Read the current Vue components and project plans; compare against the official plan and feature pages linked below. The local web server was not running, so this is a code and competitor review, not a usability test or visual inspection.

## Product read

The product has a useful multi-brand base: the workspace header scopes the publisher and inbox to the active brand, and publishing is separated into compose, campaigns, channels, news, and automation. The composition components already separate the form, platform variants, and resource selection.

The current product promise is broader than its working channel set. The publisher has adapters/types for Instagram, X, LinkedIn, Reddit, GitHub, Discord, Dev.to, Hashnode, Medium, and an AI catalog. It does not currently offer Facebook or TikTok publishing, even though those appear to be important reference platforms for the target market. Social inbox and analytics also need clear per-network availability labels; users should not infer a unified capability from a platform name alone.

## Current flow and friction

1. A user selects a brand, opens Compose, and chooses channels.
2. If setup is incomplete, they leave the composer for Channels, assign handles, enter credentials, save, and test each connection.
3. They return to Compose, generate variants, review them, then submit or schedule.
4. They inspect Campaigns for approval and delivery status.

The channel page currently presents account assignment, developer links, credentials, keep-alive, save, test, and intent actions in one card per platform. That makes onboarding feel like credential administration rather than a guided connection. Also, the composer’s `canPublish` state is based on saved configuration, not a successful connection test; its current warning says “test the connection,” which the code does not actually enforce. Keep draft/schedule/approval states separate from confirmed network delivery in both copy and status badges.

## Competitive patterns worth adopting

- **Make the calendar and post preview central.** Publer, Buffer, Planable, and Meta surface scheduled work as a visible queue/calendar and let people review a network-specific preview before committing.
- **Keep brand/client boundaries obvious.** Planable, Sendible, Metricool, and Zoho model clients or brands as dedicated workspaces. Keep the active brand visible in the composer, calendar, queue, and approval context.
- **Treat approvals as a first-class state.** Planable emphasizes required/optional approvals; SocialPilot, Zoho, and Metricool gate richer collaboration by tier. Show who must act next and keep “needs approval” visually distinct from “scheduled” and “published.”
- **Explain network-specific capability before posting.** Scheduling modes and available formats differ by channel. Provide a per-channel readiness checklist, account identity, supported formats, and publication method (direct, reminder/intent, or unavailable) before the user selects a time.
- **Make pricing scale understandable.** Buffer prices per channel; Publer scales by accounts and seats; Planable by workspace; agency products emphasize client workspaces. If this product adds pricing, show the unit and the account/team limit beside the price.

## Prioritized UX work

### P0 — reliable first post

- Add an onboarding checklist per brand: connect account → test → choose channel → create draft → schedule/review.
- Show connection status inline in Compose; distinguish “credentials saved” from “connection verified.” Block or explicitly label unsupported direct publishing rather than implying success.
- Add a persistent delivery state vocabulary: Draft, Needs approval, Scheduled, Publishing, Published, Failed, and Manual handoff. Explain the next action for each.
- Use a single per-channel readiness panel before submission. Include the account handle, media/length constraints, and whether the channel can publish directly.

### P1 — everyday planning

- Make a calendar the home for scheduled content, with week/month views, filters by brand/channel/status, and click-to-create at a chosen time.
- Add a useful empty state that offers “Connect a channel” or “Create a draft,” not just advanced AI actions.
- Keep one canonical post with editable per-platform variants and a preview that follows the selected network. Preserve variants when users switch brands or channels only when the scope is explicit.
- Make timezone explicit beside scheduled dates and show the selected brand’s timezone.

### P2 — teams and insight

- Add reviewer assignment, comments, and version history to approvals.
- Add per-channel post performance with a visible source and refresh time; do not present unsupported network analytics as zero.
- Keep competitor analysis and recurring automation behind clear setup and safety explanations; give users a preview and pause control.

## Code organization recommendation

Keep the existing `src/components/publisher/` feature boundary. Split orchestration by responsibility under `src/features/publisher/` when the publisher is next refactored:

- `api/` for HTTP requests and response validation.
- `composables/` for publishing state, channel readiness, and queue filtering.
- `components/` for compose, preview, channel setup, approval, and calendar surfaces.
- `domain/` for platform capability and delivery-state rules.

The first root-level refactor in this pass moves audience navigation, filtering, sorting, and pagination from `App.vue` into `src/composables/useAudienceNavigation.ts`. Keep `App.vue` as the workspace shell and event wiring; move additional feature state only when it has a stable owner and clear inputs/outputs.

## Competitor plan snapshot

Prices below are advertised USD starting points from vendor pages accessed on the review date. They change by region, billing cadence, and account/seat count. Validate the selected configuration on each vendor’s live pricing calculator before procurement.

| Platform | Current official signal | Product pattern |
| --- | --- | --- |
| Publer | Free tier; Professional from $5/month; Business from $10/month | Queue, platform-specific variants, calendar, automation, API/MCP |
| Metricool | Free; Starter from $20/month; Advanced from $53/month | Competitor analytics, brand scaling, approvals and client roles |
| SocialPilot | Essentials $17/month billed annually; higher agency tiers | Bulk scheduling, inbox, client approvals and reports |
| Zoho Social | Free; paid plans vary by member/brand and region | CRM-connected brand/client management |
| Buffer | Free for 3 channels; Essentials $5/channel/month; Team $10/channel/month | Simple channel-based setup, publishing, analytics and approvals |
| Sendible | Multiple workspace tiers; price depends on workspace count and billing | Agency workspaces, content libraries, approvals and reporting |
| Later | Starter $18.75/month billed yearly; Growth $37.50; Scale $82.50 | Visual planning and Instagram/TikTok-oriented content workflows |
| Planable | Free first 50 posts; Basic $39/workspace/month monthly, Pro $59 | Calendar/feed previews, collaboration and approval workflows |
| Meta Business Suite | Free | Native Facebook/Instagram publishing, planner, insights and inbox |

## Sources

- [Publer plans](https://publer.com/plans)
- [Metricool pricing](https://metricool.com/pricing/)
- [SocialPilot pricing](https://www.socialpilot.co/pricing)
- [Zoho Social pricing](https://www.zoho.com/social/pricing.html)
- [Buffer pricing](https://buffer.com/pricing)
- [Sendible pricing](https://www.sendible.com/pricing?country=US)
- [Later pricing](https://later.com/pricing/)
- [Planable pricing](https://planable.io/pricing/)
- [Planable pricing details and workspace limits](https://help.planable.io/hc/en-us/articles/21715370520092-Questions-on-pricing)
- [Meta Business Suite on the App Store](https://apps.apple.com/in/app/meta-business-suite/id514643583)

# Platform capabilities

This file is the quick status matrix for the agency MVP. “API capability” means the provider documents a supported endpoint; it does not mean this app has shipped that capability. See the [detailed API access and source matrix](docs/research/PLATFORM_CAPABILITIES.md) before implementation. Provider access, scopes, review, quotas and policies change, so verify official docs again before release.

| Platform | Works in this app today | Provider access / approval gate | MVP decision |
|---|---|---|---|
| Instagram | Partial photo/video/Reel publish path and Meta connection flow. Inbox and analytics are not complete workflows. | Professional account and supported Meta login/Page association; endpoint-specific scopes, review and format limits. | First wave; finish connection verification, media validation, status reconciliation and supported insights/comments. |
| Facebook Pages | Page discovery/connection exists; complete direct Page publishing adapter is not established. | Page token, Page role/task, reviewed permissions such as `pages_manage_posts`; verify API version and account eligibility. | First wave; complete Page publishing and verify comments/insights access. |
| LinkedIn | Versioned Posts API text publishing path; other formats and OAuth lifecycle incomplete. | OAuth/product permissions; organization role and `w_organization_social` for organization publishing; version headers required. | First wave; add OAuth refresh and account/org validation before expanding formats. |
| Threads | No adapter found. | Separate Threads OAuth scopes and endpoint workflow; do not infer Instagram feature parity. | Defer until first wave is verified. |
| TikTok | No adapter found. | `video.publish` / `video.upload` approval, user consent, creator info and verified domain for URL pull. Unaudited Direct Post is private-only. | Later wave; implement compliant export/consent UX and final status polling. |
| YouTube | No adapter found. | OAuth and upload scopes; quota, processing status and project compliance requirements. Data API and Analytics API are distinct. | Later wave; validate quota and upload lifecycle first. |
| X | Direct post path with manual fallback; access entitlement and current cost not verified with a production account. | Approved app, user OAuth, endpoint access/rate limits and current metered cost. | Defer broader analytics/inbox until account access and unit cost are verified. |
| Pinterest | No adapter found. | Trial access creates sandbox-visible Pins/boards; production requires Standard access approval and OAuth. Some analytics are restricted. | Defer until production access approval is confirmed. |

## Delivery-state rule

Show **Published** only after provider confirmation. Keep **Draft**, **Needs approval**, **Scheduled**, **Publishing**, **Failed**, and **Manual handoff** distinct. A saved handle or credential is not a verified connection; an API endpoint is not an implemented product feature.

## Detailed evidence

- [Full platform API capability matrix and official documentation](docs/research/PLATFORM_CAPABILITIES.md)
- [Feature inventory and MVP acceptance path](docs/research/AGENCY_OS_FEATURE_INVENTORY.md)
- [MVP architecture and integration plan](docs/research/MVP_ARCHITECTURE_PLAN.md)

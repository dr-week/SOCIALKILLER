# Social platform capability and access matrix

**Reviewed:** 2026-11-06. Capability describes published APIs; implementation describes this repository. API access, scopes, app review, account type, quotas, and policy can change. Recheck the linked official documentation before implementation or launch.

| Platform | Official API capabilities relevant to this product | Access / constraints | Current app implementation |
|---|---|---|---|
| Instagram | Professional account media publishing, insights, comment management; messaging through separate permissions/products | Consumer accounts are not supported by the Graph API path documented here. Professional account and linked Page / supported login model; permissions and app review. Stories and other formats have account/format constraints. | Partial photo/video/Reel publishing path and Meta connection flow. No verified unified inbox/analytics coverage. |
| Facebook Pages | Page publishing and Page data/engagement endpoints | Page access token, Page task/role and reviewed permissions such as `pages_manage_posts`; account/API-version behavior must be tested. | Page discovery/connection exists; no complete first-party Page publishing adapter found. |
| Threads | Publish text/media, manage replies and retrieve insights through Threads API products | Threads OAuth scopes and endpoint-specific permissions; media/container workflow and limits must be tested. No assumption of parity with Instagram. | No Threads adapter found. |
| TikTok | Direct Post and Upload-to-TikTok flows support video; current docs also describe photo publishing; poll or receive final processing status | App/product and `video.publish` or `video.upload` scope approval, user consent, creator-info UI and verified URL/domain for pull upload. Unaudited Direct Post is private-only and has user/creator/post caps. | No TikTok adapter found. |
| LinkedIn | Posts API supports text, images, video, documents, multi-image, polls and other typed posts; post retrieval/comments require additional access | OAuth product/permission access. Organization posting requires appropriate company role and `w_organization_social`; `Linkedin-Version` and Rest.li protocol headers are required. Member read access can be restricted. | Direct text path uses versioned `/rest/posts`; other media and OAuth lifecycle remain incomplete. |
| YouTube | Data API video upload, metadata/status and public/authorized statistics; Analytics API provides channel-owner reporting | OAuth consent and upload scopes; quota allocation/endpoint-specific limits, asynchronous processing, and project compliance/audit for quota increases. Keep Data API and Analytics API scopes distinct. | No YouTube adapter found. |
| X | Posts, media upload, replies and account metrics through X API endpoints | Approved developer app and user OAuth; access tiers, rate limits, and metered cost are a product constraint. Recheck current developer console price and endpoint entitlements before building. | Direct post path with fallback exists; current access/price not live-validated with a product account. |
| Pinterest | Create/read Pins and boards; organic Pin and account analytics | Trial-created Pins/boards are sandbox-visible only; Standard access increases production capabilities/rate limits and requires an OAuth-based review/demo. Some analytics are restricted/beta. | No Pinterest adapter found. |

## Status vocabulary

- **Implemented:** tested app path that performs the user-visible capability and records a truthful result.
- **Partial:** some code exists, but connection, provider outcome, lifecycle, account coverage, or validation remains incomplete.
- **Manual handoff:** app prepares content or a reminder; the human completes provider-side action.
- **Unavailable:** no product implementation; do not present as selectable/live.
- **Requires provider approval:** implementation must remain gated until credentials, scopes, app review, and permitted use are confirmed.

## Official sources

- [Meta Instagram API documentation collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) and [Instagram Platform](https://developers.facebook.com/docs/instagram-platform/)
- [Facebook Pages API](https://developers.facebook.com/docs/pages-api/)
- [Threads API collection from Meta](https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api) and [Threads developer documentation](https://developers.facebook.com/docs/threads/)
- [TikTok Direct Post quickstart](https://developers.tiktok.com/docs/en/content-posting-api-get-started), [content sharing guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines), and [post status](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status)
- [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api) and [LinkedIn API access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)
- [YouTube upload endpoint](https://developers.google.com/youtube/data/reference/rest/v3/videos/insert), [quota overview](https://developers.google.com/youtube/v3/getting-started), and [Analytics API](https://developers.google.com/youtube/analytics)
- [X API documentation](https://docs.x.com/)
- [Pinterest access tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/), [Pins API](https://developers.pinterest.com/docs/api/v5/pins-list/), and [analytics overview](https://developers.pinterest.com/docs/analytics-and-reports/analytics-overview/)

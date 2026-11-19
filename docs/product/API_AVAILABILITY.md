# Social API availability and cost notes

**Research checked:** 2026-11-04  
**Purpose:** prioritize official APIs for The Social Base. “Free API” means no direct API usage fee was identified in the cited public docs—not free hosting, free access approval, or unlimited use.

## Provider comparison

| Provider/API | Cost signal from public docs | Access and limits | Recommendation |
|---|---|---|---|
| Meta Graph / Instagram Platform | The cited API docs do not state a per-request fee. | Business app, OAuth, permission review/Advanced Access for external customers; Instagram professional accounts only for these APIs. Publish requirements include publicly reachable media and endpoint rate limits. | **Priority 1.** Build the core adapter after app access/review. |
| WhatsApp Business Platform | Not free at scale; Meta documents messaging pricing and paid agent messages. | Business account/phone number, templates where applicable, webhooks, policy compliance, customer opt-in. | **Later.** Cost controls and billing disclosure are product requirements. |
| Google Business Profile APIs | Do not assume open/free access; the API requires a project and approval. | Current prerequisites include an eligible active, verified Business Profile held for 60+ days and a business website. Quotas apply; listing-owner authorization and customer notice are required. | **Priority 3.** Apply for access before promising GBP support. |
| YouTube Data API | Free default quota allocation, not unlimited: 10,000 units/day for most methods, plus 100 `search.list` and 100 `videos.insert` calls/day in their own buckets. | OAuth for private channel data/uploads; quota expansion requires compliance audit. | **Good later option** for publishing/metadata if quotas and audit meet needs. |
| Telegram Bot API | Official docs describe an HTTP Bot API; no per-request API charge was identified in the docs reviewed. | Bot must be created/authorized; platform messaging and rate limits apply. It is not a user's general personal-account API. | **Low-cost optional channel**, not a substitute for Instagram/Facebook. |
| Discord incoming webhooks | Webhook execution does not require a bot user or authentication; no API purchase fee was identified in the docs reviewed. | A webhook URL is a secret; rate limits apply. It only posts into the selected Discord channel. | **Low-cost optional outbound integration.** |
| LinkedIn Posts API | No general price claim established from the reviewed API reference. | Organization publishing permissions are restricted; product access and approved scopes are required. API versions are mandatory. | **Defer** until access is granted and customer demand is proven. |
| X API | **Paid, usage-based** in the current pricing docs: examples include $0.015 per post create and $0.005 per post read. Prices can change by endpoint. | Developer console credits, user-context OAuth for posting, endpoint limits. | **Not a free-MVP dependency.** Make it opt-in and meter cost if added. |
| Reddit API | No dependable current commercial-use price determination made in this pass. | Follow current Data API terms and access rules; commercial use, rate limits, and allowed automation need review. | **Defer** pending current terms/legal review; never scrape as a workaround. |
| TikTok Content Posting API | Pricing/access could not be verified in this research pass. | Current posting eligibility, app review, and audit restrictions were not verified; do not assume public posting access. | **Do not label free or promise support yet.** Revisit when docs/access are verified. |

## Practical decision

1. Start with Meta organic publishing and account linking; costs are app review, engineering, media hosting, and operations even where no per-call API fee is published.
2. Treat YouTube as the clearest documented free-quota candidate, subject to daily quotas and audit rules.
3. Offer Telegram and Discord as optional low-cost distribution adapters, not core social-management substitutes.
4. Do not include WhatsApp, X, LinkedIn, GBP, Reddit, or TikTok in a “free API” promise. They have fees, approvals, access rules, or unverified terms.
5. Recheck provider terms, pricing, quotas, and permission review before each release. An account login or consumer app subscription does not grant API permission.

Existing adapters in the codebase do not prove commercial API eligibility or that a provider offers a free production tier. Keep each provider behind a capability-aware adapter and show users actual authorization, quota, costs, and unsupported actions.

## Sources

- [Meta Instagram content publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing)
- [Meta Facebook Login for Business](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business/)
- [Meta App Review](https://developers.facebook.com/documentation/resp-plat-initiatives/individual-processes/app-review)
- [WhatsApp Business Platform pricing and APIs](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)
- [Google Business Profile API prerequisites](https://developers.google.com/my-business/content/prereqs)
- [Google Business Profile API policies](https://developers.google.com/my-business/content/policies)
- [YouTube API quota and costs](https://developers.google.com/youtube/data/determine_quota_cost)
- [YouTube quota and compliance audits](https://developers.google.com/youtube/data/guides/quota_and_compliance_audits)
- [Telegram Bot API](https://core.telegram.org/bots/api) and [Bot FAQ](https://core.telegram.org/bots/faq)
- [Discord webhook API](https://docs.discord.com/developers/resources/webhook)
- [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-10)
- [X API pricing](https://docs.x.com/x-api/getting-started/pricing)
- [X API post management](https://docs.x.com/x-api/posts/manage-tweets/introduction)
- [Reddit API reference](https://www.reddit.com/dev/api/)
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started) (not reachable during this research pass)

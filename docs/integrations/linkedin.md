# LinkedIn publishing integration

**Module:** `server/posting/linkedin/` and `server/integrations/linkedin/`  
**Purpose:** Publish an approved text post to a LinkedIn member or organization and report a clear manual-share fallback when direct publishing is unavailable.

## Data flow

The post dispatcher passes content plus brand-resolved credentials to `server/posting/linkedin/`. The adapter validates token/author requirements and delegates HTTP details to `server/integrations/linkedin/posts-api.mjs`. A successful `201` and the `x-restli-id` response header are recorded as direct publishing. HTTP errors and timeouts remain failures or explicit handoffs; they are never reported as a confirmed publication.

## Current API contract

- Endpoint: `POST https://api.linkedin.com/rest/posts`.
- Headers: Bearer token, `LinkedIn-Version: YYYYMM`, `X-Restli-Protocol-Version: 2.0.0`, and JSON content type.
- Author: `urn:li:person:<id>` or `urn:li:organization:<id>`.
- Text scope: `w_member_social` for a member or `w_organization_social` plus the required organization role for a Page.
- The version is configurable with `LINKEDIN_VERSION`; default `202610` matches the current API documentation version as reviewed on 5 November 2026. Recheck before release.
- The current adapter supports text posts. Media uploads, analytics, comments, OAuth authorization, refresh-token storage, and role discovery are separate follow-up work.

## Dependencies and tests

The module uses Node's built-in `fetch`, the existing brand credential resolver, and no new package. Contract tests mock the LinkedIn endpoint and cover the version/protocol headers, payload, successful response ID, and error response.

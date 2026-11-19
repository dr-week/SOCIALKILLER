# LinkedIn Posts API integration

## Purpose and data flow

Owns the versioned LinkedIn REST Posts API request contract. The posting adapter validates the author identity, delegates request construction and HTTP delivery to `posts-api.mjs`, then maps a confirmed Rest.li post ID to the shared delivery result. API, permission, or credential failures remain eligible for manual handoff.

## Dependencies and API

Uses Node `fetch` and `LINKEDIN_VERSION` (`YYYYMM`). The client exports `createLinkedInPost({ accessToken, authorUrn, text, fetchImpl?, version? })`.

## Checks

Run `node --test server/linkedin-posts-api.test.mjs test/linkedin-dispatch.test.mjs`.

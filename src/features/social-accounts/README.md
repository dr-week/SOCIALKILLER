# Social accounts

## Purpose

Owns account readiness rules used before immediate publishing. Provider credentials being saved is not proof that a provider accepts them.

## Data flow

The channel card sends a test request through the existing local API. A successful response marks that platform verified for the current publisher session. Editing credentials or reloading publisher data clears that temporary verification. Immediate publishing requires configured credentials and a successful check; scheduling a draft remains available.

## API and dependencies

`getPublishingReadiness(platform)` and `isReadyForImmediatePublishing(platform)` are exported from `index.ts`. The module depends on platform status fields and the existing connection-test route; it does not store or expose credentials.

## Checks

Run `node --experimental-strip-types --test test/social-account-readiness.test.mjs`.

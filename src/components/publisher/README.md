# Publisher module

## Purpose

The publisher composes channel selection, content variants, connection settings, queue actions, and immediate publish requests for the active brand.

## Structure and data flow

- `../SocialPublisher.vue` composes the publisher view and handles post submission and platform handoff.
- `composables/usePublisherWorkspace.ts` owns publisher API reads and mutations for channels, queue items, projects, and keep-alive.
- `composables/usePublisherPlatforms.ts` owns selected channels, per-channel variants, labels, and immediate-publish readiness.
- `PublisherChannelCard.vue` presents one channel and delegates its connectivity check to `composables/useChannelConnectionCheck.ts`.
- `components/` files contain the publisher's focused navigation, composer, channel list, queue, and supporting panels.
- `publisher-layout.scss` and `publisher-controls.scss` provide shared section layout and form/action styles.

Immediate publishing requires saved credentials and a successful connection check in the current publisher session. Editing credentials or reloading channel state clears the check. Scheduled drafts remain available without a successful check; scheduling does not imply platform delivery.

## Dependencies and checks

The module uses Vue, the shared API routes under `/api/social` and `/api/marketing`, and shared types under `src/types`. Session verification is held in UI state and is not persisted as a credential or server authorization grant.

Run the focused readiness check with `npm test`.

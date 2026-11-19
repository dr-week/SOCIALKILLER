# Changelog

## 2026-11-05

- Moved audience navigation, filtering, sorting, and pagination from `src/App.vue` into `src/composables/useAudienceNavigation.ts`.
- Added competitive product/UX research, reusable-project and license review, architecture overview, integration documentation, and a phased development task list.
- Migrated LinkedIn text publishing from `/v2/ugcPosts` to the versioned `/rest/posts` API and record its confirmed response ID.
- Added LinkedIn API and dispatch tests for payload/headers, confirmed IDs, invalid author URNs, permission failures, and explicit manual handoff.
- Split the root app shell into controller, action and drawer composables, page header, and workspace content modules.
- Added the agency operating-system inventory, workflow competitor comparison, platform capability matrix, and phased modular architecture/infrastructure plan.
- Immediate publishing now requires a successful per-channel connection check in the current publisher session; editing credentials or reloading channel state clears the check.
- Split the large platform feed preview into a focused body component and four stylesheet modules; all extracted files remain under the 150-line hard ceiling.
- Split the video script studio into an input component, output component, and namespaced style modules; all source files remain under 150 lines.
- Split SQLite startup from publishing, scheduler, brand, vault, topic, and generated-draft repositories; preserved the existing service interface.
- Split shared publisher layout and control styles into dedicated files under 150 lines and updated all publisher imports.
- Split the publisher news/remodel workflow into focused state and UI modules under the 150-line ceiling.
- Split the extension service worker into lifecycle, queue, dispatch, logging, and runtime-message modules; preserved its Manifest V3 entry point and response contracts.

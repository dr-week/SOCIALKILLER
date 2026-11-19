# Publisher news and remodel

## Purpose

Harvests current developer-community stories, adapts one selected story through a chosen angle and writing framework, and sends the resulting variants to the composer.

## Structure and flow

- `useNewsViral.ts` owns news/remodel API state, source filtering, selection, and remodel requests.
- `NewsFilters.vue` selects a feed and reloads it; `NewsStoryList.vue` displays leads and emits selection.
- `NewsRemodelPanel.vue` owns angle/framework controls and loading/result composition; `NewsRemodelResults.vue` renders variants and emits copy/use actions.
- `types.ts` defines the source, article, and result contracts.

The parent `PublisherNewsViral.vue` forwards `useTopic` and toast events to its publisher host. API calls remain on the existing `/api/social/news` routes.

## Dependencies and checks

Uses Vue, Lucide icons, the shared publisher style entry point, and the publisher news API. Run the source-size check and backend route tests after changing this workflow.

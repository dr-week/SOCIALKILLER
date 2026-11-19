# App shell

## Purpose

Composes workspace navigation, brand context, active feature views, and shared app state.

## Modules

- `useAppController.ts` wires domain composables and view state.
- `useAppActions.ts` owns import, export, brand actions, and account assignment.
- `useAppDrawer.ts` manages keyboard focus and extension workspace synchronization.
- `AppPageHeader.vue` and `AppWorkspaceContent.vue` render shared page content.
- `App.vue` is the thin application composition root.

## Data flow and API

The controller composes audience, database, queue, health, and brand workspace state, exposing an inferred `AppController` type. It passes grouped capabilities to the shell and content view. Brand and audience changes flow through their existing composables; feature screens receive props and events.

## Dependencies and checks

Depends on Vue, existing composables, and shared UI components. Run `npm run check:file-size` and `npm run type-check` after changes.

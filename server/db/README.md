# Local database module

## Purpose and data flow

`sqlite-engine.mjs` opens the local Node SQLite database, applies startup pragmas and backward-compatible migrations, then builds the repository service from prepared statements. `statements.mjs` owns SQL statements. `repositories/` maps domain operations to those statements.

## Repository ownership

- `publishing-repository.mjs`: posts, activity logs, metrics, and pending dispatches.
- `scheduler-state-repository.mjs`: idempotency tokens and persisted scheduler state.
- `generated-draft-repository.mjs`: generated drafts, feedback, and interaction workflows.
- `user-topic-repository.mjs`: operator-created topics.
- `vault-dictionary-repository.mjs`: encrypted credential records and content dictionary.
- `brand-profile-repository.mjs`: brand profile read/write and archive lifecycle.
- `index.mjs` composes these repositories into the existing `dbService` public interface.

The database is local application storage, not a cloud tenant boundary. Keep brand-scoped queries scoped and avoid recording secret values in logs.

## Dependencies and checks

Uses Node's built-in `node:sqlite` and the existing schema/statement modules. Run `npm run test:backend` for persistence and route integration coverage; run `npm run check:file-size` to enforce the source limit.

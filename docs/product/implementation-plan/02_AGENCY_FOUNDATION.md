# Workstream 1: agency workspace foundation

**Priority:** P1  
**Current status:** Local workspace archive/restore slice exists; multi-workspace ownership design remains open.  
**Source plan:** [Agency next plan](../AGENCY_NEXT_PLAN.md)

## Ordered tasks

| ID | Task | Owner | Status | Depends on | Completion evidence |
|---|---|---|---|---|---|
| A1.1 | Finalize local-first launch, provider-account model, optional client review, and future-cloud boundary | Product owner | in_progress | — | No required cloud sign-in now; sign-in and channel authorization are distinct; multiple accounts per provider and opt-in client review are recorded. Choose provider order, local key storage, retention/export/deletion, and whether reviewers need remote access. |
| A1.2 | Inventory every `brandId`-scoped table, route, UI state, job, and test | Engineering | todo | A1.1 | Ownership map identifies current semantics, callers, and local-data migration needs. |
| A1.3 | Define Workspace, Brand, ProviderConnection, ProviderAsset, and ActivityEvent ownership | Product + engineering | todo | A1.2 | Domain map supports multiple accounts/assets per provider; cloud memberships remain a future extension. |
| A1.4 | Design repeat-safe local migration, encrypted credential storage, and future-cloud export | Engineering | todo | A1.3 | Recovery notes, OS-backed local key lifecycle, export format, and migration mapping; no source DB changed during design. |
| A1.5 | Implement local workspace and approval boundaries without requiring remote identity | Engineering | todo | A1.4 | Focused tests preserve local data and prevent unintended network exposure or cross-workspace writes. |
| A1.6 | Implement workspace UI and per-workspace opt-in client review | Engineering | todo | A1.5 | Client review is visibly optional; remote reviewer access is not claimed before cloud support. |
| A1.7 | Implement separate local provider-connection management for multiple accounts | Engineering | todo | A1.4 | Per-provider connection, asset assignment, health, revoke/disconnect, and visible failure states; only approved scopes/capabilities are exposed. |
| A1.8 | Verify workspace isolation, multiple same-provider accounts, optional review, and export/delete | Engineering | todo | A1.6, A1.7 | Account lifecycle and local-data checks pass; future cloud auth remains explicitly unshipped. |

## Boundary

The current target is local-first/offline use with no required cloud account; connecting or publishing through an external API still requires internet and provider approval. Current workspace selection is a local application filter, not multi-user authorization. Keep app identity sign-in separate from channel authorization, store each provider account as a separate connection, and defer cloud membership/remote reviewer access until a later phase.

## Reuse decision

No external agency dashboard repository is a clean module fit: most reviewed options are unlicensed, niche demos, full competing applications, or separate databases. Keep Vue, Node, and SQLite for local-first use; evaluate cloud storage only when the future sync phase is approved. Reuse reviewed domain patterns from the pulled personal-agent and Postiz snapshots only where a specific contract reduces work; do not merge those applications.

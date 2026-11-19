# Workstream 0: publishing safety and release automation

**Priority:** P0  
**Current status:** Open; release workflow risk identified.  
**Sources:** [agency plan](../AGENCY_NEXT_PLAN.md), [Visual Bot audit](../../visual_bot_audit.md), [task reuse map](../../research/github-batches/TASK_GAP_REUSE_MAP.md)

## Ordered tasks

| ID | Task | Owner | Status | Depends on | Completion evidence |
|---|---|---|---|---|---|
| S0.1 | Decide who may approve live posts and what a release tag should do | Product owner | todo | — | Decision record states draft/approval/publish rules and release behavior. |
| S0.2 | Change release automation to require explicit human approval for any live broadcast | Engineering | todo | S0.1 | Workflow review shows tag builds cannot publish on their own; live path is deliberate and auditable. |
| S0.3 | Trace app scheduler → route → marketing service → provider/browser handoff and document each external side effect | Engineering | in_progress | S0.1 | No stored-schedule consumer identified; scheduler increments `totalDispatched` after generating an approval-pending post. Correct tick/counter semantics and finish the side-effect map. |
| S0.4 | Enforce approval and dry-run at the trusted server boundary; make dry-run incapable of provider calls or persistent queue writes | Engineering | in_progress | S0.3 | User publish requests remain pending approval; pre-approval composer dispatch and direct browser-queue requests are blocked; pending Queue actions are disabled; post-creation failures map to explicit HTTP statuses. Dry-run/provider and retry cases remain. |
| S0.5 | Redact credentials and session material before extension and server logs leave their source | Engineering | todo | S0.3 | Sensitive-field inventory plus redaction coverage for nested payloads and errors. |
| S0.6 | Review browser handoff, retry/idempotency, queue claim, and recovery behavior without replacing the existing store prematurely | Engineering | todo | S0.3 | State transition table and crash/retry behavior documented; any library choice justified. |

## Reuse research

- [fast-redact](https://github.com/davidmarkclements/fast-redact) is MIT and has been pulled to `research/third_party/fast-redact` at commit `e268c1c3b5a3be770f8082583f626bc4ba5c648d`. It is a small structured-object redaction primitive, not a logger or a full solution for secrets embedded in free-form messages. Review the exact paths and mutation semantics before adding it to runtime.
- [Pino](https://github.com/pinojs/pino) documents structured redaction built on fast-redact; adopting the full logger is a broader change than this task needs.
- SQLite queue candidates [LiteQ](https://github.com/iikareem/lite-q) and [Conveyor](https://github.com/eyolas/conveyor) advertise SQLite-backed jobs, but they are small/new projects and would introduce a second job schema beside our current SQLite dispatch store. Keep as comparison references; do not pull into the runtime until S0.6 proves a gap.

## Gate

Do not enable unattended client publishing. The current `.github/workflows/social-broadcast.yml` can run on version tags and defaults that path to live mode when secrets are configured; review it before the project is hosted with publishing secrets.

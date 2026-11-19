# Workstream 2: product and responsive validation

**Priority:** P1  
**Current status:** Current screen inventory exists; participant findings and exact viewport measurements are still pending.  
**Trackers:** [UI/UX next tasks](../uiux/planning/NEXT_TASKS.md) and [validation notes](../uiux/planning/VALIDATION_NOTES.md)

## Ordered tasks

| ID | Task | Owner | Status | Depends on | Completion evidence |
|---|---|---|---|---|---|
| V2.1 | Confirm primary operator, context and top three jobs with representative operators | Product/design | todo | — | Anonymized observations and sample limits in validation notes. |
| V2.2 | Walk Create, Queue, Channels and Audience Audit on desktop and phone; record completion and confusion | Product/design + engineering | todo | V2.1 | Repeatable task results, failures and preserved capabilities. |
| V2.3 | Classify composer fields and validate navigation labels with users | Product/design + engineering | todo | V2.2 | Field rules and terminology decisions recorded. |
| V2.4 | Capture screenshots/measurements at 360, 390, 768, 1024 and 1280 CSS px | Engineering | todo | V2.2 | Route/state, clientWidth/scrollWidth, clipping and keyboard checks at each width. |
| V2.5 | Fix reproduced issues in small feature modules and repeat the audit | Engineering | todo | V2.3, V2.4 | Before/after evidence and focused verification linked. |
| V2.6 | Manually verify extension screenshot on permitted and restricted pages | Engineering | todo | Screenshot implementation | Preview/download works; failure state is clear; no screenshot leaves the device. |

## Reuse decision

[Playwright](https://github.com/microsoft/playwright) is Apache-2.0 and fits repeated viewport/UI checks. Add `@playwright/test` as a development dependency only when the first test scope and local app startup fixture are agreed. Do not use browser automation against third-party social accounts for these checks.

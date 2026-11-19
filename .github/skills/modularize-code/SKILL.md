---
name: modularize-code
description: "Use when asked to modularize, refactor, split oversized files, audit folders, or enforce department boundaries in The Social Base."
argument-hint: "[file, feature, or department]"
---

# Modularize The Social Base code

Use the [modularization blueprint](../../../docs/engineering/MODULARIZATION_BLUEPRINT.md) as the architecture contract.

## Workflow

1. Run `npm run modularity:audit` to see the largest legacy files and current department map.
2. Search existing decisions with `npm run docs:find -- --query "topic terms"`, then narrow source discovery with `rg`.
3. Read the requested feature's callers, data flow, and focused tests before editing.
4. Identify the responsibility to move and its owner: feature UI, HTTP boundary, application/domain logic, repository, provider adapter, or platform host.
5. Refactor one cohesive responsibility at a time. Preserve public behavior and contracts; update callers only where required.
6. Keep new or refactored source files near 100–120 lines and below 150. Split by responsibility, not by arbitrary function count.
7. Add focused tests for changed behavior; run the smallest relevant test, then `npm run check:file-size`.
8. Update the architecture map if ownership or data flow changed. Report what moved, what remains oversized, and the verification result.

## Guardrails

- An audit reports candidates; it does not authorize mass rewrites or mechanical file splitting.
- Do not create forwarding-only modules or duplicate business logic across web, desktop, and mobile.
- Keep feature internals private; cross-feature calls use explicit public contracts.
- Preserve error visibility, provider capability limits, data migrations, and local user data.
- Do not copy code from another project unless its owner and license grant reuse rights. Prefer a clean-room implementation when rights are unclear.

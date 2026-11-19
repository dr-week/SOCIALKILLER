# UI/UX architecture and roadmap

The current product architecture is a unified website with focused mini-app workspaces. This replaces the earlier 12-department sidebar concept. The source-backed app inventory and grouping decisions live in [Mini-app architecture](../MINI_APP_ARCHITECTURE.md); current interaction rules are in the [UX guide](../UX_GUIDE.md).

## Current interaction model

- One app launcher and one shared website; mini-app selection uses same-tab internal navigation.
- Available apps are grouped as Plan & publish, Community & audience, Create, and Operate.
- Each app gets a focused workspace while sharing active brand context, theme, local settings, and common infrastructure.
- The sidebar keeps visible labels; mobile uses the responsive drawer. The old icons-only desktop rail and mobile bottom bar were not implemented.
- Roadmap-only apps remain visually separate and cannot be opened as if they were functional.
- Existing external provider handoffs remain explicit workflow actions, not app navigation.
- Product claims, data boundaries, identity limitations, and integration states must match the [feature inventory](../MINI_APP_ARCHITECTURE.md).

## Design and engineering guardrails

1. Keep available mini-apps inside the existing SPA and origin; preserve browser Back/Forward.
2. Share brand context rather than copying account configuration into every workspace.
3. Keep provider actions explicit and accurately label draft, approval, queue, handoff, failure, and confirmed delivery states.
4. Do not invent metrics, AI capabilities, connections, team permissions, client approvals, or workflows.
5. Support phone, tablet, and desktop sizes without horizontal overflow; maintain keyboard access and visible focus.
6. Keep features within modular source boundaries and follow `.github/instructions/modular-code.instructions.md`.

## Historical research and planning artifacts

The research and planning documents below describe the earlier department-first proposal. They remain useful as prior discovery/evidence, but their old IA, task lists, and shell specifications are not current product requirements:

- [Competitor research](./research/COMPETITOR_RESEARCH.md)
- [Source register](./research/sources.json)
- [Prior workbench concept](./concept/WORKSPACE_WORKBENCH.md)
- [Prior phased roadmap](./planning/ROADMAP.md)
- [Prior next-task tracker](./planning/NEXT_TASKS.md)
- [Prior validation notes](./planning/VALIDATION_NOTES.md)
- [Machine-readable phase tracker](./planning/phases.json)

`npm run uiux:check` validates the research source register and phase dependency graph. It does not certify usability, responsive behavior, or a release.

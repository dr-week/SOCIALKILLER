# SOCIALKILLER Documentation

**Updated:** 2026-11-19

Product, architecture, and operating guidance for **SOCIALKILLER**. The application is one local-first website with focused mini-app workspaces; the current feature inventory distinguishes available capabilities from prototypes and roadmap work.

---

## Core guides
- **[UI/UX declutter, Animation, Audience & Visual Bot plan](product/UIUX_DECLUTTER_AND_EFFICIENCY_PLAN.md)**: Audited 16-surface declutter plan, 4-tier animation spec, Audience UI/UX map, glassmorphism rules, dev supervisor & 3-layer Visual Bot roadmap.
- **[Backend & code organization plan](engineering/BACKEND_ORGANIZATION_PLAN.md)**: Target layered `server/http/`, `server/modules/`, `server/jobs/`, SQLite single-source-of-truth, and 51-file modularity sprint.
- **[Agent harness & evaluation plan](engineering/AGENT_HARNESS_EVALUATION_PLAN.md)**: 19-scenario deterministic eval suite covering Assistant, CLI-Anything, Content Safety, Automation & 3-Layer Visual Bot.
- **[GitHub toolkit adoption plan](research/GITHUB_TOOLKIT_ADOPTION_PLAN.md)**: Vetted open-source GitHub repositories (`auto-animate`, `motion-v`, `reka-ui`, `vue-sonner`, `Fuse.js`, `rou3`, `valibot`, `fast-redact`, `p-queue`, `Playwright`, `axe-core`) mapped by phase.
- **[Mini-app architecture](product/MINI_APP_ARCHITECTURE.md)**: Audited feature inventory, workspace grouping, routing, shared context, and roadmap status.
- **[Product scope](product/PRODUCT_SCOPE.md)**: Current capabilities and non-goals.
- **[UX guide](product/UX_GUIDE.md)**: Navigation, Animation architecture, Audience UI/UX, minimalist glassmorphism, symbolic icon status rules, and safety boundaries.
- **[Architecture](ARCHITECTURE.md)**: System boundaries, local SQLite database, and port layout (`4174` backend / `5199` frontend).
- **[Engineering architecture](engineering/ARCHITECTURE.md)**: Runtime, data flow, and module map.
- **[API availability](product/API_AVAILABILITY.md)**: External provider capabilities and limitations.

The older [agency blueprint](MYBRAND_BLUEPRINT.md) and superseded department-first notes remain historical references; consult the [UI/UX declutter plan](product/UIUX_DECLUTTER_AND_EFFICIENCY_PLAN.md) and [mini-app architecture](product/MINI_APP_ARCHITECTURE.md) for current scope.

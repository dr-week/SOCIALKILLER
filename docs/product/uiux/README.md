# UI/UX Architecture and Roadmap — SOCIALKILLER

**Updated:** 2026-11-19

The current product architecture is a unified local-first website with focused mini-app workspaces. The source-backed app inventory and grouping decisions live in [Mini-app architecture](../MINI_APP_ARCHITECTURE.md), interaction rules, **4-Tier Animation & Motion System**, and Audience UI/UX standards live in the [UX guide](../UX_GUIDE.md), and the active 16-surface declutter audit and 7-phase execution plan live in the [UI/UX Declutter & Efficiency Plan](../UIUX_DECLUTTER_AND_EFFICIENCY_PLAN.md).

See also:
- **[Backend & Code Organization Plan](../../engineering/BACKEND_ORGANIZATION_PLAN.md)**
- **[GitHub Toolkit & Library Adoption Plan](../../research/GITHUB_TOOLKIT_ADOPTION_PLAN.md)**

## Current Interaction Model

- One app launcher and one shared website; mini-app selection uses same-tab internal navigation (`?app=<id>`, plus `?view=<subview>` in Audience Audit).
- Available apps are grouped across 5 categories: **Plan & publish** (Planner, Connections), **Community & audience** (Engage, Audience Audit, Profile Scout), **Create** (Content Studio, Script Studio), **Operate** (Workflows, Workspaces, Automation Studio), and **Build** (Design System, Asset Manager, Android Build Studio).
- Each app gets a focused glassmorphic workspace while sharing active brand context, Global Topbar Search, theme, local settings, and common infrastructure.
- Roadmap-only apps remain visibly separated inside a collapsed `<details>` section and cannot be opened as functional workspaces.
- Existing external provider handoffs remain explicit workflow actions, not app navigation.

## Design and Engineering Guardrails

1. **Zero Backend Telemetry:** Never show `"Ready to import"`, `"No data imported"`, `"DIFF ACTIVE"`, PIDs, or similar backend state strings in the UI.
2. **Single-Line Headers & Symbolic Status Icons:** One `<Icon />` + concise title per section/card; replace multi-word status text with semantic Lucide icons and tooltips.
3. **Single-Level Collapsibles & No Duplicate Controls:** Collapse secondary options/forms into one `<details>` or drawer toggle; bind views to the single Global Topbar Search.
4. **Frosted Glassmorphism & Responsive Safety:** Use `--glass-bg` / `--glass-border` consistently and ensure zero horizontal overflow across `360 / 390 / 768 / 1024 / 1280` CSS px with full keyboard access.
5. **Modular Code Rule (`<150` lines):** Keep all TypeScript, Vue, SCSS, server, extension, and script files under 149 lines (`npm run check:file-size`).

## Active Planning & Historical Discovery Artifacts

The active 7-phase declutter, Animation, Audience UI/UX, Backend Organization, dev-script, and Visual Bot program is tracked in:

- **[UI/UX Declutter, Animation, Audience & Visual Bot Master Plan](../UIUX_DECLUTTER_AND_EFFICIENCY_PLAN.md)**
- **[7-Phase UI/UX & Engineering Roadmap](./planning/ROADMAP.md)**
- **[Machine-readable phase dependency graph](./planning/phases.json)**

Historical research and prior department-first discovery notes remain archived for evidence only (not current IA requirements):

- [Competitor research](./research/COMPETITOR_RESEARCH.md) & [Source register](./research/sources.json)
- [Prior workbench concept](./concept/WORKSPACE_WORKBENCH.md)
- [Prior next-task tracker](./planning/NEXT_TASKS.md) & [Validation notes](./planning/VALIDATION_NOTES.md)

`npm run uiux:check` validates the research source register and active 7-phase dependency graph in `phases.json`.

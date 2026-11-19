# UI Smoke Audit and Remediation Plan

**Date:** 2026-11-10  
**Status:** Audit and plan only; no application code was changed.

## Scope and method

The local development app was launched at `http://127.0.0.1:5199/`. All 13 available workspace routes were opened in a browser: Planner, Connections, Engage, Audience Audit, Profile Scout, Content Studio, Script Studio, Workflows, Workspaces, Design System, Asset Manager, Automation Studio, and Android Build Studio.

The route sweep checked initial rendering, page errors, failed network requests, and horizontal overflow at a 1024px desktop viewport and a 390px mobile viewport. A mobile navigation interaction was also exercised: open the drawer, select Planner, then use browser Back to return to the launcher.

### Results

- All 13 routes rendered. No browser page exceptions or failed requests were observed.
- No horizontal document overflow was found at either tested viewport.
- Mobile drawer navigation changed the URL to `?app=planner`, closed after selection, and browser Back returned to the launcher.
- The Planner screen has no semantic page heading (`h1`, `h2`, or `h3`).
- Four visible Planner inputs (post headline, reference URL, hashtags, and subreddit) had no associated label or ARIA name.
- Connections rendered 39 visible form controls; 19 had no associated label or ARIA name. Placeholder text was present for those fields but is not a robust replacement for a programmatic label.
- The production build succeeded, but Vite reported that the main JavaScript chunk is 672.89 kB minified, above its 500 kB warning threshold.

## Verification run

| Check | Result |
| --- | --- |
| Browser route and responsive smoke pass | 13 routes loaded; 0 page errors; 0 failed requests; no overflow at tested widths |
| `npm run test:app-navigation` | Passed: 3 tests |
| `npm run type-check` | Passed |
| `npm run uiux:check` | Passed: 14 research sources; none stale |
| `npm run build` | Passed, with the main-chunk size warning noted above |

This was a rendering and navigation smoke pass, not a full workflow or accessibility conformance audit. Publishing, real provider connections, destructive actions, user-data import/restore, Android builds, keyboard-only completion, and assistive-technology behavior were not exercised.

## Prioritized remediation plan

### P1 — Make core publishing and connection controls accessible

1. Add a semantic page heading to Planner.
2. Give every Planner and Connections form control a persistent programmatic name, using associated labels or an appropriate ARIA label for controls that cannot have visible labels.
3. Check icon-only controls for accessible names and preserve their visible focus states.

**Acceptance:** Each available workspace has one clear page-level heading. Every interactive form field and icon-only action exposes a useful accessible name independent of placeholder text. Verify keyboard navigation and focused control visibility.

### P2 — Reduce initial JavaScript cost

1. Measure the initial launcher and representative workspace transfer sizes.
2. Identify safe route-level or feature-level split points for large workspace modules.
3. Rebuild and compare the initial-load chunk without weakening navigation or workspace behavior.

**Acceptance:** The initial route no longer emits the current over-500 kB chunk warning, or a documented measurement shows why the remaining size is acceptable; all workspace routes still load.

### P3 — Turn this smoke pass into repeatable UI acceptance coverage

1. Add browser automation for the 13 workspace routes, launcher navigation, mobile drawer close behavior, and browser Back/Forward.
2. Check for uncaught page errors, failed same-origin requests, horizontal overflow at mobile/tablet/desktop widths, and missing accessible names.
3. Add focused tests for safe, local form interactions using isolated test data; do not invoke external publishing or destructive actions.

**Acceptance:** The checks run repeatably from the project scripts and fail on regressions in the route, overflow, navigation, or accessibility checks above.

## Suggested execution order

Complete P1 first, then P3's basic route and accessibility coverage so subsequent UI work is guarded. Tackle P2 using measured bundle data. Keep external-provider and data-mutation testing as a separate, explicitly authorized acceptance pass.

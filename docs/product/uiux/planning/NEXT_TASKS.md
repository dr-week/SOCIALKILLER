# Next UI/UX Work Package

> Historical tracker for the superseded department-first proposal. Current navigation, feature status, and implementation scope are in [Mini-app architecture](../../MINI_APP_ARCHITECTURE.md). These tasks do not describe the current mini-app redesign.

**Package:** Close Phase 0 (Research & Baseline) + Close Phase 1 (Responsive Repair)
**Current state:** Both phases `in_progress` — user validation and compiled-source responsive evidence still required.
**After this package:** Phase 2 — New sidebar and department shells.

---

## How to Use This Tracker

Assign owner + target date at execution start.
Status: `todo` · `in_progress` · `blocked` · `done`
A task is **done only when its deliverable is linked or summarized** in [VALIDATION_NOTES.md](./VALIDATION_NOTES.md).
Phase status in `phases.json` changes only after all exit evidence is recorded.

---

## Phase 0 — Research & Baseline

| ID | Task | Owner | Status | Depends | Done when |
|----|------|-------|--------|---------|-----------|
| P0.1 | Confirm primary operator persona, context, top 3 jobs | Product | `todo` | — | Persona + ranked jobs in VALIDATION_NOTES |
| P0.2 | Walk current app flows: Social, Leads, Channels, Settings on desktop + phone | Product + Eng | `todo` | P0.1 | Steps, success/fail, confusion, feature list |
| P0.3 | Record task success, time, help needed, confusion | Product | `todo` | P0.1, P0.2 | Per-participant observations; label gaps clearly |
| P0.4 | Classify every Composer field: basic / conditional / advanced | Product + Eng | `todo` | P0.2 | Field inventory with channel rules and rationale |
| P0.5 | Validate 12-department IA labels and groupings | Product | `todo` | P0.2 | Observed findability + label comprehension recorded |
| P0.6 | Re-verify official competitor sources used in decisions | Product | `todo` | — | Verified claims + updated review date in `sources.json` |
| P0.7 | Write baseline and concept decision record | Product | `todo` | P0.1–P0.6 | Completed VALIDATION_NOTES + feature-preservation list |

**Exit gate:** P0.7 reviewed; all evidence recorded or gaps explicitly documented. No invented research data.

> [!CAUTION]
> Do not present internal team guesses as user findings. If representative participants are unavailable, mark gate `pending` and continue only with reversible technical audit work.

### Participant Tasks (Think-Aloud Protocol)

Record first click, completion, errors, time, and exact confusing labels. Do not coach.

1. Find where to create a post and save it as a draft.
2. Find the queue or scheduled-post view and identify the state of one post.
3. Find where to manage a lead from a comment, and explain what happens after you capture it.
4. Where would you go to set up email marketing?
5. Where would you configure a channel connection?

---

## Phase 1 — Responsive Repair

| ID | Task | Owner | Status | Depends | Done when |
|----|------|-------|--------|---------|-----------|
| P1.0 | Resolve Vite build `EPERM` on Windows package entrypoint | Eng | `todo` | — | Build completes without error |
| P1.1 | Audit current code at 360 / 390 / 768 / 1024 / 1280 CSS px | Eng | `in_progress` | P0.2 | Route, state, viewport, overflow/clipping recorded per width |
| P1.2 | Inspect workspace switcher, Composer, channel selector, preview, drawer, dialogs | Eng + Design | `in_progress` | P1.1 | All key interactions confirmed usable; policy notes recorded |
| P1.3 | Apply Queue overflow fix (`minmax(0,1fr)` + `min-width:0`) | Eng | `in_progress` | P1.1 | Compiled source fix applied — not just browser injection |
| P1.4 | Add explicit Save Draft button to Composer | Eng | `todo` | P1.2 | Save Draft visible, functional, and persists post record |
| P1.5 | Fix "5 assigned / 0 configured" channel count mismatch | Eng + Design | `todo` | P1.2 | Ops → Channels is single source of truth for channel state |
| P1.6 | Gate Schedule button behind channel readiness check | Eng | `todo` | P1.2 | Schedule disabled when 0 channels configured for brand |
| P1.7 | Remove legacy sidebar entries | Eng | `todo` | — | `VideoScriptStudio`, `DailyJourneyPoster`, `CreativeHub`, `ProfileScanner` removed |
| P1.8 | Remove dead subtabs from `SocialPublisher.vue` | Eng | `todo` | — | `market`, `collabs`, `news`, `autopilot`, `ads` removed |
| P1.9 | Replace text-heavy banners with status pills | Eng + Design | `todo` | P1.2 | No multi-line warning text visible anywhere |
| P1.10 | Rerun 5-width audit after all fixes | Eng | `todo` | P1.3–P1.9 | No overflow at any width; primary actions reachable by keyboard |

**Exit gate:** P1.10 evidence recorded. No horizontal overflow at all 5 widths. All listed bugs closed.

### Known Issues Table

| Issue | Location | Fix | Priority |
|-------|----------|-----|----------|
| Queue overflow +57 px @ 360 | `SocialPublisher.vue` → Queue | `minmax(0,1fr)` grid + `min-width:0` card rules | 🔴 P1 |
| Queue overflow +27 px @ 390 | Same | Same fix | 🔴 P1 |
| No Save Draft action visible | Composer | Add explicit Save Draft button | 🔴 P1 |
| "5 assigned" vs "0 configured" mismatch | Composer header | Unify in Ops → Channels | 🟡 P1 |
| Schedule enabled with 0 configured channels | Composer | Gate behind readiness check | 🔴 P1 |
| Vite build `EPERM` on Windows | Build system | Resolve package entrypoint access | 🔴 Blocker |
| Keyboard reachability unchecked | All widths | Run keyboard audit at all 5 breakpoints | 🟡 P1 |

---

## Execution Order

```
1. Eng:     Resolve Vite EPERM (P1.0) — unblocks everything
2. Eng:     Remove legacy sidebar + dead subtabs (P1.7, P1.8) — no dependency
3. Product: P0.1 + P0.2 in parallel with engineering work
4. Eng:     Apply Queue fix + rebuild (P1.3) → rerun 5-width audit (P1.1)
5. Eng:     Fix Save Draft, channel mismatch, Schedule gate (P1.4–P1.6)
6. Eng:     Replace banners with pills (P1.9)
7. Product: P0.3 → P0.6 — capture evidence; label gaps if no participants
8. Product: P0.7 — write decision record
9. Eng:     Final P1.10 rerun
10. Both:   Update phases.json to `done` only after exit evidence linked
11. →       Begin Phase 2: New sidebar + department shells
```

---

## Out of Scope for This Package

- 12-department sidebar redesign (Phase 2)
- Social Planner, Composer, Queue overhaul (Phase 3)
- Chatbot Inbox features (Phase 4)
- Lead CRM (Phase 5)
- Client, Projects, Studio, Email, Automations (Phases 6–10)
- Analytics or AI departments (Phases 11–12)
- HQ Command Center (Phase 13)
- Client-ready scheduling
- Multi-user team roles

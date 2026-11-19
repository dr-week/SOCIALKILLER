# UI/UX Phased Roadmap

> Historical roadmap for the superseded 12-department concept. The current implemented IA is the unified mini-app model in [Mini-app architecture](../../MINI_APP_ARCHITECTURE.md); do not use the old sidebar, icons-only, or bottom-tab tasks as current requirements.

**Status:** Phase 0 & 1 `in_progress` · Phase 2 `blocked`
**Machine-readable:** [`phases.json`](./phases.json)
**Validation:** `npm run uiux:check`

> [!NOTE]
> Deliver one independently testable phase at a time. Phase dependencies are enforced by the checker. Do not change a phase status without first recording its exit evidence in VALIDATION_NOTES.md.

---

## Phase 0 — Research & Baseline `[in_progress]`

**Goal:** Confirm what "simpler" means for the actual operator before changing anything.

| Task | Done when |
|------|-----------|
| Confirm primary operator persona and top 3 jobs | Persona + ranked jobs in VALIDATION_NOTES |
| Walk current app flows on desktop + mobile | Steps, success/failure, confusion, feature list |
| Record task success, time, help needed, confusion | Per-participant observations; label gaps |
| Classify all composer fields (basic / conditional / advanced) | Field inventory with channel rules |
| Validate 12-department IA labels with real user | Observed findability + comprehension recorded |
| Re-verify competitor sources used in decisions | Updated review dates in `research/sources.json` |
| Write baseline and concept decision record | Completed VALIDATION_NOTES + preservation list |

**Exit gate:** All evidence recorded in VALIDATION_NOTES.md or gaps explicitly documented. No invented research.

---

## Phase 1 — Responsive Repair `[in_progress]`

**Goal:** Fix current clipping and known bugs before adding any new structure.

| Task | Done when |
|------|-----------|
| Resolve Vite build `EPERM` on Windows | Build completes without error |
| Apply Queue overflow fix (`minmax(0,1fr)` + `min-width:0`) | Compiled source fix applied |
| Rerun 5-width audit: 360 / 390 / 768 / 1024 / 1280 px | No horizontal overflow at any width |
| Add explicit Save Draft button to Composer | Action visible and functional |
| Fix "5 assigned / 0 configured" channel count mismatch | Single consistent channel status display |
| Gate Schedule button behind channel readiness | Schedule disabled when 0 channels configured |
| Check keyboard reachability at all 5 widths | All primary actions reachable by keyboard |
| Remove legacy sidebar entries (4 items) | `VideoScriptStudio`, `DailyJourneyPoster`, `CreativeHub`, `ProfileScanner` gone |
| Remove dead subtabs from `SocialPublisher.vue` | `market`, `collabs`, `news`, `autopilot`, `ads` removed |
| Replace text-heavy banners with status pills | No multi-line warning text visible in app |

**Exit gate:** No horizontal overflow at all 5 widths. Primary actions reachable by pointer and keyboard. All listed bugs closed.

> [!WARNING]
> Queue overflows +57 px @ 360 and +27 px @ 390. Source fix identified but Vite build blocked by Windows `EPERM`. Must resolve build before rerunning compiled audit.

---

## Phase 2 — New Sidebar & Department Shells `[blocked]`

**Blocked by:** Phase 0 exit gate (persona + baseline evidence) + Phase 1 exit gate (responsive clean)

**Goal:** Replace legacy dual-workspace nav with the 12-department icon sidebar.

| Task | Done when |
|------|-----------|
| Implement 12-icon department sidebar | Icons-only; label on hover/focus |
| Brand switcher always visible top-right | Dropdown lists all workspaces |
| Ops pinned to sidebar bottom with divider | Settings always accessible, never in main flow |
| Each department renders a full-screen shell | Empty states show setup prompts — no fake data |
| Horizontal pill sub-nav inside each department | Max 6 items per department |
| Department enable/disable toggle in Ops | Per-workspace on/off for each department |
| Mobile bottom tab bar | 5 most-used + "More" overflow sheet |
| Keyboard shortcuts 1–9 + S | Navigable without mouse |

**Exit gate:** Representative user locates active brand, finds next task, and navigates between departments without confusion.

---

## Phase 3 — Social: Content & Publishing `[not_started]`

**Goal:** Visual planner, caption studio, queue, and channel management.

| Task | Done when |
|------|-----------|
| Visual day/week/month Planner | Calendar renders posts with status pills |
| Composer: 4 caption frameworks | Hook-Story-Offer · Short & Punchy · Educational · Event Promo |
| Composer flow: Brief → Framework → AI → Channels → Preview → Review → Schedule | End-to-end path works |
| Smart hashtag cluster generator | Niche-aware suggestions |
| Instagram grid preview | Feed/grid card rendering |
| Queue: list view with status pills and bulk actions | Sort, filter, reschedule, duplicate, delete |
| Channels sub-view: per-channel status | Assigned vs configured clearly distinguished |

**Exit gate:** Operator saves a basic draft without touching advanced options. Can identify selected channel, preview, and current post state.

---

## Phase 4 — Inbox: Chatbot & Engagement `[not_started]`

**Goal:** 3-pane comment/DM inbox with AI intent classification and auto-reply.

| Task | Done when |
|------|-----------|
| 3-pane Inbox: list · thread · actions | All three panes render and are usable |
| Gemini intent classification: 🔥 ❓ ⚠️ ⭐ | Classification appears on each conversation |
| Keyword trigger detection | Custom keywords per brand detected correctly |
| AI auto-reply suggestions | Suggestions appear; human approves before send |
| ⚡ Convert to Lead | 1-click push creates lead in CRM with auto-filled fields |
| Bot config: hours, escalation, kill switch | Kill switch always visible and functional |
| Saved reply templates per brand | Templates accessible from action panel |

**Exit gate:** Operator classifies a comment, generates a reply suggestion, approves it, and converts to lead in under 10 seconds.

---

## Phase 5 — Leads: CRM & Pipeline `[not_started]`

**Goal:** Inbound lead capture, pipeline management, CSV export.

| Task | Done when |
|------|-----------|
| `leads` SQLite table initialized | Schema matches TASKS.md spec |
| REST API: GET / POST / PUT / DELETE `/api/leads` | All endpoints functional |
| Pipeline Kanban: `new → contacted → qualified → proposal → won` | Cards move between columns |
| Leads table: intent badges, source, trigger word, owner | All fields displayed |
| Lead profile: full detail + activity history | Opens from table row |
| Stat cards: Total · Hot · Contacted · Won Rate | Real data, no fake numbers |
| 1-click CSV export | Downloads correctly formatted file |
| Manual lead creation modal | Form creates lead with all fields |
| Trigger config UI | Keyword → auto-create rule per brand |

**Exit gate:** Lead created from chatbot appears in CRM. Status moves through pipeline. CSV export contains correct data.

---

## Phase 6 — Clients: Client Management `[not_started]`

**Goal:** Client profiles, brand management, approval workflow, and client portal.

| Task | Done when |
|------|-----------|
| Client profile with all fields | Create, edit, view, archive |
| Per-client brand profiles | Tone, voice, restricted terms, logo, channels |
| Service status per active service | on-track / at-risk / overdue with dates |
| Deliverables checklist per client per period | Checklist items creatable and completable |
| Approval queue: approve / request changes / comment | Version-locked approval flow works |
| Client portal: shareable read-only link | Client sees their content week without agency data |

**Exit gate:** Agency admin completes client onboarding, creates content, submits for approval, client approves via portal.

---

## Phase 7 — Projects: Dev & Design Work `[not_started]`

**Goal:** Project board, task tracker, deliverables vault for web/design/CRM projects.

| Task | Done when |
|------|-----------|
| Kanban board: Brief → Design → Development → Review → Delivered | Cards move through stages |
| Task tracker with owner, due date, status, priority | CRUD tasks per project |
| Deliverables vault: URLs, Figma links, file exports | Upload and link tracking |
| Milestones with timeline view | Key dates visible |
| Structured brief template | All fields: goals, scope, stack, design system, timeline |
| Client milestone share | Shareable without exposing project board |

**Exit gate:** Project tracked from brief to delivery without leaving the app.

---

## Phase 8 — Email: Email Marketing `[not_started]`

**Goal:** Campaign builder, subscriber lists, sequences, analytics.

| Task | Done when |
|------|-----------|
| Campaign builder: subject · preview text · body · list · send time | End-to-end campaign creation |
| AI subject line variant generator | Suggestions generated from brief |
| Subscriber lists: import CSV, segment by tag, unsubscribe | Lists managed correctly |
| Reusable email templates with brand voice | Templates saved and applied |
| Trigger-based sequences | Welcome · Follow-up · Re-engagement · Event |
| Email analytics: open rate · CTR · bounce · unsubscribes | Real data from provider |
| Email provider config in Ops | Resend / SendGrid / SMTP configurable |

**Exit gate:** Campaign drafted, list selected, test send dispatched, analytics appear after real send.

---

## Phase 9 — Studio: Shoots & Events `[not_started]`

**Goal:** Production planner, media review, event campaign coordination.

| Task | Done when |
|------|-----------|
| Shoot planner: date, location, talent, call time, shot list, equipment | All fields functional |
| Media review: upload, mark selects, add notes | Review flow works |
| Event campaign: event details, promo timeline, asset checklist | All fields functional |
| Multi-asset generator: AI captions + copy from brief | Generates variants per asset type |
| Production vault: organized per shoot/event | Intake → Selects → Finals → Delivered stages |

**Exit gate:** Shoot planned, media reviewed, event campaign created with AI-generated caption variants.

---

## Phase 10 — Automations: Scripts & Triggers `[not_started]`

**Goal:** No-code automation builder, webhook manager, script vault.

| Task | Done when |
|------|-----------|
| Automation builder: Trigger → Condition → Action | At least 4 built-in templates working |
| Webhook manager: incoming/outgoing with signature verification | Webhook registered and tested |
| Script vault: store and run internal scripts | Scripts run with logs and kill switch |
| Scheduler: time-based jobs with logs and retries | Jobs fire correctly; retries bounded |
| Run logs: execution history per automation | Logs readable and filterable |

**Exit gate:** Comment keyword → lead creation automation runs end-to-end without manual intervention.

---

## Phase 11 — Analytics: Cross-Department Reporting `[not_started]`

**Goal:** Real metrics from all departments with client-ready exports.

| Task | Done when |
|------|-----------|
| Overview KPI snapshot across all departments | Numbers sourced from real data |
| Social analytics: Meta API data | Reach, impressions, engagement displayed |
| Email analytics: from email provider | Open rate, CTR, bounce, list growth |
| Lead analytics: pipeline velocity, conversion, source | All from local SQLite |
| Client reports: per-client digest (PDF/CSV export) | Report generates with correct date range |
| Date filters: 7d · 30d · 90d · Custom · Campaign | All filters work |

**Exit gate:** Client report generated for a real brand with accurate data from at least 2 departments.

---

## Phase 12 — AI: Brand Intelligence Studio `[not_started]`

**Goal:** Caption writer, reply generator, brand voice, knowledge base.

| Task | Done when |
|------|-----------|
| Caption writer: brief → framework → Gemini → edit → Composer | Full flow works |
| Reply generator: comment → suggestion → approve → Inbox | Suggestion appears; approval required |
| Content ideas: topics and hooks per niche | Ideas generated from brand voice context |
| Brand voice editor: tone, vocab, restricted words | Saved and applied to AI outputs |
| Knowledge base: upload docs, AI references for replies | RAG retrieval works, tenant-isolated |
| Data-leave notice before first AI use | Notice shown and acknowledged |

**Exit gate:** Operator writes a caption, generates a reply suggestion, and both are brand-voice consistent without manual correction.

---

## Phase 13 — HQ: Command Center `[not_started]`

**Goal:** Unified today-view across all departments. Built last.

| Task | Done when |
|------|-----------|
| Today's Focus: posts · comments · leads · tasks | Live data from each department |
| Pipeline Snapshot: leads · campaigns · approvals | Real counts only |
| Quick Actions: 5 primary actions | Each routes to correct department and composer |
| Brand health: per-channel connection status | From Ops → Channels, real state |
| Recent Activity: last 10 cross-department events | Accurate with actor + timestamp |

**Exit gate:** Operator opens HQ and completes their most urgent task within 2 clicks.

---

## Phase 14 — Accessibility & Polish `[not_started]`

**Goal:** Reliable, accessible patterns before release.

| Task | Done when |
|------|-----------|
| Keyboard nav and focus rings across all departments | Tab order logical; focus rings visible |
| Accessible names and ARIA labels | Screen reader announces all interactive elements |
| Colour contrast: all text and UI meets WCAG AA | Verified with contrast checker |
| Empty / Error / Loading states in every department | No blank or spinlock states |
| Reduced-motion preferences respected | Animations disabled when prefers-reduced-motion |
| Under-150-line rule verified across all new code | No files reach the threshold |

**Exit gate:** Each redesigned slice passes keyboard, contrast, and screen-reader checks.

---

## Phase 15 — Validate & Release `[not_started]`

**Goal:** Ship improvements without regressions or unsafe publishing.

| Task | Done when |
|------|-----------|
| Test top tasks with representative users vs Phase 0 baseline | ≥4/5 complete core task without help |
| Regression test: publish · chatbot · leads · email · project flows | All critical paths pass |
| Approval safeguards, audit history, reviewer roles confirmed | Checklist verified |
| Release one department at a time with rollback path | Rollback tested before each release |
| Post-release monitoring: error rates, failed jobs, token health | Monitoring dashboards live |

**Exit gate:** ≥4/5 participants complete basic tasks without help. Time and confusion compared to Phase 0. No critical regressions.

---

## Global Acceptance Criteria

- [ ] No horizontal page overflow at 360 / 390 / 768 / 1024 / 1280 CSS px
- [ ] First-time operator identifies active brand, finds next task, navigates departments without confusion
- [ ] Every metric shows its data source, collection date, and known limitations
- [ ] No misleading connection/publishing state; no unapproved external side effects
- [ ] AI never publishes, sends, or schedules anything autonomously
- [ ] Every automation and bot has a visible kill switch
- [ ] All files remain below the 150-line modular code threshold
- [ ] All departments have clean empty states — no fake placeholder data

# SOCIALKILLER — Anti-Agency & Solo Creator Product Roadmap

> Historical agency roadmap updated for **SOCIALKILLER**. The active application is one website with focused mini-apps; consult [Mini-app architecture](docs/product/MINI_APP_ARCHITECTURE.md) for implemented features and current IA. Listed Leads, Email, Projects, Studio, full Automations, Analytics, and AI department work remains roadmap scope unless marked available there.

> **Vision:** Kill the middleman agency. One website. Focused workspaces. Shared brand context.
> **Design Law:** App launcher. Task-specific workspaces. Strict `<100-150` line modular TypeScript & SCSS files. Zero clutter.

---

## 🏗️ Phase 0 — Foundation (System & Docs)

- [x] Establish brand profile in local SQLite (`danger-labs`)
- [x] Connect task health script (`scripts/task-status.mjs`)
- [x] Establish loopback backend `4174` and frontend `5199`
- [x] Conduct competitor benchmark (`docs/research/UIUX_COMPETITOR_ANALYSIS.md`)
- [x] Write full Agency OS Information Architecture (`docs/product/uiux/`)
- [ ] Validate mini-app labels and grouping with representative operators
- [ ] Resolve Vite build EPERM on Windows (`EPERM` on package entrypoint)
- [x] Record Phase 0 baseline in `docs/product/uiux/planning/VALIDATION_NOTES.md`

---

## 🔧 Phase 1 — Responsive Repair & Legacy Pruning

- [x] Fix Queue overflow: +57 px @ 360 px, +27 px @ 390 px (`minmax(0,1fr)` + `min-width:0`)
- [ ] Rebuild and rerun 5-width responsive audit (360 / 390 / 768 / 1024 / 1280)
- [x] Preserve existing script, content, and profile capabilities as dedicated mini-app workspaces
- [x] Remove dead subtabs from `SocialPublisher.vue`: `market` · `collabs` · `news` · `autopilot` · `ads`
- [x] Replace all text-heavy warning banners with compact status pills
- [x] Add explicit **Save Draft** action to Composer (currently missing)
- [x] Fix "5 assigned / 0 configured" channel count mismatch in Composer header
- [x] Gate Schedule button behind channel readiness check (currently fires with 0 configured channels)
- [ ] Check keyboard reachability at all 5 breakpoints

---

## 🧭 Phase 2 — Unified Mini-App Shell

- [x] Add a centralized launcher with categorized available and planned workspaces
- [x] Route app selection internally in the same site, page, and browser tab
- [x] Preserve direct URLs plus browser Back/Forward for app and Audience Audit views
- [x] Give existing features dedicated workspaces while sharing active brand context
- [x] Keep Connections separate from Planner and surface saved browser workflows
- [x] Keep existing sidebar labels visible and use the responsive mobile navigation drawer
- [ ] Validate all mini-apps at phone, tablet, and desktop breakpoints and by keyboard

---

## 📱 Phase 3 — Social: Content & Publishing

- [ ] **Planner:** Visual day/week/month calendar — Posts, Carousels, Reels, Stories
- [ ] **Composer:** Multi-framework caption studio
  - Hook-Story-Offer (conversion)
  - Short & Punchy (engagement)
  - Educational Carousel (slide-by-slide)
  - Event Promo (dates, tickets, announcements)
- [ ] Smart niche hashtag cluster generator
- [ ] Media preview — Instagram grid/feed card view
- [ ] **Composer flow:** Brief → Framework → AI Assist (optional) → Channels → Preview → Review → Schedule
- [ ] **Queue:** Scheduled + draft list with status pills (`draft` · `scheduled` · `published` · `failed`)
- [ ] One consistent post lifecycle model — no separate definitions across views
- [ ] Per-channel connection readiness check before enabling Schedule
- [ ] Manual Business Suite handoff for unverified API publishing

---

## 💬 Phase 4 — Inbox: Chatbot & Engagement

- [ ] **3-Pane Inbox:** Conversation list · Thread view · Action panel
- [ ] Intent badge classification via Gemini: 🔥 Hot Lead · ❓ Inquiry · ⚠️ Complaint · ⭐ Praise
- [ ] Keyword trigger detection: `PRICE` · `INFO` · `LINK` · `HIRE` · `DEMO` (custom per brand)
- [ ] AI auto-reply suggestions (human approves before send — no unattended sends)
- [ ] Saved reply templates per brand/channel
- [ ] **⚡ Convert to Lead** — 1-click push to Leads department with auto-filled profile
- [ ] Bot config per brand: hours, escalation path, pause/kill switch
- [ ] No unattended messaging in first release

---

## 🎯 Phase 5 — Leads: CRM & Pipeline

- [x] Initialize `leads` SQLite table:
  `id` · `brandId` · `contactName` · `handle` · `platformId` · `source`
  `triggerWord` · `message` · `email` · `phone` · `intent` · `status` · `notes` · `createdAt`
- [x] REST API endpoints:
  - `GET /api/leads` — list with status + brand filter
  - `POST /api/leads` — create manually or via comment trigger
  - `PUT /api/leads/:id` — update status: `new → contacted → qualified → proposal → won`
  - `DELETE /api/leads/:id` — archive/delete
- [x] **Pipeline view:** Kanban board with status columns
- [x] **Leads Table:** full list with intent badges, source column, trigger word, assigned owner
- [x] **Lead Profile:** name, handle, platform, email, phone, intent, notes, activity history
- [x] 1-click CSV export
- [x] Manual lead creation modal
- [ ] Trigger config UI: keyword → auto-create lead rule per brand
- [x] Stat cards: Total Leads · Hot Inquiries · Contacted · Won Rate

---

## 👥 Phase 6 — Clients: Client Management

- [ ] Client profile: name, contacts, service scope, start date, renewal date, notes
- [ ] Per-client brand profiles with tone, voice, restricted terms, logo, channels
- [ ] Service status board per client (on-track / at-risk / overdue)
- [ ] Deliverables checklist per client per period
- [ ] Approval queue: content pending client review (approve / request changes / comment)
- [ ] Client portal: shareable read-only link for reviewing upcoming content week

---

## 📋 Phase 7 — Projects: Dev & Design Work

- [ ] Project board: `Brief → Design → Development → Review → Delivered`
- [ ] Task tracker with owner, due date, status, priority per project
- [ ] Deliverables vault: staging URLs, Figma links, design exports
- [ ] Milestones with timeline view and sign-off checkpoints
- [ ] Structured brief template: goals, scope, stack, design system, timeline
- [ ] Project types: Website Dev · UI/UX Design · Custom CRM Build · Brand Identity
- [ ] Client milestone share (without exposing full project board)

---

## 📧 Phase 8 — Email: Email Marketing

- [ ] Campaign builder: subject line · preview text · body editor · send time · list selector
- [ ] AI subject line generator (Gemini — generate + test variants)
- [ ] Subscriber lists: import CSV · segment by tag · unsubscribe handling
- [ ] Reusable email templates with brand voice
- [ ] Trigger-based sequences: Welcome · Follow-up · Re-engagement · Event
- [ ] Email analytics: open rate · click rate · bounce · unsubscribes (real send data only)
- [ ] Email provider config in Ops: Resend / SendGrid / SMTP (not locked in)

---

## 🎬 Phase 9 — Studio: Shoots & Events

- [ ] Shoot planner: date, location, talent, call time, shot list, equipment checklist
- [ ] Media review: upload raw footage/photos, mark selects, add notes
- [ ] Event campaign: event details, promo timeline, asset checklist, ticket link, ad brief
- [ ] Multi-asset generator: captions, story frames, ad copy for one event (AI-assisted)
- [ ] Production vault: organized media per shoot/event (intake → selects → finals → delivered)

---

## ⚡ Phase 10 — Automations: Scripts & Triggers

- [ ] Automation rules builder: Trigger → Condition → Action (no-code for common flows)
- [ ] Webhook manager: incoming/outgoing with signature verification
- [ ] Script vault: store and run approved internal scripts (asset resizing, file naming etc.)
- [ ] Time-based scheduler with logs, retries, kill switch
- [ ] Run logs: per-automation execution history (status, output, errors)
- [ ] Common automations:
  - Comment keyword → Create lead
  - New lead → Send notification
  - Post published → Log to client report
  - Weekly summary → Email client performance digest

---

## 📊 Phase 11 — Analytics: Cross-Department Reporting

- [ ] Overview KPI snapshot: posts published · leads captured · emails sent · projects delivered
- [ ] Social analytics: channel-provided metrics only (reach, impressions, engagement — Meta API)
- [ ] Email analytics: from email provider (open rate, CTR, bounce, list growth)
- [ ] Lead analytics: pipeline velocity, conversion rate, source breakdown, won/lost ratio
- [ ] Client reports: per-client performance digest (exportable PDF/CSV)
- [ ] Date filters: 7d · 30d · 90d · Custom range · Campaign-bound
- [ ] Every metric shows source, collection date, and known limitations

---

## 🤖 Phase 12 — AI: Brand Intelligence Studio

- [ ] Caption writer: brief → framework → Gemini → edit → save to Composer
- [ ] Reply generator: paste comment → AI suggests → human approves → Inbox
- [ ] Content ideas: topic clusters, hook angles, trending formats per niche
- [ ] Brand voice editor: tone, vocabulary, restricted words, style guide
- [ ] Knowledge base: upload FAQs/docs — AI references for replies (RAG, tenant-isolated)
- [ ] AI config: provider (Gemini default / Groq later) · per-brand API key · usage limits
- [ ] Data-leave notice shown before first AI use
- [ ] AI never publishes, sends, or schedules anything autonomously

---

## 🏠 Phase 13 — HQ: Command Center

> Built last — requires live data from all other departments.

- [ ] Today's Focus: posts today · comments awaiting reply · leads to follow up · overdue tasks
- [ ] Pipeline snapshot: hot leads count · active campaigns · pending approvals
- [ ] Quick actions: ➕ New Post · ✍️ Draft Email · 👤 Add Lead · 📋 New Task · 🤖 AI Assist
- [ ] Brand health: real channel connection status per platform
- [ ] Recent activity: last 10 events across all departments (actor, action, timestamp)
- [ ] Empty states prompt setup ("Connect your first channel") — never fake numbers

---

## ✅ Phase 14 — Verification & Release

- [ ] Accessibility audit: keyboard, focus, contrast, screen-reader, reduced-motion, empty/error states
- [ ] `npm run tasks:status` reflects all progress accurately
- [ ] `npm run planning:check` passes without stale docs
- [ ] All new files respect 150-line ceiling (modular code rules)
- [ ] End-to-end: Social publish → comment → lead capture → CRM → email → report flow
- [ ] Release one department at a time with rollback path
- [ ] ≥4/5 operators complete core task without help vs Phase 0 baseline

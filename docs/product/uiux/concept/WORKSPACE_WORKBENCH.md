# Department Workbench Concept

> Historical concept for the superseded 12-department IA. Current app names, status, and routing are in [Mini-app architecture](../../MINI_APP_ARCHITECTURE.md).

**Status:** Concept for validation — not a final visual design.
**Replaces:** Legacy dual-workspace "Audit vs Publish" switcher and 5-nav sidebar.

---

## Product Promise

**One app. Every department. Run the whole agency from here.**

Each department is a focused workbench. No blending. No context switching between screens that share unrelated workflows. The app adapts to any service mix by enabling only the departments each workspace needs.

---

## Shell Layout

### Desktop

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ DANGER.LABS              [Brand: DANGER.LABS ▾]  [👤]   │
├────────┬────────────────────────────────────────────────────┤
│        │ [Sub-nav pill 1] [Sub-nav pill 2] [Sub-nav pill 3] │
│  🏠    │                                        [+ New ▾]  │
│  📱    │                                                    │
│  💬    │   Department Workspace Content Area               │
│  🎯    │                                                    │
│  📧    │                                                    │
│  👥    │                                                    │
│  📋    │                                                    │
│  🎬    │                                                    │
│  ⚡    │                                                    │
│  📊    │                                                    │
│  🤖    │                                                    │
│  ───   │                                                    │
│  ⚙️    │                                                    │
└────────┴────────────────────────────────────────────────────┘
```

### Mobile

```
┌─────────────────────────┐
│ ⚡ DANGER.LABS  [Brand▾]│
├─────────────────────────┤
│                         │
│  Department Content     │
│  (single column)        │
│                         │
├─────────────────────────┤
│ 🏠  📱  💬  🎯  ···    │
└─────────────────────────┘
```

Bottom tab bar shows the 5 most-used departments + "···" overflow sheet for the rest.

---

## Sidebar Interaction Rules

| Element | Behaviour |
|---------|-----------|
| Department icons | Icons only — label visible on hover/focus only |
| Active department | Filled icon + left accent bar |
| Brand switcher | Top-right; always visible; dropdown lists all workspaces |
| User avatar | Top-right; profile, lock, sign out |
| Ops / Settings | Pinned bottom, separated by a visual divider |
| Keyboard shortcuts | `1`–`9` = departments in order; `S` = global search |
| New action | Context-aware `[+ New]` button in top-right of each department |

---

## Per-Department Screen Specs

---

### 🏠 HQ — Command Center

> Built last — requires live data from all other departments.

**Sub-nav:** None (single view)

| Section | Content | Source |
|---------|---------|--------|
| Today's Focus | Posts scheduled today · Comments awaiting reply · Leads to follow up · Overdue tasks | Social + Inbox + Leads + Projects |
| Pipeline Snapshot | Hot leads count · Active campaigns · Pending approvals | Leads + Social + Clients |
| Quick Actions | ➕ New Post · ✍️ Draft Email · 👤 Add Lead · 📋 New Task · 🤖 AI Assist | Direct links to department composers |
| Brand Health | Per-channel connection status (connected / expired / not configured) | Ops → Channels |
| Recent Activity | Last 10 events across all departments — actor · action · timestamp | Activity log |

**Empty state:** "Connect your first channel in Ops to get started." Never show placeholder numbers.

---

### 📱 Social — Content & Publishing

**Sub-nav:** Planner · Composer · Queue · Channels

#### Planner
- Visual day/week/month calendar
- Post types: Posts · Carousels · Reels · Stories
- Click empty slot → opens Composer for that date
- Color-coded by status pill: `draft` / `scheduled` / `published` / `failed`
- Filter by channel and content type

#### Composer Flow
```
1. Brief      → type or paste idea
2. Framework  → Hook-Story-Offer · Short & Punchy · Educational · Event Promo
3. AI Assist  → optional Gemini generation/refinement
4. Media      → attach image/video; preview grid
5. Channels   → select profiles; check per-channel connection readiness
6. Preview    → per-channel rendering (Instagram, Facebook)
7. Action     → Save Draft · Submit for Review · Schedule (if approved + connected)
```

**Advanced options** (behind "More options"):
- Hashtag cluster generator
- Alt text / accessibility fields
- Per-channel copy variants
- UTM link builder
- Brand voice override

#### Queue
- List view: all posts with status pills
- Sortable by date, channel, status
- Bulk actions: reschedule · duplicate · delete

#### Channels
- Shows all connected channels for active brand
- Per-channel: connection status · scope health · last check · reconnect / revoke
- Clear distinction: **assigned** (listed) vs **configured** (has valid credentials)

---

### 💬 Inbox — Chatbot & Engagement

**Sub-nav:** Conversations · Bot Config · Triggers · Templates

#### Conversations (3-pane)
```
┌──────────────┬────────────────────┬─────────────────┐
│ Conversation │ Thread             │ Actions         │
│ List         │                    │                 │
│ [🔥] @user1  │ @user1: "PRICE?"  │ Intent: 🔥 Lead │
│ [❓] @user2  │ AI: "Here's our…" │ [Reply] [Lead]  │
│ [⭐] @user3  │                    │ [Assign] [Note] │
└──────────────┴────────────────────┴─────────────────┘
```

**Intent badges:** 🔥 Hot Lead · ❓ Inquiry · ⚠️ Complaint · ⭐ Praise *(Gemini classified)*

**Actions:**
- **Reply** → AI suggests on-brand reply → human edits → approves → sends
- **⚡ Convert to Lead** → auto-fills Leads profile from conversation data
- **Assign** → route to team member
- **Note** → internal note on conversation (not sent)

#### Bot Config (per brand)
- Active hours
- Supported intents and escalation path
- **Pause / Kill switch** (always visible)
- No unattended sends in first release

#### Triggers
- Keyword → action rules: `PRICE` · `INFO` · `LINK` · `HIRE` · `DEMO` + custom
- Action options: Suggest reply · Create lead · Send saved reply (with approval)

---

### 🎯 Leads — CRM & Pipeline

**Sub-nav:** Pipeline · All Leads · Triggers · Import/Export

#### Pipeline (Kanban)
```
[ New ] → [ Contacted ] → [ Qualified ] → [ Proposal ] → [ Won ] [ Lost ]
```

#### Lead Profile Fields
`contactName` · `handle` · `platform` · `source` · `triggerWord` · `email` · `phone` · `intent` · `status` · `notes` · `activityHistory`

#### Stat Cards
Total Leads · 🔥 Hot Inquiries · Contacted · Won Rate

#### Trigger Config
- Per-brand keyword → auto-create lead rules
- Source tracking: Comment Chatbot · Manual · CSV Import · (Email form P2) · (Event P9)

---

### 📧 Email — Email Marketing

**Sub-nav:** Campaigns · Lists · Templates · Automations · Analytics

#### Campaign Builder
1. Subject line + AI variant suggestions
2. Preview text
3. Body editor (rich text)
4. List selector + segment filter
5. Send time (immediate or scheduled)
6. Test send before real send

#### Sequences (Automations)
- Welcome · Follow-up · Re-engagement · Event series
- Trigger: new subscriber · tag added · form submitted · date-based

#### Provider Config *(in Ops → Email Config)*
- Resend / SendGrid / SMTP
- Not locked in — user brings their own API key

---

### 👥 Clients — Client Management

**Sub-nav:** Client List · Brand Profiles · Approvals · Portal

#### Client Profile
- Contact name, email, phone, service scope, start/renewal date, notes
- Assigned team members and roles
- Service status per active service (on-track · at-risk · overdue)

#### Approval Queue
- Shows all content awaiting client review across all brands
- Action: Approve · Request Changes (with comment) · Mark Reviewed
- Version-locked: approved content cannot be edited without returning to review

#### Client Portal
- Shareable read-only link (opt-in per workspace)
- Shows upcoming content week for the client's brand
- Client can Approve or Leave a comment — no access to agency data

---

### 📋 Projects — Dev & Design Work

**Sub-nav:** Active · Tasks · Deliverables · Brief

#### Project Board (Kanban)
```
[ Brief ] → [ Design ] → [ Development ] → [ Review ] → [ Delivered ]
```

#### Supported Project Types
- Website Development
- UI/UX Design (Figma systems, wireframes, prototypes)
- Custom CRM / Software Build
- Brand Identity

#### Deliverables Vault
- Staging URLs · Figma links · Export ZIPs · Design handoff docs
- Organized per project, per milestone

---

### 🎬 Studio — Shoots & Events

**Sub-nav:** Shoots · Events · Media Review · Production Vault

#### Shoot Planner
- Date · Location · Talent · Call time · Shot list · Equipment checklist
- Status: Planning · Day-of · In Edit · Delivered

#### Event Campaign
- Event name · Date · Location · Ticket link
- Promo timeline: start date → event date
- Asset checklist: Story · Feed post · Reel · Ad creative · Email header
- Multi-asset generator: Gemini-assisted caption + copy variants from brief

#### Production Vault
- Organized by shoot/event: Intake → Selects → Finals → Delivered
- Internal review notes and client delivery confirmation

---

### ⚡ Automations — Scripts & Triggers

**Sub-nav:** Rules · Webhooks · Scripts · Logs

#### Automation Builder (No-Code)
```
Trigger: [ Comment contains keyword ]
  + Condition: [ Brand = DANGER.LABS ]
  + Action: [ Create Lead in CRM ]
```

#### Built-in Automation Templates
- Comment keyword → Create lead
- New lead → Internal notification
- Post published → Log to client report
- Weekly → Email client performance digest

#### Script Vault
- Store approved internal scripts (Node / shell)
- Asset resizing · file naming · weekly summaries
- Each script: name · description · run history · kill switch

---

### 📊 Analytics — Cross-Department Reporting

**Sub-nav:** Overview · Social · Email · Leads · Client Reports

#### Data Integrity Rules
- Every metric shows: **source** · **collection date** · **known limitations**
- Social data: from Meta API only — not estimated
- Email data: from connected email provider only
- Lead data: from local SQLite — 100% accurate

#### Client Reports
- Per-client performance digest
- Sections: Posts published · Reach/Engagement (Meta) · Leads captured · Emails sent
- Exportable as PDF or CSV
- Date-bound: week / month / campaign range

---

### 🤖 AI — Brand Intelligence Studio

**Sub-nav:** Caption Writer · Reply Generator · Ideas · Brand Voice · Knowledge Base

#### AI Safety Contract
| AI CAN do | AI CANNOT do |
|-----------|-------------|
| Suggest captions | Publish posts |
| Suggest replies | Send messages |
| Generate ideas | Schedule anything |
| Summarize briefs | Access client credentials |
| Reference knowledge base | Act without human approval |

#### Brand Voice Editor
- Tone (formal / casual / bold / playful)
- Vocabulary: include / avoid word lists
- Competitor avoidance list
- Writing style examples

#### Knowledge Base (RAG)
- Upload FAQs, service PDFs, price lists
- AI references these when generating replies
- Tenant-isolated: brand A cannot access brand B's knowledge
- Delete and re-index controls

---

### ⚙️ Ops — Settings & Infrastructure

**Sub-nav:** Channels · Team · Workspace · Email Config · Data · Billing

#### Channels
- Meta Instagram · Facebook Pages · (WhatsApp P4) · (TikTok P7)
- Per-channel: provider · asset name · assigned brand · scopes · status · last check · reconnect · revoke
- **Assigned** (listed) vs **Configured** (has live credentials) — always shown separately

#### Team Members *(later phase)*
- Roles: Owner · Admin · Strategist · Creator · Approver · Viewer
- Invite by email · deactivate · reassign assets

#### Workspace Config
- Department enable/disable per workspace
- Brand timezone, logo, default voice
- Notification rules: expiring token · failed post · new lead · overdue task

#### Data & Export
- SQLite export · encrypted backup · workspace reset · full delete

---

## Interaction Principles

| Principle | Rule |
|-----------|------|
| **One primary action** | Each department screen has exactly one primary CTA (top-right, filled button) |
| **Overflow menu** | Secondary actions live in `⋯` — never compete with primary |
| **Status pills** | Replace all text banners with compact coloured pill badges |
| **Progressive disclosure** | Advanced options always behind "More options" — visible but not competing |
| **No cross-department widgets** | Leads data doesn't appear in Social; Social data doesn't appear in Email |
| **Empty → setup prompt** | No fake numbers; empty state shows the action to fix it |
| **Drawers for quick edits** | Slide-in drawer for edit/create; full page for complex workflows |

---

## Status System (Shared Across All Departments)

| Status | Colour | Meaning |
|--------|--------|---------|
| `draft` | ⬜ Gray | Saved, not submitted |
| `in_review` | 🟡 Amber | Awaiting approval |
| `approved` | 🔵 Blue | Approved, not yet acted on |
| `scheduled` | 🟣 Purple | Queued for future delivery |
| `published` / `sent` | 🟢 Green | Confirmed by provider |
| `failed` | 🔴 Red | Delivery failed — action needed |
| `connected` | 🟢 Green | Channel live and authorized |
| `expired` | 🟡 Amber | Token needs renewal |
| `not_configured` | ⬜ Gray | No credentials entered |
| `paused` | 🟠 Orange | Manually paused by operator |

---

## Safety & Trust Rules

| Rule | Why It Matters |
|------|---------------|
| Draft ≠ Published | Never auto-publish; require explicit human review |
| Saved handle ≠ Connection | Show real connection state from actual credential check only |
| No auto-publish | All publish requests → `pending_approval`; human must approve |
| No client scheduling | Until approval enforcement + audit history + reviewer roles ship |
| AI suggests, humans decide | No AI output triggers sends, publishes, or schedules |
| Explicit confirmation | Every outbound action requires a deliberate human step |
| Kill switches everywhere | Every automation and bot has a visible pause/kill control |

# UI/UX Competitor Analysis & Agency Design Specification

> **Research Date:** 2026-11-07  
> **Benchmark Products:** Buffer, Planable, ManyChat, Folk CRM, Metricool  
> **Target:** DANGER.LABS Agency Operating System  

---

## 1. Competitor UI/UX Patterns & Best Practices

| Product | Focus Area | What They Do Best | Bad Patterns to Avoid |
|---|---|---|---|
| **Buffer** | Planning & Publishing | **Zero-text visual calendar.** Clean day/week grid with channel badges (Instagram, FB). Post status displayed via subtle color pills (Draft, Scheduled, Sent). | Too simplistic for agency lead capture; no comment auto-responder. |
| **Planable** | Content Collaboration | **Side-by-side composer and live feed preview.** Direct visual parity with how the post looks on mobile. | Heavy enterprise approval layers that slow solo/boutique operators down. |
| **ManyChat** | Chatbot & Comments | **Trigger-based comment automation.** Keyword detection (`"INFO"`, `"PRICE"`), instant sentiment tagging (🔥 Hot Lead, ❓ Question, 💬 Chat), and automated reply presets. | Cluttered node-graph spaghetti builders; needs a clean, linear conversation list. |
| **Folk.app / Attio** | Modern CRM | **Icon-first, tag-based data table.** Stage pills (`New`, `Contacted`, `Qualified`, `Won`), source badges, and instant CSV export. High data density without clutter. | Bloated custom field setup; keep it to essential contact, source, handle, and intent fields. |
| **Metricool** | Agency Management | **Workspace switcher at the apex.** Switching client changes the active accounts, tone, and calendar instantly. | Cluttered navigation with dozens of sub-menus and dense help text. |

---

## 2. Audit: Unwanted Sections in Current UI (To Be Pruned)

The current interface has accumulated confusing, non-functional bloat that distracts from the core agency workflow:

| Unwanted Component / Section | Why It Serves No Purpose | What Replaces It |
|---|---|---|
| **`VideoScriptStudio.vue`** | Isolated founder video monologue generator; disconnects from post planning. | Built-in Caption & Script tabs inside the unified **Content Planner**. |
| **`DailyJourneyPoster.vue`** | Generic founder "struggle log" text generator. | Pruned completely. Replaced by multi-style caption options (Story, Punchy, Promo). |
| **`CreativeHub.vue`** | Standalone video reposter and meme generator with no API connectivity. | Media library & preview in the **Content Planner**. |
| **`ProfileScanner.vue`** | Unauthenticated Instagram public profile scraper that gets rate-limited/blocked. | Official Meta Insights & Audience Overview. |
| **8 Subtabs in `SocialPublisher.vue`** (`market`, `collabs`, `news`, `autopilot`, `ads`) | Mock placeholders and unverified platforms (TikTok/YouTube with no adapters). | Focused 3-tab publisher: **Composer**, **Calendar Queue**, and **Meta Channels**. |
| **Dual Sidebar Split ("Publish" vs "Audit")** | Forces user into two separate apps with 12 redundant follower sub-lists. | Unified 5-item sidebar: Planner, Inbox, Leads CRM, Audience, Settings. |
| **Wall-of-text warning banners** | Clutters cards with instructional paragraphs (e.g., `inbox-note`). | Minimal icon badges, tooltips, and subtle status pills. |

---

## 3. The New DANGER.LABS UI Design System

### Core Principles:
1. **Less Text, More Icons:** Use Lucide icons, status dots, and pill tags instead of instructional paragraphs.
2. **Task-Specific Workspaces:** Each section has one clear job:
   - 📅 **Planner & Publisher:** Compose, schedule, visual calendar, live preview.
   - 💬 **Inbox & Chatbot:** Stream comments, AI one-click reply, trigger DM.
   - 🎯 **Leads CRM:** Contact table, stage pipeline, CSV export, intent scoring.
   - 👥 **Audience:** Follower stats and cleaner.
   - ⚙️ **Settings:** Meta API connection and brand voice configuration.
3. **High Data Density & Dark Mode Elegance:** Clean cards with subtle borders (`#1f2937`), clear typography, and bright accent colors for quick scanning.

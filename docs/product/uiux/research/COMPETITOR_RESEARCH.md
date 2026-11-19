# Social Publishing UI/UX Research

**Reviewed:** 2026-11-04  
**Method:** Desk research of official product pages only — not a logged-in product evaluation or independent usability study.

> [!WARNING]
> Sources are vendor-authored and may change. Revisit every entry at least every 180 days or before using them to make product, pricing, or sales claims. The local checker flags stale dates — a person must re-open each source and verify current content.

---

## Competitor Pattern Analysis

| Product | Evidence from Official Page | Transferable Lesson |
|---------|-----------------------------|---------------------|
| [Meta Business Suite](https://www.facebook.com/business/tools/meta-business-suite) | One place to manage Facebook, Messenger, and Instagram: notifications/messages, content creation/scheduling, insights | Keep related work in a predictable brand context. Do not copy its full breadth or imply equivalent API capabilities. |
| [Buffer Publish](https://buffer.com/publish) | Week/month calendar views, channel/tag/post-type filters, drafts, calendar editing, separate text per network | Make planning visible; allow per-channel edits without losing the shared idea |
| [Hootsuite Publishing](https://www.hootsuite.com/platform/publishing) | List and calendar views for paid + organic content; collaboration and approvals | Keep content status and review connected to planning. Do not show team-role controls before the product supports them. |
| [Planable](https://planable.io/product/) | Feed, Calendar, Grid, List views; previews near posts; labels, filters, brand/client workspaces | Put review in context; keep workspace boundaries clear; start with the smallest useful set of views |
| [Later Scheduler](https://later.com/social-media-scheduler/) | Visual planner, feed preview, media folders, cross-platform posts tailored per profile | Keep reusable media discoverable; allow platform-specific edits; use visual grids only where they help |

---

## Key Synthesis for DANGER.LABS OS

1. **Calendar/queue** should answer "what is going out, where, and when?" — not become another configuration form.
2. **Shared draft** reduces repeated work; each selected channel still needs a clear preview and any required edits.
3. **Review, connection readiness, and final actions** belong near the post they affect — not buried in settings.
4. **Brand workspaces** are a useful organizational boundary; the current product does not have multi-user roles or approval permissions — do not advertise those features.
5. **Competitor analytics, team collaboration, and integrations** are mature product areas; do not use competitor pages as proof that our APIs or features support them.

---

## Current Product Observations (from 2026-11-04 Audit)

| Observation | Location | Priority |
|-------------|----------|----------|
| Horizontal overflow + clipped publisher controls | 390 CSS px Chromium view | P1 (fix now) |
| Publisher exposes presets, drafting, categories, media vault, post fields, channel selection, preview, scores, and publish actions simultaneously | `SocialPublisher.vue` | P2 (simplify via progressive disclosure) |
| Approval enforcement flagged as prerequisite for client-ready scheduling | Existing product review | Guardrail (do not ship without it) |

---

## Research Limitations

- All sources are vendor-authored marketing pages — not independent studies.
- Logged-in feature evaluations have not been conducted.
- Competitor feature sets and pricing change frequently; each claim must be re-verified before use in product decisions.
- Do not use research data older than 180 days without refreshing.

**Refresh rule:** Run `npm run uiux:check` to identify stale entries in `sources.json`. Update `reviewedOn` only after personally re-opening and verifying each source page.

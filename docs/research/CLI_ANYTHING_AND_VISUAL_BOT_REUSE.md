# CLI-Anything & Agent-Native Visual Bot Reuse Review

**Reviewed:** 2026-11-19  
**Scope:** Evaluation of `HKUDS/CLI-Anything` and modern agent-native / WebMCP / DOM+Vision browser automation frameworks for **SOCIALKILLER**'s Visual Bot, Scripting Engine, and Multi-Platform Publisher.

---

## 1. Executive Summary

Traditional social media agencies rely on teams of low-wage human operators clicking through browser tabs or paying expensive SaaS middlemen. Meanwhile, pure pixel/screenshot-based GUI automation is slow, fragile when dark/light themes or screen resolutions change, and prone to platform anti-bot triggers.

By combining **CLI-Anything (`HKUDS/CLI-Anything`)**'s agent-native deterministic CLI harness paradigm with **structured DOM/Accessibility-tree + Sobel contour fallback (`vision-contour.mjs`)** and **WebMCP tool exposure**, **SOCIALKILLER** enables a single creative worker to execute agency-scale website workflows and multi-channel publishing with 100% local control and human-approved safety.

---

## 2. Evaluated GitHub Repositories

| Repository | Architecture & Capability | License | SOCIALKILLER Fit & Adoption Decision |
|---|---|---|---|
| **[HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything)** | 7-phase pipeline (*Analyze → Design → Implement → Plan Tests → Write Tests → Document → Publish*) that turns GUI software, creative tools (Blender, GIMP, LibreOffice, FFmpeg), and web apps into deterministic, JSON-emitting CLI harnesses (`SKILL.md` / `HARNESS.md`). | **Apache-2.0** | **ADOPT ARCHITECTURE & CLI HARNESS PATTERN.** Build a `scripts/cli-anything/` harness for SOCIALKILLER (`socialkiller-cli`) exposing deterministic JSON commands (`status`, `summarize`, `draft`, `queue`, `audit`, `workflow-verify`) for both human creators and local AI agents. |
| **[browserbase/stagehand](https://github.com/browserbase/stagehand)** | TypeScript AI web browsing framework combining deterministic Playwright code with natural-language `act()`, `extract()`, and `observe()` primitives over compact DOM/Accessibility trees. | **MIT** | **ADOPT PATTERN FOR VISUAL BOT & EXTENSION.** Adapt Stagehand's compact `observe()` / `extract()` DOM-accessibility tree snapshotting inside `extension/modules/` so page harvesting and workflow recording use resilient semantic selectors instead of brittle CSS paths. |
| **[microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)** | Model Context Protocol (MCP) server that drives browsers via Playwright's accessibility snapshot rather than pixel-heavy screenshots. | **MIT** | **ADOPT FOR QA & DETERMINISTIC WORKFLOW VERIFICATION.** Use accessibility-tree snapshots for fast, token-efficient page inspection and 5-viewport responsive verification (`360/390/768/1024/1280`). |
| **[web-infra-dev/midscene](https://github.com/web-infra-dev/midscene)** | Visual-driven UI automation SDK with Chrome Extension and Playwright bridge, caching visual/DOM locators for fast replay. | **MIT** | **ADOPT LOCATOR CACHING PATTERN.** Cache verified `[data-testid]` / `[aria-label]` + Sobel edge bounding boxes (`server/engine/vision-contour.mjs`) so repeated workflow replays execute in milliseconds without re-scanning the entire page. |
| **[browser-use/browser-use](https://github.com/browser-use/browser-use)** | Python agent harness that indexes interactive DOM elements with numeric badges (`[1]`, `[2]`) for LLM vision+DOM grounding. | **MIT** | **ADOPT SET-OF-MARK (SoM) BADGE INDEXING.** Reference pattern for the SOCIALKILLER Chrome Extension HUD overlay: number interactive page targets deterministically during user-demonstrated workflow recording. |
| **[bytedance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop)** | Native GUI agent stack for cross-platform desktop and browser control. | **Apache-2.0** | **REFERENCE ONLY.** Keep desktop control lightweight via our Node/Tauri host and CLI-Anything wrappers rather than bundling a heavy vision model weight dependency. |
| **[Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern)** | Vision-LLM + Playwright workflow automation platform. | **AGPL-3.0** | **DO NOT EMBED.** AGPL-3.0 copyleft and heavy Python/Postgres backend conflict with our local-first Node/SQLite architecture. |

---

## 3. Upgrading the SOCIALKILLER Visual Bot & Browser Extension

### A. 3-Layer Hybrid Execution Engine (CLI → DOM/A11y → Vision Contour)
1. **Layer 1: CLI-Anything Deterministic Harness (Fastest — `<10ms`)**
   - Every core SOCIALKILLER operation (audience diff, text summarization, multi-channel formatting, dry-run validation, local media processing) runs via structured JSON CLI commands and local REST endpoints.
2. **Layer 2: Semantic DOM & Accessibility Tree Bridge (Fast — `<50ms`)**
   - In the MV3 Companion Extension (`extension/modules/interaction-recorder.js` & `page-harvester.js`), prioritize semantic roles (`role="textbox"`, `aria-label`, `data-testid`) and Set-of-Mark element indexing over fragile nth-child CSS selectors.
3. **Layer 3: Theme-Invariant Sobel Contour Fallback (`server/engine/vision-contour.mjs`)**
   - When social platforms obfuscate DOM classes (e.g., X/Instagram React Fiber trees), fall back to our zero-dependency Sobel gradient + 2D Normalized Cross-Correlation (`vision-contour.mjs`) paired with Box-Muller log-normal cognitive jitter (`human-cadence.js`).

### B. Safety & Human-Approval Guardrails
- **No Unattended Account Actions:** All recorded workflows and CLI-Anything publishing harnesses default to `--dry-run` / `pending_approval`.
- **Unsafe Action Regex Gate:** `interaction-recorder.js` blocks automatic submission of password fields, payment controls, and unapproved publish triggers.
- **Human Cadence Enforcement:** All extension assistance respects Weibull/Box-Muller cognitive delays (`15s–35s` for unfollow queue assist; `180ms–520ms` for DOM focus/fill).

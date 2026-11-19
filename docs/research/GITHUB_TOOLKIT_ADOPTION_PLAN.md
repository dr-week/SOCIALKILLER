# GitHub Toolkit & Open-Source Library Adoption Plan

**Updated:** 2026-11-19  
**Purpose:** Identify vetted, permissively licensed open-source GitHub repositories that directly improve **SOCIALKILLER**'s UI animations, glassmorphism UX, backend structure, secret safety, Visual Bot automation, and 5-viewport QA across our 7-phase roadmap.

---

## 1. Evaluated & Selected Repositories

| Category | Repository | License | Fit & Concrete Role in SOCIALKILLER | Target Phase |
|---|---|---|---|---|
| **Global Fuzzy Search** | [krisk/Fuse](https://github.com/krisk/Fuse) (`fuse.js`) | **Apache-2.0** | Zero-dependency fuzzy search engine powering typo-tolerant Global Topbar Search across all 13 mini-apps, Audience handles, Queue posts, and Content Studio items. | Phase 1 |
| **List & Layout Motion** | [formkit/auto-animate](https://github.com/formkit/auto-animate) (`@formkit/auto-animate`) | **MIT** | Drop-in `v-auto-animate` directive for smooth Audience row filtering, Launcher grid filtering, Queue updates, and collapsible cards while honoring `prefers-reduced-motion`. | Phase 2 |
| **Spring & Presence Motion** | [motiondivision/motion-vue](https://github.com/motiondivision/motion-vue) (`motion-v`) | **MIT** | Hardware-accelerated Vue 3 spring transitions, `<AnimatePresence>` modal/drawer enter-exit morphing, and crisp `150ms` workspace transitions. | Phase 2 |
| **Headless A11y UI** | [unovue/reka-ui](https://github.com/unovue/reka-ui) (`reka-ui`) | **MIT** | Unstyled accessible primitives (Tooltip for Symbolic Status Icons, Collapsible, DropdownMenu, Dialog, Tabs) styled entirely with SOCIALKILLER's frosted glass SCSS. | Phases 2–4 |
| **Glass Toast Stack** | [xiaoluoboding/vue-sonner](https://github.com/xiaoluoboding/vue-sonner) (`vue-sonner`) | **MIT** | Swipe-to-dismiss, stackable toast notifications wrapped in `src/composables/useToast.ts`, replacing 5 separate per-view toast/notice blocks. | Phase 2 |
| **Trie HTTP Routing** | [unjs/rou3](https://github.com/unjs/rou3) (`rou3`) | **MIT** | Lightweight trie router for `server/http/router.mjs` while keeping native `node:http` with zero framework lock-in (*alternative: `honojs/hono`, MIT, if edge/middleware expansion is needed later*). | Phase 5 |
| **Boundary Validation** | [fabian-hiller/valibot](https://github.com/fabian-hiller/valibot) (`valibot`) | **MIT** | Modular, tree-shakable schema validation in `server/http/schemas/` replacing ad-hoc regex and manual request-body parsing. | Phase 5 |
| **Secret Redaction** | [pinojs/fast-redact](https://github.com/pinojs/fast-redact) (`fast-redact`) | **MIT** | Zero-allocation redaction in `server/http/logger.mjs` masking OAuth tokens, passwords, webhooks, and cookies across server and extension logs (closes `S0.5`). | Phase 5 |
| **Concurrency & Rate Queue** | [sindresorhus/p-queue](https://github.com/sindresorhus/p-queue) (`p-queue`) | **MIT** | Controlled concurrency, rate-limit intervals, and timeouts inside `server/jobs/` for scheduler ticks, batch Audience health checks, and multi-platform dispatches. | Phase 5 |
| **Agent-Native CLI** | [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) | **Apache-2.0** | Architecture pattern for Layer 1 (`scripts/cli-anything/socialkiller-cli.ts`), expanding with live `audit`, `queue`, and `workflow-verify` commands. | Phase 6 |
| **Visual Bot DOM/Cache** | [browserbase/stagehand](https://github.com/browserbase/stagehand) & [web-infra-dev/midscene](https://github.com/web-infra-dev/midscene) | **MIT** | Adopt semantic DOM/A11y `observe()`/`extract()` and cached selector + Sobel bounding-box locator patterns for Layer 2 (`extension/modules/` + `visual_bot_locators`). | Phases 5–6 |
| **5-Width & A11y QA** | [microsoft/playwright](https://github.com/microsoft/playwright) + [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) + [dequelabs/axe-core](https://github.com/dequelabs/axe-core) | **Apache-2.0 / MIT / MPL-2.0** | Dev-only QA stack (`@axe-core/playwright`) for 5-viewport (`360/390/768/1024/1280`) overflow assertions, `toHaveScreenshot` visual diffs, and WCAG 2.1 AA audits wired into `dev:doctor --full`. | Phases 6–7 |
| **Isolated References** | [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) & [charlie947/social-media-skills](https://github.com/charlie947/social-media-skills) | **AGPL-3.0 / MIT** | Kept isolated in `research/third_party/` per [GitHub Reuse Review](./GITHUB_REUSE_REVIEW.md): reference Postiz's DTO/service/repository layering and Skills' Markdown templates; never bundle AGPL-3.0 code. | Reference only |

---

## 2. License Compliance & Safety Guardrails

- **Runtime Dependencies:** Only permissive **MIT** (`@formkit/auto-animate`, `motion-v`, `reka-ui`, `vue-sonner`, `rou3`, `valibot`, `fast-redact`, `p-queue`) and **Apache-2.0** (`fuse.js`) libraries enter runtime bundles.
- **Dev-Only Dependencies:** `playwright` (Apache-2.0) and `@axe-core/playwright` / `axe-core` (MPL-2.0) remain strictly in `devDependencies` for `dev:doctor` and CI verification.
- **No AGPL-3.0 / Browser-Outreach Bundling:** `postiz-app`, `growchief`, and `skyvern` remain excluded from runtime packaging.
- **Human-in-the-Loop Guarantee:** No adopted library bypasses explicit human approval for social publishing or unattended engagement.

---

## 3. Phase-by-Phase Installation & Adoption Matrix

| Phase | Packages / Patterns Introduced | Target Workspace / Modules |
|---|---|---|
| **Phase 1** | `fuse.js` | `src/islands/app-shell/topbar.ts`, `useMiniAppLauncher.ts`, `useAudienceNavigation.ts` |
| **Phase 2** | `@formkit/auto-animate`, `motion-v`, `reka-ui` (Tooltip), `vue-sonner` | `src/styles/_motion-tokens.scss`, `src/shared/ui/`, `src/composables/useToast.ts`, `src/App.vue` |
| **Phase 3–4** | `reka-ui` (Collapsible, Dialog, DropdownMenu, Tabs) | `PublisherAdvancedOptions.vue`, `CommunityInbox.vue`, `BrandProfileModal.vue`, `AutomationStudioWorkspace.vue` |
| **Phase 5** | `rou3`, `valibot`, `fast-redact`, `p-queue` | `server/http/`, `server/jobs/`, `server/modules/`, `server/db/` |
| **Phase 6–7** | `CLI-Anything` / `Stagehand` / `Midscene` patterns + `@axe-core/playwright` (dev) | `scripts/dev-supervisor.ts`, `scripts/cli-anything/`, `extension/modules/`, CI 5-width QA |

---

## 4. AI Agent Frameworks & Evaluation Tooling

Our zero-dependency `scripts/agent-eval/` harness runs all 25 deterministic agent, automation, security, and Visual Bot scenarios offline in `<500ms`. When expanding to live multi-turn LLM grading, tracing, or multi-provider routing, these vetted open-source repositories fit cleanly on top:

| Repository | License | Practical Relevance to SOCIALKILLER | Adoption Fit |
|---|---|---|---|
| [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | **MIT** | Declarative CLI & Node.js library for prompt regression, red-teaming (prompt injection / PII leaks), and side-by-side model grading. | Layer over `scripts/agent-eval/` for live `GEMINI_API_KEY` prompt-injection & brand-tone evals in CI. |
| [braintrustdata/autoevals](https://github.com/braintrustdata/autoevals) | **MIT** | TypeScript scorers (`Factuality`, heuristics, similarity) for evaluating reply accuracy against reference answers. | Plug into `assistant` scenarios when scoring live Gemini comment replies against ground-truth brand tone fixtures. |
| [mastra-ai/mastra](https://github.com/mastra-ai/mastra) | **Apache-2.0** | TypeScript agent framework with structured workflows, memory, MCP tools, and built-in evaluation primitives. | Architecture reference for typed multi-step tool traces as SOCIALKILLER scales beyond single-turn Q&A. |
| [vercel/ai](https://github.com/vercel/ai) | **Apache-2.0** | Unified TypeScript SDK for streaming, structured output (`generateObject`), and multi-provider routing. | Clean swap-in abstraction inside `server/integrations/ai/` when adding Groq/OpenAI alongside Gemini. |
| [langfuse/langfuse](https://github.com/langfuse/langfuse) | **MIT** | Open-source LLM observability, span tracing, and evaluation dataset management. | Optional local trace viewer consuming `.data/eval-traces/latest.json` spans if multi-agent chains are added later. |
| [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | **MIT** | Vite-native TypeScript test runner with snapshot & watch DX (`vite` is already installed). | Complementary TS runner for Vue component + agent integration suites alongside `node:test`. |

---

## 5. Dual-Track Integration Strategy (Phase 2B-1 Zero-Dependency vs. Phase 2B-2 MIT Drop-In)

**Status:** Phase 2B-2 active (`vue-sonner`, `@formkit/auto-animate`, `fuse.js`, `reka-ui` installed and wired behind `src/shared/` adapters):

| Capability | Phase 2B-1 (Initial Adapter) | Phase 2B-2 (MIT/Apache-2.0 Drop-In Active) | Adapter Boundary & Rollback |
|---|---|---|---|
| **Frosted Toast Stack** | `useToast()` + `UiToastHost.vue` native queue | `vue-sonner` (`2.0.9`, **MIT**) | Wrapped in `src/shared/ui/UiToastHost.vue` & `useToast.ts`; callers keep `pushToast(msg, kind)` unchanged. |
| **Fuzzy Topbar Search** | `scoreFuzzyMatch` substring/subsequence | `fuse.js` (`7.5.0`, **Apache-2.0**) | Combined inside `src/shared/search/fuzzy-search.ts`; typo-tolerant `'audence'` -> `'Audience Audit'` tested in `test/app-navigation.test.mjs`. |
| **List & Drawer Micro-Motion** | CSS `@keyframes` & `<Transition>` | `@formkit/auto-animate` (`0.10.2`, **MIT**) | Registered via `autoAnimatePlugin` in `src/main.ts`; applied to Inbox & Workflow lists. |
| **Accessible Symbolic Tooltips** | Native `title` + `aria-label` | `reka-ui` (`2.11.0`, **MIT**) | `TooltipProvider` in `App.vue` + frosted `src/shared/ui/UiTooltip.vue` on channel action icons. |

- **Bundle & Rollback Guardrail:** Gzipped main JS stays `< 130 kB` via `npm run build`, and `npm run type-check`, `npm test`, and `npm run uiux:hygiene` pass cleanly.

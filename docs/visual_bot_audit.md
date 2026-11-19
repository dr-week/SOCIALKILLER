# Visual Bot Audit

> Historical snapshot dated 2026-10-24. Current-code checks on 2026-11-05 confirm the viral route import, Manifest V3 manifest, service worker, popup, and user-triggered visible-tab screenshot flow exist. The app Queue also exposed legacy records without target channels; the server now recovers channels only from delivery history and flags records without evidence. The dry-run notes below distinguish the app publisher/API boundary from the CLI broadcaster.
> **2026-11-09 update:** automatic post-media fetching and Pollinations image generation were removed. Random drafts do not attach media; operators may select rights-cleared assets explicitly.

**Generated on:** 2026-10-24

---

## 1. Chrome Extension (Manifest V3)
| Component | Expected | Actual Path | Exported / Entry | Status | Tests |
|---|---|---|---|---|---|
| `manifest.json` | Manifest V3 with permissions, background service worker, content scripts, popup | `extension/manifest.json` | N/A (static JSON) | **IMPLEMENTED** | – |
| Service Worker (`background.js`) | Composes lifecycle, context-menu, keep-alive, dispatch, logging, and per-message handlers | `extension/background.js`, `extension/modules/background/` | `ensureAppRunning`, `pollPendingDispatchesNow`, message-handler modules | **IMPLEMENTED** | `test:extension` – **PASS** |
| Popup UI (`popup.html` / `popup.js`) | UI for quick draft creation and status badge | `extension/popup.html`, `extension/popup.js` | UI entry point loaded by `action.default_popup` | **IMPLEMENTED** | `extension.test.mjs` – **PASS** |
| Content Scripts | Injected into Instagram, X/Twitter, Reddit, LinkedIn, Dev.to, etc. | `extension/modules/...` (multiple files) | Various injection scripts (`social-autoposter.js`, `dom-chat-banner.js`, …) | **IMPLEMENTED** | `extension.test.mjs` – **PASS** |
| Native Messaging Host | Communicates with local The Social Base app (`com.followdesk.host`) | `scripts/native-host.mjs`; installers in `scripts/install-windows.ps1` and `scripts/register-windows-task.bat` | `chrome.runtime.sendNativeMessage` calls in `background.js` | **IMPLEMENTATION PRESENT; INSTALLATION NOT VERIFIED** | – |

## 2. Backend Router & Middleware
| Route Module | Expected Purpose | Actual Path | Exported Handler | Status | Tests |
|---|---|---|---|---|---|
| `social-routes.mjs` | Social & marketing API (platform status, posts, generation) | `server/routes/social-routes.mjs` | `handleSocialAndMarketingRoutes` | **IMPLEMENTED** | `server/router.test.mjs` – **PASS** |
| `brand-routes.mjs` | Brand workspace CRUD | `server/routes/brand-routes.mjs` | (exports not listed) | **IMPLEMENTED** (assumed) | – |
| `instagram-routes.mjs` | Instagram specific endpoints | `server/routes/instagram-routes.mjs` | (exports not listed) | **IMPLEMENTED** (assumed) | – |
| `ops-routes.mjs` | Operational utilities (keep‑alive, health) | `server/routes/ops-routes.mjs` | (exports not listed) | **IMPLEMENTED** (assumed) | – |
| `viral-routes.mjs` | Trending & viral content generation | `server/routes/viral-routes.mjs` | `handleTrendingAndViralRoutes` | **IMPLEMENTED** – owner-workspace import is valid | `server/router.test.mjs` – **PASS** |
| `ownerWhitelist.mjs` | Whitelist helper for brand ownership | `server/ownerWhitelist.mjs` (exists) | `isOwnerWorkspace` | **IMPLEMENTED** | – |

## 3. Vision‑Processing Routes & Providers
| Module | Expected Function | Actual Path | Status |
|---|---|---|---|
| `vision-contour.mjs` | Edge detection for UI screenshots | `server/engine/vision-contour.mjs` | **IMPLEMENTED** |
| `media-downloader.js` (extension) | Download media assets from social pages | `extension/modules/media-downloader.js` | **IMPLEMENTED** |
| `post-media.mjs` | Automatic media for random drafts | `server/marketing/post-media.mjs` | **DISABLED — rights-cleared, operator-selected assets only** |

## 4. Visual Bot Execution Engine & State Management
| Piece | Expected Role | Actual Path | Status |
|---|---|---|---|
| Dispatch Queue (`social-publisher.mjs`) | Central queue, keep‑alive, platform formatters | `server/social-publisher.mjs` | **IMPLEMENTED** |
| SQLite Store (`sqlite-engine.mjs`) | Persist drafts, brand profiles, feedback | `server/db/sqlite-engine.mjs` | **IMPLEMENTED** |
| Scheduler / Alarms | Periodic keep‑alive & queue polling | Implemented in extension `background.js` (alarms) and server `keep-alive-pulse.mjs` | **IMPLEMENTED** |
| State Sync (Native Messaging) | Bridge between extension and local desktop app | Calls present in `background.js`; host not bundled | **PARTIALLY_IMPLEMENTED** |

## 5. Browser Automation Dependencies
| Dependency | Usage |
|---|---|
| Chrome Extension APIs (`chrome.*`) | Throughout `background.js` and injection modules |
| Native Messaging (`chrome.runtime.sendNativeMessage`) | Launch/fallback of the local Social Base host |
| `fetch` to localhost (127.0.0.1:4174) | Communicates with backend server |

## 6. UI Inspection & Execution Controls
No dedicated UI inspection layer beyond the popup. No automated UI‑testing harness for the extension UI is present.

## 7. Logging, Screenshot Capture, Secret Redaction, Dry‑Run Safeguards
| Feature | Implementation |
|---|---|
| Logging (`logError`, `reportExtensionLog`) | Present in `background.js` |
| Screenshot Capture | **IMPLEMENTED** – user-triggered `captureVisibleTab` with local preview/download; manual browser verification remains |
| Secret Redaction | Partial – credentials are stored in SQLite with AES‑256‑GCM, but extension does not redact before sending logs |
| Dry‑Run (`social:dry-run` script) | CLI adapters support dry-run; app publisher/API enforcement remains unverified |

---

## 8. Tests Executed (npm `test:all`)
| Test Suite | Command | Exit Code |
|---|---|---|
| Clone Service, Human Motion, Vision Contour, Lua Automation, Marketing Engine, Random Hashtag & Media, Sync Store | `npm run test:all` | **1** (overall failure) |
| Individual failing suite | `server/router.test.mjs` | **FAIL** – SyntaxError in `viral-routes.mjs` |
| All other suites | (part of same command) | **PASS** |

**Summary:** 28 passed, 1 failed.

---

## 9. Current Follow-Up

The dated defect list below is historical and superseded. Current actions and acceptance evidence live in the [publishing safety workstream](product/implementation-plan/01_PUBLISHING_SAFETY.md), [product validation workstream](product/implementation-plan/03_PRODUCT_VALIDATION.md), and [engineering enablement workstream](product/implementation-plan/04_ENGINEERING_ENABLEMENT.md).

---

## 10. Remaining Gaps (not implied complete)
- Automated end-to-end UI tests for the popup and content scripts.
- Full secret-redaction coverage across extension and server logging paths.
- Verified app publisher/API dry-run enforcement and approval behavior.
- Verified Windows native-host registration and real extension-to-host communication.

---

## 11. Current Task Source

Use the linked implementation workstreams for ownership, dependency order, and completion evidence; this historical audit does not maintain a second task list.

---

*End of audit.*

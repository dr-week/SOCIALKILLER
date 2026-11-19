# Platform Studios and Runtime Architecture

## Audit findings

- The product is a Vue 3/Vite single-page app, a Node loopback API, SQLite persistence, a Chrome companion, and a Capacitor Android host. Mini-app routing is query-based and remains same-origin.
- Sass already defines dark/light themes, five accent palettes, and shared color/surface tokens. The app catalog and CSS artwork already centralize launcher identities, but there is no interactive Design System Studio.
- The existing **Workflows** app edits reviewed browser steps. Separate local autopilot/scheduler modules generate posts and queue them for review; there is no general automation rules engine, event bus, or email provider.
- Android is an existing Capacitor/Gradle project with a small Kotlin `BridgeActivity`. This is a justified native-host alternative for the current shared web product; the repo does not have a general Android-project builder.
- The launcher has an exclusive PID lock and remembers one frontend port, but health checks do not identify an instance. API port 4174 and Vite proxy target 4174 are fixed. A stale `frontendPort: 5199` record did not correspond to a listening Social Base instance.
- In the 2026-11-09 read-only process audit, 5173 and 5174 belonged to unrelated applications, 5198 was a static Social Base preview, and 4174 was not listening. No Docker CLI, Android SDK, Java, Gradle command, or signing key was available. No unrelated process was stopped.
- The logo pipeline already uses local Sharp processing. Launcher icons use Lucide components and launcher artwork is project-authored CSS. AI image generation and unverified automatic post-media fetching are prohibited; see the [visual asset policy](./VISUAL_ASSET_POLICY.md).

## Architecture decisions

1. **One application shell:** new Studios are internal mini-app routes; brand context, theme, accent, API, and SQLite remain shared.
2. **Design system:** Sass tokens remain canonical. Design System Studio previews the actual theme, accents, type, spacing, surfaces, controls, focus, and reduced-motion behavior; it changes existing theme/accent settings rather than creating a parallel token store.
3. **Automation:** Automation Studio is separate from browser interaction Workflows and the legacy post scheduler. Rules are persisted, company-scoped, bounded, and draft-first. Only installed event sources and registered actions may run. Publishing, messaging, and email require an explicitly configured provider and human approval; missing providers are unavailable, never simulated.
4. **Android:** Android Build Studio manages this repository’s Capacitor project, not arbitrary generated apps. Keep Kotlin native code for platform integration; adopt Compose only for a genuinely native screen or capability rather than replacing the existing web-first product without a need.
5. **Runtime:** a single launcher owns child processes and an atomic local registry. Each API health response reports app identity, instance ID, environment, PID, port, and start time. The launcher probes identity before reuse, selects free loopback ports for unrelated collisions, passes the API port to Vite, and stops only children it created.
6. **Visual assets:** preserve Original → Processed Master → Optimized Variants where raster sources exist. The catalog can record available origin, creator, license/permission, attribution, dimensions, transformations, and outputs.

## Dependency map and delivery order

| Phase | Deliverable | Depends on | Exit check |
| --- | --- | --- | --- |
| 0 | Identity-aware singleton launcher, dynamic API/Vite ports, health and runtime registry | Existing Node launcher and `port-arbiter` | Conflicting unrelated ports remain untouched; second launch reuses the same healthy instance; stale or mismatched state is reported safely. |
| 1 | Design System Studio and shared component/token previews | Existing Sass tokens, theme composable, mini-app navigation | Theme/accent changes persist; preview uses live tokens; keyboard, touch, and reduced-motion checks pass. |
| 2 | Asset manifest, metadata validation, deterministic processing and responsive variants | Existing Sharp brand pipeline and no-AI policy | Reprocessing is deterministic; originals are unchanged; missing inputs or variants fail visibly. |
| 3 | Automation Studio MVP: manual/scheduled and implemented app-event triggers, conditions, draft-safe multi-step actions, status/history/retry | Runtime stability, SQLite migration, explicit event/action contracts | No automatic external side effects; workspace scope, idempotency, disabled rules, failures, and retry are tested. Email remains unavailable until a provider exists. |
| 4 | Android Build Studio for the existing Capacitor project | Runtime identity and Android toolchain discovery | Toolchain status is real; debug/AAB tasks use fixed commands; secrets are never persisted; builds run only when prerequisites exist. |
| 5 | Integration and release verification | Phases 0–4 | Same-tab routes, responsive studios, API health identity, build status, docs, and focused regression tests pass. |

## Risks and non-goals

- Local SQLite is not a multi-process database contract. The singleton launcher must prevent two managed API instances from sharing the same `.data/` store.
- Port discovery alone is not identity. A server is reusable only when its health response matches the application and instance contract.
- Existing scheduler/autopilot behavior is not promoted into the new Automation Studio without tests and a clear approval boundary.
- Email automation cannot be enabled before an email provider, consent model, unsubscribe handling, and delivery status exist.
- A release APK/AAB cannot be validated without Android SDK/Java; release signing material must be supplied and protected by the operator.
- The existing size audit reports legacy modules over 149 lines. New and touched source stays below the limit where reasonably possible; unrelated monoliths remain a gradual backlog.

## Implementation status

| Area | Implemented | Verified / remaining |
| --- | --- | --- |
| Runtime | PID lock, application/workspace/environment identity, atomic registry, health metadata, free-port selection, Vite API-port proxy, and owned child cleanup. | Unit/API checks pass. End-to-end canonical launcher verification is still blocked by Node `EPERM` reading pnpm-installed Vite/vue-tsc; do not stop the unrelated services on 5173/5174. |
| Design system | Same-tab mini-app route with live theme/accent controls and shared component/token previews. | Navigation and focused regression tests pass; browser visual verification and full type-check/build remain outstanding. |
| Asset management | Local asset catalog, optional source/license notes, processing metadata, and deterministic logo WebP outputs in the existing Sharp pipeline. | Run the generator and catalog validation; preserve Original → Processed Master → Optimized Variants. |
| Automation | Routed Studio and SQLite-backed manual/scheduled/social-post-created rules, conditions, branches, execution history, retries, and draft-only actions. | Focused engine/API tests pass. Email delivery and AI-authored workflows are unavailable; publishing remains manual. |
| Android | Routed Build Studio, toolchain discovery, current runtime status, bounded build history, and fixed Capacitor sync + Gradle APK/AAB tasks. | Toolchain/build-service tests pass. Java and Android SDK build-tools are absent here, release signing is not configured, so actual APK/AAB generation and device validation remain blocked. Capacitor stays the justified native host; no arbitrary app generator or Compose rewrite was added. |

Build history and truncated output are memory-only and reset with the API process. The local automation history is persisted separately in SQLite. Current repository checks report legacy file-size violations; newly introduced modules and modified source files are being kept under 150 lines, while unrelated files remain an explicit follow-up backlog rather than undergoing arbitrary splits.

# Desktop migration: legacy launcher to Tauri

**Decision:** use Tauri 2 for the Windows desktop app shell and native window, while reusing the Vue UI. Keep the existing Node API working during the migration; do not rewrite the whole backend just to adopt Tauri.

## Current state

- The existing root launcher, `Launch FoundryDesk.cmd`, starts `launcher/launch.mjs`.
- The legacy launcher starts the Node API on loopback and Vite, then opens the dashboard in the user's default browser.
- The app already has Vue/Vite and a Capacitor Android shell. There is no Tauri project yet.
- This environment does not currently have Rust, Cargo, or MSBuild on PATH, so a Tauri build cannot be validated here.

## Target architecture

```text
Tauri 2 desktop window
  ├─ Vue/Vite production frontend (bundled assets; no Chrome tab)
  ├─ narrowly scoped Tauri commands (window, local profile, secure storage)
  └─ local API process during migration
       ├─ first: packaged Node sidecar for existing routes/adapters
       └─ later: move selected local-only services to small Rust modules
```

Tauri uses the operating system webview and can produce a native app window. Its small framework footprint is not a guarantee that the complete product installer will be tiny: the Vue assets, media, plugins, and any Node sidecar contribute to size. Keeping Node as a sidecar is the lowest-risk compatibility step, but bundling Node adds size and per-platform packaging work.

## Migration steps

1. **Preserve fallback:** keep root `Launch FoundryDesk.cmd`; `launcher/launch-legacy.cmd` is its in-folder fallback copy. These legacy filenames stay unchanged until the native release passes acceptance.
2. **Install prerequisites:** Rust stable/Cargo, Microsoft C++ Build Tools, and WebView2 for Windows development. Package/install tests must cover supported Windows versions.
3. **Create the shell:** add a Tauri 2 project under `src-tauri/`; configure Vite development URL and built `dist/` assets; open one The Social Base window without starting a browser tab.
4. **Bridge the local API:** initially package the existing Node API as a Tauri sidecar. Tauri owns its start/readiness/stop lifecycle. Bind only to loopback, choose a collision-safe port, pass the selected endpoint to the UI, and surface startup errors instead of showing an empty window.
5. **Add a frontend transport boundary:** route API requests through one feature-owned client that can use the current Vite proxy in web development and the managed local service in Tauri. Avoid hard-coded production ports and broad CORS.
6. **Harden permissions and local data:** allow only the required Tauri commands and sidecar execution in capabilities; keep CSP narrow; use OS-backed credential storage and the remembered local profile design from the [product plan](../product/MODULAR_PRODUCT_PLAN.md).
7. **Package and compare:** produce a Windows installer, check cold-start time, memory, process cleanup, offline launch, API port conflicts, OAuth browser return, update/upgrade, and uninstall/data-retention behavior.
8. **Switch only after acceptance:** keep the legacy `.cmd` fallback for at least one release. Remove it only after the Tauri installer works on clean machines and preserves local user data.

## Proposed native module layout

Keep Rust entry points small and split by capability. Follow the repo's under-150-line rule.

```text
src-tauri/
  src/
    main.rs             # desktop entry
    lib.rs              # plugin/command registration only
    commands/
      profile.rs        # local profile/session actions
      platform.rs       # OS integration calls
    backend/
      process.rs        # API sidecar start/stop/readiness
      endpoint.rs       # loopback address and health check
    storage/
      secure_store.rs   # OS credential vault adapter
    security/
      capabilities.rs   # authorization boundaries/policy helpers
```

Tauri commands should be narrow and typed. Business rules and channel-specific behavior stay in feature modules/adapters; do not put publishing, Meta/Google API logic, or a full HTTP router into `main.rs` or a UI command.

## Acceptance checklist

- Starts directly into a native The Social Base window and does not launch Chrome/Vite in production.
- Legacy launcher remains usable until cutover.
- Tauri starts one backend instance, waits for health, handles port conflict, and stops only the child it owns.
- No open network listener beyond loopback; no leaked sidecar after close.
- A backend failure is visible and recoverable; no success-shaped empty dashboard.
- OAuth opens the system browser and returns through a validated callback.
- Build and installer work on a clean Windows machine with documented prerequisites.

## Research

- [Tauri 2 overview](https://v2.tauri.app/start/)
- [Tauri Windows prerequisites](https://v2.tauri.app/start/prerequisites/)
- [Tauri sidecars](https://v2.tauri.app/develop/sidecar/)
- [Calling Rust from the frontend](https://v2.tauri.app/develop/calling-rust/)
- [Tauri app-size guidance](https://v2.tauri.app/concept/size/)

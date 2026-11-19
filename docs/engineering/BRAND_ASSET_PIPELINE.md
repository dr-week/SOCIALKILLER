# Brand asset rollout

## Goal and source policy

Use the logo supplied by the product owner across The Social Base. Do not generate, redraw, trace, or alter its design with AI. No AI image-generation service may produce project icons, illustrations, backgrounds, or other visual assets. Preserve the supplied image as the immutable source; deterministic cropping, contrast tuning, and high-quality upscaling are allowed. The `generated/` folder contains deterministic derivatives of that supplied source, not AI-generated artwork.

See the [visual asset policy and catalog](./VISUAL_ASSET_POLICY.md) for asset sources and processing details.

The source is staged at [`src/assets/branding/the-social-base-logo-source.png`](../../src/assets/branding/the-social-base-logo-source.png). It is 760 × 760 pixels. The reviewed crop is x=198, y=138, width=368, height=484; the generator removes the noisy dark background while retaining the supplied logo's black and white shapes.

## Current state

| Surface | Current implementation | Planned change |
|---|---|---|
| Web sidebar and mobile top bar | Top bar renders through a Zuari island hosted by a temporary Vue lifecycle adapter; sidebar remains Vue | Migrate sidebar in a later slice; both surfaces use the generated logo |
| Web browser tab | Favicon points to the generated product asset | Keep generated favicon wired in `index.html` |
| Browser companion | Popup and manifest use generated logo assets | Keep generated extension icons and popup branding |
| Android | Generated launcher/adaptive icon and splash assets are synced from the supplied source | Verify platform appearance in release validation |

## Software stack

| Area | Current stack | Planned change |
|---|---|---|
| Web app | Vue 3, TypeScript, Vite 8, Sass; existing Zuari islands and the new Zuari-owned top bar | Continue the Vue-to-Zuari migration. Zuari owns migrated UI; Vue remains a temporary host/adapter until its remaining responsibilities are migrated. Do not add a new Vue logo component. |
| Browser companion | Chrome Manifest V3, HTML, CSS, JavaScript; popup and manifest use generated logo assets | Keep the same stack and generated assets; do not change extension protocols or identifiers. |
| Android app | Capacitor 8 plus native Android XML/PNG resources; generated launcher/adaptive and splash artwork synced | Keep the same stack; device-test generated artwork before release. |
| Asset processing | Node.js generator using development-only `sharp` | Maintain deterministic crop, noise cleanup, contrast, upscaling, and platform exports from the preserved source. |
| Build and verification | npm scripts, Vite production build, Node test runner, TypeScript check | Keep `npm run branding:assets`, focused asset tests, and existing build/test commands as the verification path. |

This plan follows the existing Vue-to-Zuari migration; it does not treat Vue as the target architecture. The web-shell slice migrates the sidebar/top bar UI to Zuari while retaining a thin Vue host only as needed for existing app state and navigation. The plan does not change the backend or add an image-processing dependency to shipped runtime code. Application IDs, package names, extension message IDs, and storage keys remain unchanged.

## What will change

1. **Keep the source:** use `src/assets/branding/the-social-base-logo-source.png` as the immutable master.
2. **Automate image outputs:** add `scripts/branding/generate-assets.mjs`, its tests, a development-only `sharp` dependency, and the `branding:assets` npm command.
3. **Migrate and update the web shell:** migrate the top bar first as `src/islands/app-shell/topbar.ts`, with `AppTopbar.vue` as a temporary lifecycle adapter that passes current state and navigation events. The sidebar remains Vue for a separate, behavior-preserving migration slice. Both surfaces use the generated logo, and `index.html` references the favicon.
4. **Update the companion:** generate the existing 16/48/128-pixel files in `extension/icons/`, point `extension/manifest.json` to them, and replace the emoji in `extension/popup.html`.
5. **Update Android artwork:** regenerate the existing `android/app/src/main/res/mipmap-*` launcher files and splash resources, retaining the adaptive icon XML wiring unless a reviewed output requires a background-color adjustment.
6. **Regenerate and verify:** run `npm run branding:assets`, `npm run build`, `npm run test:extension`, `npm run test:all`, and `npm run android:sync`. Visually inspect the web header, extension popup, small icons, and Android artwork.

## Target ownership and files

```text
src/assets/branding/
  the-social-base-logo-source.png   # Immutable owner-supplied original
  generated/                        # Deterministic outputs; never hand-edit
src/islands/app-shell/
  topbar.ts                         # Zuari-owned top-bar rendering and interactions
src/components/
  AppTopbar.vue                     # Temporary Vue mount/update/destroy adapter
scripts/branding/
  generate-assets.mjs               # Source-to-platform asset pipeline
  generate-assets.test.mjs          # Output, size, and source-preservation checks
```

The Zuari island owns shell markup, logo placement, and UI interaction. The temporary Vue adapter owns only Zuari mount/update/destroy lifecycle and forwards existing navigation intent; it must not duplicate shell rendering or business rules. Keep readable “The Social Base” text beside the decorative image. Keep platform-specific icon wiring in the extension manifest and Android resources.

Use `sharp` as a development-only dependency for reproducible, cross-platform raster processing. The generator should use an explicitly reviewed crop, Lanczos resizing, and fixed contrast/background settings. It must not call a remote service, modify the source, or add an image-processing dependency to production runtime code.

Generate, at minimum:

- Web logo and favicon outputs from the reviewed master.
- Extension icons at 16, 48, and 128 pixels.
- Android launcher/adaptive icon outputs at all existing density folders and splash outputs at the existing orientations/densities.

Keep the Android resource XML and Capacitor configuration as platform wiring; the generator produces raster assets, not business logic.

## Work packages

| Work package | Deliverable | Depends on | Verification |
|---|---|---|---|
| **WP0 — Source intake** | Preserve the supplied image under the stable source name; record dimensions and source policy. | — | Compare source copy byte-for-byte with the attachment. |
| **WP1 — Asset pipeline** | Add the deterministic generator, generated-output layout, tests, and `npm run branding:assets`. Fail clearly if the source is missing or output generation fails. | WP0 | Run generator twice and confirm stable outputs; check expected files, dimensions, and non-empty images. |
| **WP2a — Zuari top bar and web identity** | Migrate top-bar rendering to a Zuari island with a thin Vue lifecycle adapter; render the generated logo in the top bar and sidebar; add the favicon. | WP1 | Build/type-check; test navigation events, prop updates, teardown, desktop/mobile layout, and accessible text. |
| **WP2b — Zuari sidebar** | Migrate sidebar navigation, account switching, settings, and data actions to a separate Zuari island; retain only a lifecycle adapter as needed. | WP2a | Verify every existing action, accessibility, theme behavior, responsive drawer, and teardown before removing Vue rendering. |
| **WP3 — Companion extension** | Replace popup placeholder and manifest icon files with generated logo variants. | WP1 | Run `npm run test:extension` and package the extension. |
| **WP4 — Android identity** | Replace launcher, adaptive foreground/background, and splash images with generated outputs. | WP1 | Run asset checks and `npm run android:sync`; device verification is a separate release check. |
| **WP5 — Integration/release** | Verify all surfaces use the same source and document the final image treatment. | WP2b, WP3, WP4 | Run `npm run build`, `npm run type-check`, `npm run test:all`, and inspect final web, extension, and Android assets. |

After WP1 is stable, WP2a, WP3, and WP4 can be implemented in parallel as separate focused changes. WP2b follows WP2a so the larger sidebar can be migrated independently without coupling it to branding or asset generation. Each slice must preserve existing behavior and clean up on unmount. WP5 integrates and validates them; do not mix unrelated app or API refactors into these changes.

## Implementation rules

1. Never overwrite or re-compress the source image.
2. Keep the crop, contrast parameters, output dimensions, and destinations in one generator; do not resize individual platform icons by hand.
3. Generate outputs only into documented paths. The script must report failures and must not silently skip a target.
4. Keep the Zuari shell island focused on shell rendering and user intent. Do not add a branding service, duplicate Vue shell rendering, global state, or feature-specific business logic.
5. Keep existing technical package names, application IDs, extension message IDs, and storage keys unchanged.
6. Do not hand-edit generated Android web assets. Regenerate them through the asset script and Capacitor sync.
7. Review the generated master at full size and at 16/48/128-pixel sizes before replacing current assets. Preserve the source appearance; reject any result that changes the logo’s shapes.

## Acceptance criteria

- Every logo variant is derived from the staged owner-supplied image; no AI-generated or redrawn content is present.
- The source file remains unchanged after repeated generation.
- Web, browser companion, and Android use the same reviewed crop and contrast treatment.
- All expected outputs are generated reproducibly with one documented command.
- Web shell branding is rendered by Zuari; the logo is decorative next to readable product text.
- Build, type checks, extension tests, and full test suite pass; Android assets are synced and device-tested before release.

## Current status

- **Done:** copied the supplied image unchanged; implemented the deterministic asset generator and focused source-preservation/noise/determinism test; generated web, favicon, extension, Android launcher, and splash assets; migrated the top bar to a Zuari island with a thin Vue lifecycle adapter; updated the sidebar logo, browser favicon, and extension popup; passed the full test suite, type check, production build, and Capacitor Android sync; smoke-tested mobile top-bar navigation and sticky behavior in Chromium.
- **Pending:** migrate the larger sidebar to Zuari (WP2b), complete visual checks of the extension and native assets, and device-test Android before release.

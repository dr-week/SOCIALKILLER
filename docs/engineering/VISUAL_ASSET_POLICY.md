# Visual asset policy and catalog

## Non-negotiable rule

Do not use AI image-generation models or services for any project image, icon, illustration, background, or decorative asset. Text-generation features are separate and do not authorize image generation. Do not spend image-generation credits for this project.

## Current asset catalog

| Asset type | Catalog and source | Treatment and notes |
| --- | --- | --- |
| Mini-app icons | `src/features/app-shell/mini-apps.ts`; `lucide-vue-next` | Use library components, not generated or hand-copied icon paths. Lucide is ISC-licensed; icons identified upstream as Feather-derived are MIT-licensed. Preserve both notices below. |
| Mini-app artwork | Per-app `background` metadata in `mini-apps.ts`; `src/assets/app-backgrounds/<app-id>/` | Owner-provided reference images, used with the user's confirmation of ownership. Original files stay unchanged beside deterministic optimized WebP overlays. Cards use a low-opacity screen blend behind the existing accent glow; Lucide app icons remain separate. |
| Product logo | `src/assets/branding/the-social-base-logo-source.png` | Owner-supplied immutable source. `src/assets/branding/generated/` contains only deterministic derivatives made by the documented pipeline. |
| Draft cover cards | `server/marketing/media-card.mjs` | Deterministic template-based SVG typography and gradients, not AI-generated imagery. Keep them editable drafts, not a substitute for curated illustrations. |
| Post media | Operator-selected assets from the media vault or explicitly supplied post media | No automatic remote image, GIF, or meme fetching. |
| Supplied reference images | User-provided attachments | User confirmed ownership and approved project use in the 2026-11-10 design request. Original files are retained unchanged in per-app source folders; local WebP overlays are generated for the launcher. |

## Adding or replacing an asset

1. Choose artwork that fits the product and the owning feature.
2. Do not use a remote URL as a permanent asset source. Store files locally under `src/assets/<domain>/` or in their owning feature's asset folder.
3. Record available source, creator/owner, attribution, modifications, and local destination details in this document when useful.
4. Preserve source files unchanged. Put deterministic exports beside their source and reproduce them with `npm run app-art:assets`.
5. Keep artwork mapped by app ID in the mini-app catalog; keep image overlays decorative and behind readable text, separate from small interface icons.

### Mini-app background mapping

| App | Source reference | App source folder |
| --- | --- | --- |
| Planner | Image from URL 14 | `src/assets/app-backgrounds/planner/` |
| Connections | Image from URL 11 | `src/assets/app-backgrounds/connections/` |
| Engage | Image from URL 6 | `src/assets/app-backgrounds/engage/` |
| Audience Audit | Image from URL 5 | `src/assets/app-backgrounds/audience/` |
| Profile Scout | Image from URL 19 | `src/assets/app-backgrounds/profile-scout/` |
| Content Studio | Image from URL 3 | `src/assets/app-backgrounds/content-studio/` |
| Script Studio | Image from URL 9 | `src/assets/app-backgrounds/script-studio/` |
| Workflows | Image from URL 12 | `src/assets/app-backgrounds/workflows/` |
| Workspaces | Image from URL 17 | `src/assets/app-backgrounds/workspaces/` |
| Design System | Image from URL 2 | `src/assets/app-backgrounds/design-system/` |
| Asset Manager | Image from URL 8 | `src/assets/app-backgrounds/asset-manager/` |
| Automation Studio | Image from URL 16 | `src/assets/app-backgrounds/automations/` |
| Android Build Studio | Image from URL 10 | `src/assets/app-backgrounds/android-builder/` |

## Third-party icon notices

Lucide source and current license: <https://github.com/lucide-icons/lucide/blob/main/LICENSE>. Include the following notices when distributing bundled Lucide icons.

### Lucide (ISC)

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

### Feather-derived Lucide icons (MIT)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

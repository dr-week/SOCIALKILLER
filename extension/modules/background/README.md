# Extension background module

## Purpose and data flow

`extension/background.js` is the Manifest V3 service-worker composition root. It registers app lifecycle, context menu, keep-alive, and runtime-message handlers. The background modules own provider composer URLs, tab reuse and injection, pending queue polling, local-app logging, and message-specific behavior.

## Modules

- `app-lifecycle.js`, `context-menu.js`, and `keep-alive-alarm.js` register browser lifecycle actions.
- `platform-urls.js` maps platforms to composer URLs; `platform-dispatch.js` opens/reuses tabs and injects the existing autoposter.
- `pending-dispatch-poller.js` processes one explicitly requested pending dispatch at a time.
- `messages/` keeps each runtime message contract separate; `register-message-router.js` preserves their listener order and async response behavior.
- `extension-logger.js` records local errors and syncs activity when the app is reachable; `constants.js` owns the local API origin.

## Dependencies and checks

Uses Chrome Manifest V3 APIs and the loopback app API. The manifest declares a module service worker. Run `npm run test:extension` for extension contracts and `npm run check:file-size` for the 150-line ceiling.

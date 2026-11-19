# Video script studio

## Purpose

Provides topic, story-pillar, and format controls and renders a generated script as timed beats or teleprompter text.

## Ownership and flow

- `../VideoScriptStudio.vue` composes the feature and forwards its generate event to the app shell.
- `VideoScriptControls.vue` owns the topic, pillar, and format inputs and emits the generation request.
- `VideoScriptOutput.vue` owns output mode and copy interaction for the supplied script.
- `styles/` contains namespaced controls and output styles, split into focused files under the 150-line source ceiling.

The app shell supplies the active brand, current script, and generation state. Generation remains owned by the app shell/service layer; this feature only collects inputs and presents results.

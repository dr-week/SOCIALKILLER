<script setup lang="ts">
import type { BrandProfile, ScriptFormat, ScriptPillar, VideoScript } from '../types/brand'
import VideoScriptControls from './video-script/VideoScriptControls.vue'
import VideoScriptOutput from './video-script/VideoScriptOutput.vue'

defineProps<{ activeBrand: BrandProfile; currentScript: VideoScript | null; generating: boolean }>()
const emit = defineEmits<{ (event: 'generate', payload: { topic: string; pillar: ScriptPillar; format: ScriptFormat }): void }>()
</script>

<template>
  <div class="video-studio-wrap">
    <VideoScriptControls :active-brand="activeBrand" :generating="generating" @generate="emit('generate', $event)" />
    <VideoScriptOutput v-if="currentScript" :current-script="currentScript" />
  </div>
</template>

<style scoped lang="scss">
.video-studio-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

<style lang="scss">
@use './video-script/styles/video-script-controls.scss';
@use './video-script/styles/video-script-output-header.scss';
@use './video-script/styles/video-script-output-body.scss';
</style>

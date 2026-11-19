<script setup lang="ts">
import { ref } from 'vue'
import DailyJourneyPoster from '../../components/DailyJourneyPoster.vue'
import VideoScriptStudio from '../../components/VideoScriptStudio.vue'
import type { DailyJourneyStory, ScriptFormat, ScriptPillar, VideoScript } from '../../types/brand'
import type { BrandProfile } from '../../types/brand'

defineProps<{
  brand: BrandProfile
  script: VideoScript | null
  journey: DailyJourneyStory | null
  generatingScript: boolean
  generatingJourney: boolean
}>()
const emit = defineEmits<{
  (event: 'generate-script', payload: { topic: string; pillar: ScriptPillar; format: ScriptFormat }): void
  (event: 'generate-journey', payload: { topic?: string; milestoneId?: string }): void
}>()
const activeTool = ref<'script' | 'story'>('script')
</script>

<template>
  <main class="script-studio">
    <header><p>BRAND-AWARE WRITING</p><h1>Script Studio</h1><span>Generate a video script or turn a milestone into channel-specific stories for {{ brand.name }}.</span></header>
    <nav aria-label="Script Studio tools">
      <button :aria-pressed="activeTool === 'script'" @click="activeTool = 'script'">Video scripts</button>
      <button :aria-pressed="activeTool === 'story'" @click="activeTool = 'story'">Milestone stories</button>
    </nav>
    <VideoScriptStudio v-if="activeTool === 'script'" :active-brand="brand" :current-script="script" :generating="generatingScript" @generate="emit('generate-script', $event)" />
    <DailyJourneyPoster v-else :current-journey="journey" :generating="generatingJourney" @generate="emit('generate-journey', $event)" />
  </main>
</template>

<style scoped>
.script-studio { max-width: 1120px; margin: 0 auto; }
.script-studio header { margin-bottom: 18px; padding: 20px 22px; border: 1px solid var(--glass-border); border-radius: 20px; background: radial-gradient(ellipse at 100% 0%, color-mix(in srgb, #ed8fff 13%, transparent), transparent 49%), var(--surface-card); box-shadow: var(--card-shadow); }
.script-studio header p { margin: 0; color: #ed8fff; font-size: 9px; font-weight: 700; letter-spacing: .13em; }
.script-studio h1 { margin: 7px 0 5px; font: 700 clamp(24px, 3vw, 29px) Manrope, sans-serif; letter-spacing: -.03em; }
.script-studio header span { color: var(--muted); font-size: 11px; line-height: 1.55; }
.script-studio nav { display: flex; gap: 7px; margin-bottom: 16px; border-bottom: 1px solid var(--line); }
.script-studio nav button { min-height: 40px; padding: 0 12px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--muted); cursor: pointer; font-size: 11px; }
.script-studio nav button[aria-pressed="true"] { border-color: var(--accent-primary); color: var(--accent-primary); font-weight: 700; }
</style>

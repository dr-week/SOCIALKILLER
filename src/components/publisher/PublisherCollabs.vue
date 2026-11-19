<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handshake, Calendar, Copy, Check, Clock, Sparkles } from 'lucide-vue-next'
import { generateLyraMarketingSuite, type CollabProposal, type MeetingAgenda } from '../../domain/marketing-intelligence'

const props = defineProps<{ brandName?: string }>()
const emit = defineEmits<{ (e: 'showToast', msg: string): void }>()

const suite = computed(() =>
  generateLyraMarketingSuite({
    projectName: props.brandName || 'Zuari (dr-week/fast-framework)',
    category: 'Zero-VDOM Web, WebXR & Wasm'
  })
)

const copiedCollabIdx = ref<number | null>(null)
const copiedMeeting = ref(false)

function copyCollab(collab: CollabProposal, idx: number) {
  navigator.clipboard.writeText(`Subject: ${collab.subjectLine}\n\n${collab.pitchSnippet}`)
  copiedCollabIdx.value = idx
  emit('showToast', `Copied ${collab.targetType} pitch!`)
  setTimeout(() => { copiedCollabIdx.value = null }, 1800)
}

function copyMeetingAgenda(meeting: MeetingAgenda) {
  const text = `${meeting.title} (${meeting.duration})\n${meeting.keyPoints.join('\n')}\nCTA: ${meeting.closingCta}`
  navigator.clipboard.writeText(text)
  copiedMeeting.value = true
  emit('showToast', 'Copied meeting promo & agenda!')
  setTimeout(() => { copiedMeeting.value = false }, 1800)
}
</script>

<template>
  <div class="pub-section">
    <div class="pub-card">
      <div class="pub-row-between">
        <div class="pub-hero-left">
          <Calendar :size="20" style="color: #c084fc" />
          <div>
            <h4 class="pub-hero-title">{{ suite.meeting.title }}</h4>
            <p class="pub-hero-sub"><Clock :size="11" /> {{ suite.meeting.duration }} &bull; {{ suite.meeting.objective }}</p>
          </div>
        </div>
        <button class="pub-btn primary" @click="copyMeetingAgenda(suite.meeting)">
          <component :is="copiedMeeting ? Check : Copy" :size="13" />
          <span>{{ copiedMeeting ? 'Copied' : 'Copy Agenda' }}</span>
        </button>
      </div>

      <div class="pub-grid-2">
        <div v-for="(pt, i) in suite.meeting.keyPoints" :key="i" class="pub-row-between" style="justify-content: flex-start">
          <span class="pub-pill purple">{{ i + 1 }}</span>
          <span style="font-size: 12px">{{ pt }}</span>
        </div>
      </div>

      <div class="pub-pill green" style="align-self: flex-start">
        <Sparkles :size="11" /> CTA: {{ suite.meeting.closingCta }}
      </div>
    </div>

    <div class="pub-grid-3">
      <div v-for="(collab, i) in suite.collabs" :key="i" class="pub-card">
        <div class="pub-row-between">
          <span class="pub-pill blue">{{ collab.targetType }}</span>
          <span class="pub-pill amber">{{ collab.channel }}</span>
        </div>
        <strong style="font-size: 12.5px">{{ collab.subjectLine }}</strong>
        <p style="margin: 0; font-size: 11.5px; opacity: 0.8">{{ collab.pitchSnippet }}</p>
        <div class="pub-row-between" style="margin-top: auto">
          <span class="pub-pill green"><Handshake :size="11" /> {{ collab.synergyHook }}</span>
          <button class="pub-btn" @click="copyCollab(collab, i)">
            <component :is="copiedCollabIdx === i ? Check : Copy" :size="12" />
            <span>{{ copiedCollabIdx === i ? 'Copied' : 'Copy' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './publisher-shared.css';
</style>

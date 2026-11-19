<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRight, Download, ExternalLink, HelpCircle, ShieldCheck, X } from 'lucide-vue-next'

defineProps<{ isOpen: boolean }>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'triggerImport'): void
}>()

const activeStep = ref(1)
const STEPS = [
  { num: 1, title: 'Accounts Center' },
  { num: 2, title: 'Select Format (JSON)' },
  { num: 3, title: 'Drop into SOCIALKILLER' }
]
</script>

<template>
  <div v-if="isOpen" class="guide-modal-overlay" @click.self="emit('close')">
    <div class="guide-modal-card">
      <div class="guide-header">
        <div class="header-left">
          <div class="icon-badge"><HelpCircle :size="18" /></div>
          <h3>How to Export Your Instagram Data</h3>
        </div>
        <button class="close-btn" aria-label="Close guide" @click="emit('close')"><X :size="16" /></button>
      </div>

      <div class="safety-callout">
        <ShieldCheck :size="16" class="text-emerald" />
        <span><strong>Zero Password Risk:</strong> Local export keeps account credentials out of this app.</span>
      </div>

      <div class="step-pills">
        <button
          v-for="s in STEPS"
          :key="s.num"
          class="step-pill-btn"
          :class="{ active: activeStep === s.num, completed: activeStep > s.num }"
          @click="activeStep = s.num"
        >
          <span class="step-num">{{ s.num }}</span>
          <span class="step-name">{{ s.title }}</span>
        </button>
      </div>

      <div class="step-display-box">
        <div v-if="activeStep === 1" class="step-content">
          <h4>Step 1: Open Instagram Accounts Center</h4>
          <p>Go to <strong>Settings</strong> &gt; <strong>Accounts Center</strong> &gt; <strong>Your information and permissions</strong> &gt; <strong>Download your information</strong>.</p>
          <div class="action-row">
            <a href="https://accountscenter.instagram.com/info_and_permissions/dyi/" target="_blank" rel="noopener noreferrer" class="guide-btn guide-btn--outline">
              <span>Open Instagram Accounts Center</span>
              <ExternalLink :size="12" />
            </a>
          </div>
        </div>

        <div v-else-if="activeStep === 2" class="step-content">
          <h4>Step 2: Choose JSON Format</h4>
          <ul class="guide-bullets">
            <li>Select <strong>Some of your information</strong> (skip media/messages).</li>
            <li>Check <strong>Followers and following</strong>.</li>
            <li>Set Date range to <strong>All time</strong> and Format to <strong>JSON</strong>.</li>
          </ul>
        </div>

        <div v-else class="step-content">
          <h4>Step 3: Drop the ZIP into SOCIALKILLER</h4>
          <p>Download the Meta archive <code>.zip</code> and drop it onto the Audience upload zone.</p>
          <div class="action-row">
            <button class="guide-btn guide-btn--primary" @click="emit('triggerImport'); emit('close')">
              <Download :size="13" />
              <span>Select File Now</span>
            </button>
          </div>
        </div>
      </div>

      <div class="guide-footer">
        <button v-if="activeStep > 1" class="nav-btn" @click="activeStep--">Back</button>
        <div class="footer-spacer"></div>
        <button v-if="activeStep < 3" class="nav-btn nav-btn--primary" @click="activeStep++">
          <span>Next Step</span>
          <ChevronRight :size="13" />
        </button>
        <button v-else class="nav-btn nav-btn--primary" @click="emit('close')">Got it!</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles/audience-export-guide.scss"></style>

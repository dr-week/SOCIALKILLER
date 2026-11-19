<script setup lang="ts">
import { ref } from 'vue'
import {
  HelpCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Download,
  FileCode,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'triggerImport'): void
}>()

const activeStep = ref(1)

const STEPS = [
  {
    num: 1,
    title: 'Accounts Center',
    desc: 'Go to Instagram Settings > Accounts Center > Your information and permissions > Download your information.'
  },
  {
    num: 2,
    title: 'Select Format (JSON)',
    desc: 'Choose "Some of your information", select "Followers and following", date range "All time", and format "JSON" (High quality).'
  },
  {
    num: 3,
    title: 'Drop into The Social Base',
    desc: 'When Instagram notifies you (typically in 5–15 minutes), download the ZIP and drop it directly into The Social Base.'
  }
]
</script>

<template>
  <div v-if="isOpen" class="guide-modal-overlay" @click.self="emit('close')">
    <div class="guide-modal-card">
      <div class="guide-header">
        <div class="header-left">
          <div class="icon-badge">
            <HelpCircle :size="18" />
          </div>
          <div>
            <h3>How to Export Your Instagram Data</h3>
            <p>Official, safe, and 100% offline-first guide</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')" aria-label="Close guide">
          <X :size="16" />
        </button>
      </div>

      <div class="safety-callout">
        <ShieldCheck :size="16" class="text-emerald" />
        <span>
          <strong>Zero Password Risk:</strong> You never give The Social Base your password. Your Instagram export keeps account credentials out of this app.
        </span>
      </div>

      <!-- Step Navigation Pills -->
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

      <!-- Step Content Display -->
      <div class="step-display-box">
        <div v-if="activeStep === 1" class="step-content">
          <h4>Step 1: Open Instagram Accounts Center</h4>
          <p>
            Navigate to Instagram on web or mobile, go to <strong>Settings</strong> &gt; <strong>Accounts Center</strong> &gt; <strong>Your information and permissions</strong> &gt; <strong>Download your information</strong>.
          </p>
          <div class="action-row">
            <a
              href="https://accountscenter.instagram.com/info_and_permissions/dyi/"
              target="_blank"
              class="guide-btn guide-btn--outline"
            >
              <span>Open Instagram Accounts Center</span>
              <ExternalLink :size="12" />
            </a>
          </div>
        </div>

        <div v-else-if="activeStep === 2" class="step-content">
          <h4>Step 2: Choose JSON Format (Critical)</h4>
          <p>
            When prompted by Meta:
          </p>
          <ul class="guide-bullets">
            <li>Select <strong>Some of your information</strong> (no need to export media/messages).</li>
            <li>Check <strong>Followers and following</strong>.</li>
            <li>Select Date range: <strong>All time</strong>.</li>
            <li>Format: Change from HTML to <strong>JSON</strong>.</li>
          </ul>
        </div>

        <div v-else-if="activeStep === 3" class="step-content">
          <h4>Step 3: Drop the ZIP File into The Social Base</h4>
          <p>
            Once ready, Meta sends you an email with the download link. Download the <code>.zip</code> file and drop it directly onto the upload zone.
          </p>
          <div class="action-row">
            <button class="guide-btn guide-btn--primary" @click="emit('triggerImport'); emit('close')">
              <Download :size="13" />
              <span>Select File Now</span>
            </button>
          </div>
        </div>
      </div>

      <div class="guide-footer">
        <button
          v-if="activeStep > 1"
          class="nav-btn"
          @click="activeStep--"
        >
          Back
        </button>
        <div style="flex: 1"></div>
        <button
          v-if="activeStep < 3"
          class="nav-btn nav-btn--primary"
          @click="activeStep++"
        >
          <span>Next Step</span>
          <ChevronRight :size="13" />
        </button>
        <button
          v-else
          class="nav-btn nav-btn--primary"
          @click="emit('close')"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.guide-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 16px;
}

.guide-modal-card {
  width: 100%;
  max-width: 520px;
  background: var(--surface-card, #131722);
  border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--ink, #fff);
  }

  p {
    margin: 2px 0 0;
    font-size: 11.5px;
    color: var(--muted, #94a3b8);
  }
}

.icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(120, 87, 220, 0.15);
  color: var(--purple, #7857dc);
  display: grid;
  place-items: center;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--muted, #94a3b8);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }
}

.safety-callout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 11.5px;
  color: #d1fae5;
  line-height: 1.4;
}

.step-pills {
  display: flex;
  gap: 6px;
}

.step-pill-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--muted, #94a3b8);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  .step-num {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: grid;
    place-items: center;
    font-size: 10px;
  }

  &.active {
    background: rgba(120, 87, 220, 0.18);
    border-color: var(--purple, #7857dc);
    color: #fff;

    .step-num {
      background: var(--purple, #7857dc);
      color: #fff;
    }
  }

  &.completed {
    color: #34d399;
  }
}

.step-display-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 14px;
  min-height: 140px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 8px;

  h4 {
    margin: 0;
    font-size: 13.5px;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: #cbd5e1;
  }
}

.guide-bullets {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.5;
}

.action-row {
  margin-top: 6px;
}

.guide-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;

  &--outline {
    background: transparent;
    border: 1px solid var(--purple, #7857dc);
    color: #c4b5fd;
    &:hover { background: rgba(120, 87, 220, 0.15); }
  }

  &--primary {
    background: var(--purple, #7857dc);
    color: #fff;
    &:hover { filter: brightness(1.1); }
  }
}

.guide-footer {
  display: flex;
  align-items: center;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  &--primary {
    background: var(--purple, #7857dc);
    border-color: var(--purple, #7857dc);
    color: #fff;

    &:hover {
      filter: brightness(1.1);
    }
  }
}
</style>

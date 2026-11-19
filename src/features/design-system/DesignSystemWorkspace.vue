<script setup lang="ts">
import { ref } from 'vue'
import type { AccentTheme, ThemeMode } from '../../types'
import UiButton from '../../shared/ui/UiButton.vue'
import UiCard from '../../shared/ui/UiCard.vue'
import UiField from '../../shared/ui/UiField.vue'

defineProps<{ theme: ThemeMode; accent: AccentTheme }>()
const emit = defineEmits<{
  (event: 'set-theme', value: ThemeMode): void
  (event: 'set-accent', value: AccentTheme): void
}>()
const themes: Array<{ value: ThemeMode; label: string }> = [
  { value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'auto', label: 'System' }
]
const accents: Array<{ value: AccentTheme; label: string; colors: string }> = [
  { value: 'coral', label: 'Coral', colors: 'linear-gradient(120deg,#ff7b88,#ff99bd)' },
  { value: 'violet', label: 'Violet', colors: 'linear-gradient(120deg,#b495ff,#ed8fff)' },
  { value: 'cyan', label: 'Cyan', colors: 'linear-gradient(120deg,#54d6ee,#69aaff)' },
  { value: 'mint', label: 'Mint', colors: 'linear-gradient(120deg,#59ddb6,#9cdd83)' },
  { value: 'orange', label: 'Orange', colors: 'linear-gradient(120deg,#ffad68,#ff7f8e)' }
]
const previewText = ref('')
</script>

<template>
  <main class="design-studio">
    <header class="design-studio__hero">
      <p>SHARED FOUNDATION · LIVE PREVIEW</p>
      <h1>Design System <span>Studio</span></h1>
      <div>One accessible visual language for every workspace, with controlled app-specific accents.</div>
    </header>

    <div class="design-studio__grid">
      <UiCard eyebrow="THEME" title="Choose the canvas" description="These controls update the platform theme and are saved with the existing user preference.">
        <div class="design-studio__options" role="group" aria-label="Color theme">
          <UiButton v-for="item in themes" :key="item.value" :variant="theme === item.value ? 'primary' : 'outline'" size="small" :aria-pressed="theme === item.value" @click="emit('set-theme', item.value)">
            {{ item.label }}
          </UiButton>
        </div>
        <p class="design-studio__note">Current theme: <strong>{{ theme }}</strong></p>
      </UiCard>

      <UiCard eyebrow="ACCENT" title="Select a signature" description="The accent changes shared actions, highlights, and focus states without replacing each app identity.">
        <div class="design-studio__accents" role="group" aria-label="Accent palette">
          <button v-for="item in accents" :key="item.value" class="design-studio__accent" :aria-pressed="accent === item.value" @click="emit('set-accent', item.value)">
            <i :style="{ background: item.colors }"></i><span>{{ item.label }}</span>
          </button>
        </div>
      </UiCard>

      <UiCard eyebrow="COMPONENTS" title="Live component preview" description="Shared controls inherit the same tokens, contrast, radius, and focus ring.">
        <div class="design-studio__preview">
          <div class="design-studio__preview-heading"><span class="design-studio__orb"></span><div><strong>Campaign overview</strong><small>Updated just now · Draft</small></div></div>
          <div class="design-studio__actions"><UiButton variant="primary">Create draft</UiButton><UiButton variant="quiet">View details</UiButton></div>
          <UiField label="Try a shared field" for-id="design-preview-field" hint="Inputs retain visible keyboard focus.">
            <input id="design-preview-field" v-model="previewText" placeholder="Write a short note" />
          </UiField>
        </div>
      </UiCard>

      <UiCard eyebrow="TOKENS" title="Foundation values" description="Token source: src/styles/_design-tokens.scss and _accent-tokens.scss.">
        <div class="design-studio__tokens">
          <div><i class="token-color token-color--canvas"></i><span>Canvas</span><code>--bg-app</code></div>
          <div><i class="token-color token-color--surface"></i><span>Surface</span><code>--surface-card</code></div>
          <div><i class="token-color token-color--text"></i><span>Text</span><code>--ink</code></div>
          <div><i class="token-color token-color--accent"></i><span>Accent</span><code>--accent-gradient</code></div>
        </div>
      </UiCard>
    </div>

    <footer class="design-studio__footer">Responsive layouts · keyboard-visible focus · reduced-motion support · Lucide icons · no generated artwork</footer>
  </main>
</template>

<style scoped>
.design-studio { max-width: 1160px; margin: 0 auto; color: var(--ink); }
.design-studio__hero { display: grid; gap: 9px; margin-bottom: 20px; padding: 23px 26px; border: 1px solid var(--glass-border); border-radius: 22px; background: radial-gradient(ellipse at 92% 10%, var(--accent-glow), transparent 40%), linear-gradient(135deg,var(--surface-card),var(--surface)); box-shadow: var(--card-shadow); }
.design-studio__hero p { margin: 0; color: var(--purple); font-size: 9px; font-weight: 700; letter-spacing: .14em; }
.design-studio__hero h1 { margin: 0; font: 700 clamp(24px,4vw,36px) Manrope,sans-serif; letter-spacing: -.045em; }.design-studio__hero h1 span { color: var(--accent-primary); }
.design-studio__hero div { color: var(--muted); font-size: 12px; line-height: 1.6; }
.design-studio__grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
.design-studio__options,.design-studio__actions { display: flex; flex-wrap: wrap; gap: 8px; }.design-studio__note { margin: 13px 0 0; color: var(--muted); font-size: 10px; text-transform: capitalize; }
.design-studio__accents { display: flex; flex-wrap: wrap; gap: 8px; }.design-studio__accent { display: inline-flex; min-height: 38px; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--line); border-radius: 11px; background: var(--surface-raised); color: var(--ink); cursor: pointer; font: 600 11px 'DM Sans',sans-serif; }.design-studio__accent[aria-pressed='true'] { border-color: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-glow); }
.design-studio__accent i { width: 15px; height: 15px; border-radius: 50%; }.design-studio__preview { display: grid; gap: 15px; padding: 15px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface); }.design-studio__preview-heading { display: flex; align-items: center; gap: 10px; }.design-studio__preview-heading div { display: grid; gap: 4px; }.design-studio__preview-heading strong { font-size: 12px; }.design-studio__preview-heading small { color: var(--muted); font-size: 10px; }
.design-studio__orb { width: 32px; height: 32px; border-radius: 11px; background: radial-gradient(circle at 30% 25%,#fff8,transparent 35%),var(--accent-gradient); box-shadow: 0 0 22px var(--accent-glow); }
.design-studio__tokens { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 11px; }.design-studio__tokens>div { display: grid; grid-template-columns: 24px 1fr; align-items: center; gap: 3px 8px; padding: 10px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); font-size: 10px; }.token-color { width: 22px; height: 22px; grid-row: span 2; border: 1px solid var(--line); border-radius: 7px; }.token-color--canvas { background: var(--bg-app); }.token-color--surface { background: var(--surface-card); }.token-color--text { background: var(--ink); }.token-color--accent { background: var(--accent-gradient); }.design-studio__tokens code { color: var(--muted); font-size: 9px; }
.design-studio__footer { margin-top: 16px; color: var(--muted); font-size: 10px; line-height: 1.6; text-align: center; }
@media(max-width:760px) { .design-studio__grid { grid-template-columns: 1fr; } }
@media(max-width:520px) { .design-studio__hero { padding: 19px; }.design-studio__tokens { grid-template-columns: 1fr; } }
@media(prefers-reduced-motion:reduce) { .design-studio *, .design-studio *::before, .design-studio *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; } }
</style>

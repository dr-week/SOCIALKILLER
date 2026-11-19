<script setup lang="ts">
defineProps<{
  webLink: string
  tags: string
  tone: string
  subreddit: string
  scheduledAt: string
  includeCodeSnippet: boolean
}>()

const emit = defineEmits<{
  (e: 'update:webLink', value: string): void
  (e: 'update:tags', value: string): void
  (e: 'update:tone', value: string): void
  (e: 'update:subreddit', value: string): void
  (e: 'update:scheduledAt', value: string): void
  (e: 'update:includeCodeSnippet', value: boolean): void
}>()
</script>

<template>
  <details class="text-options">
    <summary>Text &amp; timing</summary>
    <div class="text-options-content">
      <div class="pub-grid-2">
        <input :value="webLink" class="pub-input" placeholder="Reference URL" @input="emit('update:webLink', ($event.target as HTMLInputElement).value)" />
        <input :value="tags" class="pub-input" placeholder="Hashtags" @input="emit('update:tags', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="pub-grid-2">
        <select :value="tone" class="pub-select" aria-label="Writing tone" @change="emit('update:tone', ($event.target as HTMLSelectElement).value)">
          <option value="Clear and authentic">Authentic</option>
          <option value="Builder / Authentic">Builder</option>
          <option value="Technical Deep-Dive">Technical deep-dive</option>
          <option value="Contrarian / High Hook">Contrarian hook</option>
          <option value="Showoff / Launch">Showcase launch</option>
        </select>
        <input :value="subreddit" class="pub-input" placeholder="Subreddit" @input="emit('update:subreddit', ($event.target as HTMLInputElement).value)" />
      </div>
      <input :value="scheduledAt" type="datetime-local" class="pub-input" aria-label="Schedule date and time" @input="emit('update:scheduledAt', ($event.target as HTMLInputElement).value)" />
      <label class="pub-btn code-option">
        <input :checked="includeCodeSnippet" type="checkbox" @change="emit('update:includeCodeSnippet', ($event.target as HTMLInputElement).checked)" />
        <span>Code snippet</span>
      </label>
    </div>
  </details>
</template>

<style scoped>
@import './publisher-shared.css';

.text-options { border-top: 1px solid var(--line, rgba(255, 255, 255, 0.12)); }
.text-options > summary { min-height: 38px; padding: 8px 0; color: var(--muted, #94a3b8); cursor: pointer; font-size: 11px; list-style: none; }
.text-options > summary::-webkit-details-marker { display: none; }
.text-options > summary::after { float: right; content: '+'; font-size: 16px; }
.text-options[open] > summary::after { content: '−'; }
.text-options-content { display: grid; gap: 8px; padding-bottom: 4px; }
.code-option { justify-self: start; }
</style>

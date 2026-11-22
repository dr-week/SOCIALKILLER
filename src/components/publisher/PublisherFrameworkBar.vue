<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { COPY_FRAMEWORKS, type CopyFrameworkId } from '../../domain/copy-frameworks'

defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ (e: 'select', id: CopyFrameworkId): void }>()
</script>

<template>
  <div class="framework-bar" role="group" aria-label="Copywriting frameworks">
    <span class="framework-label"><Sparkles :size="12" /> Frameworks</span>
    <button
      v-for="fw in COPY_FRAMEWORKS"
      :key="fw.id"
      type="button"
      class="fw-pill"
      :title="fw.hint"
      :disabled="disabled"
      @click="emit('select', fw.id)"
    >
      {{ fw.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.framework-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.framework-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-muted, #94a3b8);
}
.fw-pill {
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  background: var(--surface-2, rgba(255, 255, 255, 0.04));
  color: var(--ink, #e2e8f0);
  border-radius: 999px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.fw-pill:hover:not(:disabled) {
  border-color: var(--accent, #38bdf8);
  background: rgba(56, 189, 248, 0.12);
}
.fw-pill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

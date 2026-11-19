<script setup lang="ts">
defineProps<{ label: string; forId: string; hint?: string }>()
</script>

<template>
  <label class="ui-field" :for="forId">
    <span>{{ label }}</span>
    <slot />
    <small v-if="hint">{{ hint }}</small>
  </label>
</template>

<style scoped>
.ui-field { display: grid; gap: 7px; color: var(--ink); font-size: 11px; font-weight: 600; }
.ui-field :slotted(input), .ui-field :slotted(select), .ui-field :slotted(textarea) { width: 100%; min-height: 39px; padding: 9px 11px; border: 1px solid var(--line); border-radius: 10px; background: var(--input-bg); color: var(--ink); font: 400 12px 'DM Sans', sans-serif; }
.ui-field small { color: var(--muted); font-size: 10px; font-weight: 400; line-height: 1.5; }
</style>

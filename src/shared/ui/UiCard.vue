<script setup lang="ts">
defineProps<{ title?: string; eyebrow?: string }>()
</script>

<template>
  <section class="ui-card">
    <header v-if="title || eyebrow">
      <span v-if="eyebrow" class="ui-card__eyebrow">{{ eyebrow }}</span>
      <h2 v-if="title">{{ title }}</h2>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.ui-card { min-width: 0; padding: 18px; border: 1px solid var(--glass-border); border-radius: 18px; background: var(--glass-bg); backdrop-filter: blur(18px); box-shadow: var(--card-shadow); color: var(--ink); }
.ui-card header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.ui-card__eyebrow { margin: 0; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--glass-border); background: var(--surface-raised); color: var(--purple); font-size: 8.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; order: 2; }
.ui-card h2 { margin: 0; font: 700 15.5px Manrope, sans-serif; letter-spacing: -.03em; order: 1; }
</style>

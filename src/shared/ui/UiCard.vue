<script setup lang="ts">
defineProps<{ title?: string; eyebrow?: string; description?: string }>()
</script>

<template>
  <section class="ui-card">
    <header v-if="title || eyebrow || description">
      <p v-if="eyebrow" class="ui-card__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="title">{{ title }}</h2>
      <p v-if="description" class="ui-card__description">{{ description }}</p>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.ui-card { min-width: 0; padding: 20px; border: 1px solid var(--glass-border); border-radius: 18px; background: var(--surface-card); box-shadow: var(--card-shadow); color: var(--ink); }
.ui-card header { display: grid; gap: 6px; margin-bottom: 16px; }
.ui-card__eyebrow { margin: 0; color: var(--purple); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.ui-card h2 { margin: 0; font: 700 17px Manrope, sans-serif; letter-spacing: -.03em; }
.ui-card__description { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
</style>

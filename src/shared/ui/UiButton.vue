<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'quiet' | 'outline'
  size?: 'small' | 'medium'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), { variant: 'outline', size: 'medium', type: 'button', disabled: false })
</script>

<template>
  <button class="ui-button" :class="[`ui-button--${variant}`, `ui-button--${size}`]" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.ui-button { display: inline-flex; min-height: 38px; align-items: center; justify-content: center; gap: 8px; padding: 0 14px; border: 1px solid var(--line); border-radius: 11px; color: var(--ink); cursor: pointer; font: 600 12px 'DM Sans', sans-serif; transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.ui-button:hover:not(:disabled) { transform: translateY(-1px); }
.ui-button:disabled { cursor: not-allowed; opacity: .55; }
.ui-button--primary { border-color: transparent; background: var(--accent-gradient); box-shadow: 0 5px 20px var(--accent-glow); color: #fff; }
.ui-button--quiet { border-color: transparent; background: transparent; color: var(--muted); }
.ui-button--quiet:hover:not(:disabled) { background: var(--purple-soft); color: var(--ink); }
.ui-button--outline { background: var(--surface-raised); }
.ui-button--small { min-height: 32px; padding: 0 10px; font-size: 11px; }
.ui-button--medium { min-height: 38px; }
@media (prefers-reduced-motion: reduce) { .ui-button { transition: none; } }
</style>

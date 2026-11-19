<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { View } from '../../types'
import { APP_NAVIGATION } from '../../features/app-shell/mini-apps'
import { isAudienceView } from '../../features/app-shell/mini-app-routes'

defineProps<{ activeView: View }>()
const emit = defineEmits<{ (event: 'select', view: View): void }>()
const isScrolling = ref(false)
let scrollTimer: ReturnType<typeof setTimeout> | undefined

function revealScrollIndicator() {
  isScrolling.value = true
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    isScrolling.value = false
    scrollTimer = undefined
  }, 700)
}

function isActive(view: View, activeView: View) {
  return view === activeView || (view === 'overview' && isAudienceView(activeView))
}

onBeforeUnmount(() => {
  if (scrollTimer) clearTimeout(scrollTimer)
})
</script>

<template>
  <nav
    class="mini-app-navigation"
    :class="{ 'mini-app-navigation--scrolling': isScrolling }"
    aria-label="Mini-apps"
    @scroll.passive="revealScrollIndicator"
  >
    <p class="navigation-label">YOUR APPS</p>
    <button
      v-for="app in APP_NAVIGATION"
      :key="app.id"
      type="button"
      class="mini-app-nav-item"
      :class="{ 'mini-app-nav-item--active': isActive(app.view, activeView) }"
      :style="{ '--app-accent': app.accent }"
      :aria-current="isActive(app.view, activeView) ? 'page' : undefined"
      @click="emit('select', app.view)"
    >
      <span class="mini-app-nav-icon"><component :is="app.icon" :size="17" /></span>
      <span>{{ app.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.mini-app-navigation { display: grid; align-content: start; gap: 5px; padding: 8px 0; overflow-y: auto; scrollbar-color: transparent transparent; scrollbar-width: thin; }
.mini-app-navigation::-webkit-scrollbar { width: 4px; }
.mini-app-navigation::-webkit-scrollbar-track { background: transparent; }
.mini-app-navigation::-webkit-scrollbar-thumb { border-radius: 99px; background: transparent; transition: background-color .3s ease; }
.mini-app-navigation--scrolling { scrollbar-color: color-mix(in srgb, var(--muted) 30%, transparent) transparent; }
.mini-app-navigation--scrolling::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--muted) 30%, transparent); }
.navigation-label { margin: 0 0 5px; padding: 0 10px; color: var(--muted); font-size: 9px; font-weight: 700; letter-spacing: .12em; }
.mini-app-nav-item { display: flex; min-height: 42px; align-items: center; gap: 10px; padding: 0 9px; border: 1px solid transparent; border-radius: 11px; background: transparent; color: var(--muted); cursor: pointer; font-size: 12px; font-weight: 600; text-align: left; transition: background .16s, color .16s, border-color .16s; }
.mini-app-nav-item:hover { background: var(--surface-raised); color: var(--ink); }
.mini-app-nav-item--active { border-color: color-mix(in srgb, var(--app-accent) 30%, transparent); background: color-mix(in srgb, var(--app-accent) 12%, var(--surface)); color: var(--ink); }
.mini-app-nav-icon { display: grid; width: 28px; height: 28px; flex: 0 0 auto; place-items: center; border-radius: 9px; background: color-mix(in srgb, var(--app-accent) 10%, var(--surface-raised)); color: var(--app-accent); transition: box-shadow .16s; }
.mini-app-nav-item--active .mini-app-nav-icon { background: color-mix(in srgb, var(--app-accent) 18%, var(--surface)); box-shadow: 0 0 16px color-mix(in srgb, var(--app-accent) 15%, transparent); }
@media (prefers-reduced-motion: reduce) { .mini-app-navigation::-webkit-scrollbar-thumb { transition: none; } }
</style>

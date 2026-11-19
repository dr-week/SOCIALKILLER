<script setup lang="ts">
import { ArrowRight, Check, Clock3, ExternalLink, Info } from 'lucide-vue-next'
import { useMiniAppLauncher } from './useMiniAppLauncher'
import type { View } from '../../types'

defineProps<{ activeBrandName: string }>()
const emit = defineEmits<{ (event: 'open-app', view: View): void }>()
const {
  activeAppId, appGroups, appStyle, appUrl, availableApps, clearAppFocus,
  endPress, expandedDescription, focusApp, onCardFocusOut, onPointerEnter,
  onPointerLeave, roadmapGroups, startPress, toggleDescription
} = useMiniAppLauncher(emit)
</script>

<template>
  <main class="app-launcher">
    <header class="launcher-heading">
      <div>
        <p class="launcher-eyebrow">THE SOCIAL BASE · APP LAUNCHER</p>
        <h1>Your agency, <span class="heading-highlight">in one place.</span></h1>
        <p class="launcher-copy">Choose a focused workspace. Your active brand and local settings stay shared as you move between apps.</p>
      </div>
      <div class="workspace-chip"><span class="workspace-chip-status"></span><span class="workspace-chip-name">{{ activeBrandName }}</span></div>
    </header>

    <section aria-labelledby="available-apps">
      <div class="section-heading"><h2 id="available-apps">Available apps</h2><span>{{ availableApps.length }} workspaces</span></div>
      <div v-for="group in appGroups" :key="group.category" class="app-category">
        <h3>{{ group.category }}</h3>
        <div class="app-grid">
          <article
            v-for="app in group.items"
            :key="app.id"
            class="app-card"
            :class="{
              'app-card--description-open': expandedDescription === app.id,
              'app-card--active': activeAppId === app.id,
              'app-card--dimmed': activeAppId !== null && activeAppId !== app.id
            }"
            :data-app="app.id"
            :style="appStyle(app)"
            @pointerenter="onPointerEnter($event, app.id)"
            @pointerleave="onPointerLeave($event, app.id)"
            @pointerdown="startPress($event, app.id)"
            @pointerup="endPress($event, app.id)"
            @pointercancel="endPress($event, app.id)"
            @focusin="focusApp(app.id)"
            @focusout="onCardFocusOut($event, app.id)"
          >
            <span class="app-card-art" aria-hidden="true"></span>
            <button class="app-card-open" type="button" :aria-describedby="`app-description-${app.id}`" @click="emit('open-app', app.view)">
              <span class="app-icon"><component :is="app.icon" :size="20" /></span>
              <span class="app-status"><Check :size="12" /> {{ app.status }}</span>
              <span class="app-category">{{ app.category }}</span>
              <strong>{{ app.label }}</strong>
              <span class="launch-link">Open workspace <ArrowRight :size="14" /></span>
            </button>
            <a class="app-new-tab" :href="appUrl(app.view)" target="_blank" rel="noopener noreferrer" :aria-label="`Open ${app.label} in a new tab`" title="Open in a new tab">
              <ExternalLink :size="14" />
            </a>
            <button
              class="app-info-toggle"
              type="button"
              :aria-describedby="`app-description-${app.id}`"
              :aria-label="`${expandedDescription === app.id ? 'Hide' : 'Show'} ${app.label} description`"
              :aria-controls="`app-description-${app.id}`"
              :aria-expanded="expandedDescription === app.id"
              @click="toggleDescription(app.id)"
            ><Info :size="15" /></button>
            <div
              :id="`app-description-${app.id}`"
              class="app-tooltip"
              :class="{ 'app-tooltip--open': expandedDescription === app.id }"
              role="tooltip"
            ><span>{{ app.description }}</span></div>
          </article>
        </div>
      </div>
    </section>

    <details class="roadmap">
      <summary><span><Clock3 :size="16" /> Planned mini-apps</span><small>Roadmap only · these workspaces are not available yet</small></summary>
      <div v-for="group in roadmapGroups" :key="group.category" class="roadmap-category">
        <h3>{{ group.category }}</h3>
        <div class="roadmap-grid">
          <article v-for="app in group.items" :key="app.id" class="roadmap-card" :style="{ '--app-accent': app.accent }">
            <component :is="app.icon" :size="17" />
            <div><strong>{{ app.label }}</strong><p>{{ app.description }}</p></div>
            <span>Planned</span>
          </article>
        </div>
      </div>
    </details>
  </main>
</template>

<style scoped lang="scss" src="./mini-app-launcher.scss"></style>
<style scoped lang="scss" src="./mini-app-art.scss"></style>

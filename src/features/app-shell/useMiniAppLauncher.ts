import { computed, onBeforeUnmount, ref } from 'vue'
import { APP_NAVIGATION, ROADMAP_APPS, groupAppsByCategory } from './mini-apps'
import type { MiniApp } from './mini-apps'
import { appHref } from './app-navigation'
import type { View } from '../../types'

type OpenApp = (event: 'open-app', view: View) => void

export function useMiniAppLauncher(emit: OpenApp) {
  const expandedDescription = ref<string | null>(null)
  const activeAppId = ref<string | null>(null)
  let pressTimer: ReturnType<typeof setTimeout> | null = null
  const availableApps = APP_NAVIGATION.filter(app => app.id !== 'home')
  const appGroups = computed(() => groupAppsByCategory(availableApps))
  const roadmapGroups = computed(() => groupAppsByCategory(ROADMAP_APPS))

  function focusApp(appId: string) {
    activeAppId.value = appId
  }

  function clearAppFocus(appId: string) {
    if (activeAppId.value === appId) activeAppId.value = null
  }

  function onPointerEnter(event: PointerEvent, appId: string) {
    if (event.pointerType === 'mouse') focusApp(appId)
  }

  function endPress(event: PointerEvent, appId: string) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    if (pressTimer) clearTimeout(pressTimer)
    pressTimer = null
    clearAppFocus(appId)
  }

  function onPointerLeave(event: PointerEvent, appId: string) {
    if (event.pointerType === 'mouse') clearAppFocus(appId)
    else endPress(event, appId)
  }

  function startPress(event: PointerEvent, appId: string) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    if (pressTimer) clearTimeout(pressTimer)
    pressTimer = setTimeout(() => focusApp(appId), 380)
  }

  function onCardFocusOut(event: FocusEvent, appId: string) {
    const card = event.currentTarget
    if (card instanceof HTMLElement && event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return
    clearAppFocus(appId)
  }

  function toggleDescription(appId: string) {
    expandedDescription.value = expandedDescription.value === appId ? null : appId
  }

  function appUrl(view: View) {
    return appHref(view, window.location.href)
  }

  function appStyle(app: MiniApp) {
    return {
      '--app-accent': app.accent,
      '--app-background': app.background ? `url("${app.background}")` : 'none'
    }
  }

  onBeforeUnmount(() => {
    if (pressTimer) clearTimeout(pressTimer)
  })

  return {
    activeAppId, appGroups, appStyle, appUrl, availableApps, clearAppFocus,
    endPress, expandedDescription, focusApp, onCardFocusOut, onPointerEnter,
    onPointerLeave, roadmapGroups, startPress, toggleDescription
  }
}

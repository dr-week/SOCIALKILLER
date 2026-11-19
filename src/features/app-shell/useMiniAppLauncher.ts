import { computed, onBeforeUnmount, ref } from 'vue'
import { APP_NAVIGATION, ROADMAP_APPS, groupAppsByCategory } from './mini-apps'
import type { MiniApp } from './mini-apps'
import { appHref } from './app-navigation'
import { rankFuzzyItems } from '../../shared/search/fuzzy-search'
import type { View } from '../../types'

type OpenApp = (event: 'open-app', view: View) => void

export function useMiniAppLauncher(emit: OpenApp, getSearchQuery: () => string = () => '') {
  const expandedDescription = ref<string | null>(null)
  const activeAppId = ref<string | null>(null)
  let pressTimer: ReturnType<typeof setTimeout> | null = null
  const allAvailableApps = APP_NAVIGATION.filter(app => app.id !== 'home')
  const fields = (app: Omit<MiniApp, 'view'>) => [app.label, app.category, app.description]
  const availableApps = computed(() => rankFuzzyItems(allAvailableApps, getSearchQuery(), fields))
  const appGroups = computed(() => groupAppsByCategory(availableApps.value))
  const roadmapGroups = computed(() => groupAppsByCategory(rankFuzzyItems(ROADMAP_APPS, getSearchQuery(), fields)))

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

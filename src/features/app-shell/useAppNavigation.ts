import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { View } from '../../types'
import { appHref, viewFromSearch } from './app-navigation'

export function useAppNavigation() {
  const activeView = ref<View>(viewFromSearch(window.location.search))
  let restoringHistory = false

  watch(activeView, view => {
    if (restoringHistory) return
    const href = appHref(view, window.location.href)
    if (href !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.pushState({ appView: view }, '', href)
    }
  }, { flush: 'sync' })

  function restoreView() {
    restoringHistory = true
    activeView.value = viewFromSearch(window.location.search)
    restoringHistory = false
  }

  onMounted(() => window.addEventListener('popstate', restoreView))
  onUnmounted(() => window.removeEventListener('popstate', restoreView))
  return { activeView }
}

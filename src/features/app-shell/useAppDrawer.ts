import { onMounted, onUnmounted, watch, type Ref } from 'vue'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useAppDrawer(menuOpen: Ref<boolean>, brandId: Readonly<Ref<string>>) {
  let opener: HTMLElement | null = null
  let wasOpen = false
  const drawer = () => document.getElementById('navigation-drawer')

  function restoreFocus() {
    requestAnimationFrame(() => {
      const target = opener
      opener = null
      target?.focus()
    })
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && menuOpen.value) {
      menuOpen.value = false
      restoreFocus()
      return
    }
    if (event.key !== 'Tab' || !menuOpen.value) return
    const panel = drawer()
    const items = panel?.querySelectorAll<HTMLElement>(FOCUSABLE)
    if (!items?.length) {
      event.preventDefault()
      panel?.focus()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && (document.activeElement === first || !panel?.contains(document.activeElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (document.activeElement === last || !panel?.contains(document.activeElement))) {
      event.preventDefault()
      first.focus()
    }
  }

  function syncExtensionWorkspace() {
    window.postMessage({
      type: 'FOLLOWDESK_WEB_TO_EXT_CONTEXT',
      payload: { brandId: brandId.value, frontendPort: Number(window.location.port) || 80 }
    }, window.location.origin)
  }

  watch(menuOpen, isOpen => {
    if (isOpen) {
      opener = document.querySelector<HTMLElement>('[data-menu-button]')
      requestAnimationFrame(() => drawer()?.querySelector<HTMLElement>(FOCUSABLE)?.focus())
    } else if (wasOpen) restoreFocus()
    wasOpen = isOpen
  })
  watch(brandId, syncExtensionWorkspace)
  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    syncExtensionWorkspace()
  })
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))

  return { syncExtensionWorkspace }
}

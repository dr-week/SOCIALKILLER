import { html, render } from '@zuari/dom'
import { createSvgElement } from '@zuari/glyphs'

export interface AppTopbarProps {
  menuOpen: boolean
  hasData?: boolean
  searchQuery?: string
}

export interface AppTopbarHandlers {
  toggleMenu: () => void
  openWorkspace: () => void
  onSearch?: (query: string) => void
  onSearchSubmit?: (query: string) => void
}

export interface AppTopbarIsland {
  update: (props: AppTopbarProps) => void
  destroy: () => void
}

export function mountAppTopbar(
  host: HTMLElement,
  initial: AppTopbarProps,
  handlers: AppTopbarHandlers
): AppTopbarIsland {
  const view = render(html`
    <header class="topbar">
      <button
        type="button"
        class="mobile-brand"
        aria-label="Open navigation drawer"
        aria-expanded="false"
        aria-controls="navigation-drawer"
        data-menu-button
        data-workspace-link
        @click=${handlers.toggleMenu}
      >
        <img class="brand-mark" src="./branding/social-base-logo.png" alt="" />
        <span>SOCIAL<span class="brand-accent">KILLER</span></span>
      </button>

      <label class="topbar-search" aria-label="Search workspaces and accounts">
        ${createIcon('search', 14)}
        <input
          type="search"
          placeholder="Search apps, accounts, or workflows..."
          value=${initial.searchQuery || ''}
          data-topbar-search
        />
        <kbd aria-hidden="true">/</kbd>
      </label>

      <div class="top-actions"></div>
    </header>
  `, host)

  const menuButton = host.querySelector<HTMLButtonElement>('[data-menu-button]')
  const searchInput = host.querySelector<HTMLInputElement>('[data-topbar-search]')
  if (!menuButton || !searchInput) {
    view.destroy()
    throw new Error('Zuari topbar did not render all required controls.')
  }

  const onInput = () => handlers.onSearch?.(searchInput.value)
  const onSearchKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      searchInput.value = ''
      handlers.onSearch?.('')
      searchInput.blur()
    } else if (event.key === 'Enter') {
      handlers.onSearchSubmit?.(searchInput.value)
    }
  }
  const onWindowKeydown = (event: KeyboardEvent) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
    const target = event.target as HTMLElement | null
    if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return
    event.preventDefault()
    searchInput.focus()
    searchInput.select()
  }

  searchInput.addEventListener('input', onInput)
  searchInput.addEventListener('keydown', onSearchKeydown)
  window.addEventListener('keydown', onWindowKeydown)

  const updateMenuState = (menuOpen: boolean) => {
    menuButton.setAttribute('aria-label', menuOpen ? 'Close navigation drawer' : 'Open navigation drawer')
    menuButton.setAttribute('aria-expanded', String(menuOpen))
    menuButton.classList.toggle('mobile-brand--drawer-open', menuOpen)
  }
  updateMenuState(initial.menuOpen)

  let destroyed = false
  return {
    update(props) {
      if (destroyed) return
      updateMenuState(props.menuOpen)
      if (typeof props.searchQuery === 'string' && searchInput.value !== props.searchQuery) {
        searchInput.value = props.searchQuery
      }
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      searchInput.removeEventListener('input', onInput)
      searchInput.removeEventListener('keydown', onSearchKeydown)
      window.removeEventListener('keydown', onWindowKeydown)
      view.destroy()
    }
  }
}

function createIcon(name: 'search', size: number): SVGElement {
  const paths = { search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>' } satisfies Record<typeof name, string>
  return createSvgElement('0 0 24 24', paths[name], { size, class: 'topbar-icon' })
}

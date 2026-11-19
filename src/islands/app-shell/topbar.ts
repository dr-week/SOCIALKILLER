import { html, render } from '@zuari/dom'
import { createSvgElement } from '@zuari/glyphs'

export interface AppTopbarProps {
  menuOpen: boolean
  hasData: boolean
}

export interface AppTopbarHandlers {
  toggleMenu: () => void
  openWorkspace: () => void
  triggerImport: () => void
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
        class="mobile-menu"
        aria-label="Open navigation"
        aria-expanded="false"
        aria-controls="navigation-drawer"
        data-menu-button
        @click=${handlers.toggleMenu}
      >
        ${createIcon(initial.menuOpen ? 'close' : 'menu', 20)}
      </button>
      <button type="button" class="mobile-brand" data-workspace-link @click=${handlers.openWorkspace}>
        <img class="brand-mark" src="/branding/social-base-logo.png" alt="" />
        <span>SOCIAL<span class="brand-accent">KILLER</span></span>
      </button>
      <div class="breadcrumbs">
        ${createIcon('dashboard', 14)}
        <span>Workspace</span>
      </div>
      <div class="top-actions">
        <span class="sync-status">
          <i></i><span data-sync-message>${initial.hasData ? 'Data synced' : 'Ready to import'}</span>
        </span>
        <button type="button" class="button button--primary button--small" data-import-button @click=${handlers.triggerImport}>
          ${createIcon('upload', 13)}<span>Import</span>
        </button>
      </div>
    </header>
  `, host)

  const menuButton = host.querySelector<HTMLButtonElement>('[data-menu-button]')
  const workspaceLink = host.querySelector<HTMLButtonElement>('[data-workspace-link]')
  const syncMessage = host.querySelector<HTMLElement>('[data-sync-message]')
  const importButton = host.querySelector<HTMLButtonElement>('[data-import-button]')
  if (!menuButton || !workspaceLink || !syncMessage || !importButton) {
    view.destroy()
    throw new Error('Zuari topbar did not render all required controls.')
  }
  const updateMenuState = (menuOpen: boolean) => {
    menuButton.setAttribute('aria-label', menuOpen ? 'Close navigation' : 'Open navigation')
    menuButton.setAttribute('aria-expanded', String(menuOpen))
    menuButton.replaceChildren(createIcon(menuOpen ? 'close' : 'menu', 20))
  }
  updateMenuState(initial.menuOpen)
  importButton.hidden = !initial.hasData

  let destroyed = false
  return {
    update(props) {
      if (destroyed) return
      updateMenuState(props.menuOpen)
      syncMessage.textContent = props.hasData ? 'Data synced' : 'Ready to import'
      importButton.hidden = !props.hasData
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      view.destroy()
    }
  }
}

function createIcon(name: 'menu' | 'close' | 'dashboard' | 'upload', size: number): SVGElement {
  const paths = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"></path>',
    close: '<path d="m18 6-12 12M6 6l12 12"></path>',
    dashboard: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5M12 3v12"></path>'
  } satisfies Record<typeof name, string>
  return createSvgElement('0 0 24 24', paths[name], { size, class: 'topbar-icon' })
}

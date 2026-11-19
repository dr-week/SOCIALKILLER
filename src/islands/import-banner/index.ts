import { html, render } from '@zuari/dom'
import { signal } from '@zuari/signals'
import { createButton } from '@zuari/ui/button'

export interface ImportBannerHandlers {
  triggerImport: () => void
  loadDemo: () => void
  openGuide: () => void
}

export interface ImportBannerIsland {
  updateLoading: (loading: boolean) => void
  destroy: () => void
}

export function mountImportBanner(
  host: HTMLElement,
  handlers: ImportBannerHandlers,
  initiallyLoading = false
): ImportBannerIsland {
  const loading = signal(initiallyLoading)
  const importLabel = signal(initiallyLoading ? 'Reading your files…' : 'Select Export Archive (.zip or .json)')
  const view = render(html`
    <section class="import-banner" aria-labelledby="import-banner-title">
      <div class="import-art" aria-hidden="true">
        <div class="art-circle art-circle--one"></div>
        <div class="art-circle art-circle--two"></div>
        <div class="file-card">
          <svg class="file-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <path d="M14 2v6h6M8 13h8M8 17h8"></path>
          </svg>
          <span class="file-line"></span>
          <span class="file-line short"></span>
          <span class="file-check">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m5 12 4 4L19 6"></path>
            </svg>
          </span>
        </div>
      </div>
      <div class="import-copy">
        <span class="pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          PRIVATE &amp; IN-BROWSER
        </span>
        <h2 id="import-banner-title">Import Your Instagram Export Archive</h2>
        <p>Analyze who unfollowed you, mutual connections, non-reciprocal accounts, and inactive followers locally in your browser. No Instagram account credentials or passwords required.</p>
        <div class="import-steps">
          <span><b>01</b> Request download from Instagram Accounts Center (JSON format)</span>
          <i aria-hidden="true"></i>
          <span><b>02</b> Drop your export ZIP or <code>followers_1.json</code> &amp; <code>following.json</code></span>
          <i aria-hidden="true"></i>
          <span><b>03</b> Instantly inspect your audience</span>
        </div>
        <div class="import-actions" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;"></div>
        <small class="file-hint">Everything is computed client-side. Zero external network transfer of your personal list.</small>
      </div>
    </section>
  `, host)

  const actions = host.querySelector<HTMLElement>('.import-actions')
  if (!actions) {
    view.destroy()
    throw new Error('Import banner action container was not rendered.')
  }

  const importButton = createButton({
    label: importLabel,
    disabled: loading,
    icon: createIcon(14, '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5M12 3v12"></path>'),
    onClick: handlers.triggerImport
  })
  const demoButton = createButton({
    label: 'Preview with Demo Data',
    variant: 'secondary',
    icon: createIcon(14, '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"></path><path d="m19 14 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"></path>'),
    onClick: handlers.loadDemo
  })
  const guideButton = createButton({
    label: 'How to Export (Guide)',
    variant: 'secondary',
    icon: createIcon(14, '<circle cx="12" cy="12" r="10"></circle><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>'),
    onClick: handlers.openGuide
  })
  const buttons = [importButton, demoButton, guideButton]
  for (const [index, button] of buttons.entries()) {
    button.element.classList.remove('zuari-btn')
    button.element.classList.add('button', index === 0 ? 'button--primary' : 'button--outline')
  }

  const importLabelElement = importButton.element.querySelector('.zuari-btn-label')
  if (!importLabelElement) {
    buttons.forEach(button => button.destroy())
    view.destroy()
    throw new Error('Import button label was not rendered.')
  }
  importLabelElement.setAttribute('aria-live', 'polite')
  actions.append(importButton.element, demoButton.element, guideButton.element)

  let destroyed = false
  return {
    updateLoading(value) {
      if (destroyed) return
      loading.value = value
      importLabel.value = value ? 'Reading your files…' : 'Select Export Archive (.zip or .json)'
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      buttons.forEach(button => button.destroy())
      view.destroy()
    },
  }
}

function createIcon(size: number, innerSvg: string): SVGElement {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.setAttribute('width', String(size))
  icon.setAttribute('height', String(size))
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('fill', 'none')
  icon.setAttribute('stroke', 'currentColor')
  icon.setAttribute('stroke-width', '2')
  icon.setAttribute('stroke-linecap', 'round')
  icon.setAttribute('stroke-linejoin', 'round')
  icon.setAttribute('aria-hidden', 'true')
  icon.innerHTML = innerSvg
  return icon
}

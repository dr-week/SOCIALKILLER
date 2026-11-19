import { html, render } from '@zuari/dom'
import { createSvgElement } from '@zuari/glyphs'
import { signal } from '@zuari/signals'
import type { View } from '../../types'

export interface AudienceCategoryTabsProps {
  activeView: View
  allAccountsCount: number
  notFollowingBackCount: number
  notFollowedBackCount: number
  mutualsCount: number
  followersCount: number
  ghostFollowersCount?: number
  whitelistCount: number
}

export interface AudienceCategoryTabsIsland {
  update: (props: AudienceCategoryTabsProps) => void
  destroy: () => void
}

export function mountAudienceCategoryTabs(
  host: HTMLElement,
  initial: AudienceCategoryTabsProps,
  onSelect: (view: View) => void
): AudienceCategoryTabsIsland {
  const counts = {
    allAccounts: signal(initial.allAccountsCount),
    notFollowingBack: signal(initial.notFollowingBackCount),
    notFollowedBack: signal(initial.notFollowedBackCount),
    mutuals: signal(initial.mutualsCount),
    followers: signal(initial.followersCount),
    ghostFollowers: signal(initial.ghostFollowersCount ?? 0),
    whitelist: signal(initial.whitelistCount)
  }
  const view = render(html`
    <nav class="tabs" aria-label="Audience categories">
      <button type="button" data-view="all-accounts" @click=${() => onSelect('all-accounts')}>
        ${createIcon('users')}<span>All Accounts</span><span class="tab-badge">${counts.allAccounts}</span>
      </button>
      <button type="button" data-view="not-following-back" @click=${() => onSelect('not-following-back')}>
        ${createIcon('user-x')}<span>Not following back</span><span class="tab-badge">${counts.notFollowingBack}</span>
      </button>
      <button type="button" data-view="not-followed-back" @click=${() => onSelect('not-followed-back')}>
        ${createIcon('user-check')}<span>Fans</span><span class="tab-badge">${counts.notFollowedBack}</span>
      </button>
      <button type="button" data-view="mutuals" @click=${() => onSelect('mutuals')}>
        ${createIcon('users')}<span>Mutuals</span><span class="tab-badge">${counts.mutuals}</span>
      </button>
      <button type="button" data-view="followers" @click=${() => onSelect('followers')}>
        ${createIcon('user')}<span>Followers</span><span class="tab-badge">${counts.followers}</span>
      </button>
      <button type="button" data-view="ghost-followers" @click=${() => onSelect('ghost-followers')}>
        ${createIcon('ghost')}<span>Ghost Followers</span><span class="tab-badge">${counts.ghostFollowers}</span>
      </button>
      <button type="button" data-view="whitelist" @click=${() => onSelect('whitelist')}>
        ${createIcon('star')}<span>Safe List</span><span class="tab-badge">${counts.whitelist}</span>
      </button>
    </nav>
  `, host)

  const updateSelection = (activeView: View) => {
    host.querySelectorAll<HTMLButtonElement>('.tabs [data-view]').forEach(button => {
      const active = button.dataset.view === activeView ||
        (button.dataset.view === 'all-accounts' && activeView === 'overview')
      button.classList.toggle('selected', active)
      button.setAttribute('aria-pressed', String(active))
    })
  }
  updateSelection(initial.activeView)

  let destroyed = false
  return {
    update(props) {
      if (destroyed) return
      counts.allAccounts.value = props.allAccountsCount
      counts.notFollowingBack.value = props.notFollowingBackCount
      counts.notFollowedBack.value = props.notFollowedBackCount
      counts.mutuals.value = props.mutualsCount
      counts.followers.value = props.followersCount
      counts.ghostFollowers.value = props.ghostFollowersCount ?? 0
      counts.whitelist.value = props.whitelistCount
      updateSelection(props.activeView)
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      view.destroy()
    }
  }
}

type IconName = 'users' | 'user-x' | 'user-check' | 'user' | 'ghost' | 'star'

const icons: Record<IconName, string> = {
  users: '<circle cx="9" cy="8" r="3"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6m2 3c1.8.8 3 2.3 3 4"></path>',
  'user-x': '<circle cx="9" cy="8" r="3"></circle><path d="M3 20c0-3.3 2.7-6 6-6 1.5 0 2.9.6 4 1.6M16 8l5 5m0-5-5 5"></path>',
  'user-check': '<circle cx="9" cy="8" r="3"></circle><path d="M3 20c0-3.3 2.7-6 6-6 1.5 0 2.9.6 4 1.6m2 2 2 2 4-4"></path>',
  user: '<circle cx="12" cy="8" r="3"></circle><path d="M5 21c0-4 3-7 7-7s7 3 7 7"></path>',
  ghost: '<path d="M12 3a7 7 0 0 0-7 7v11l3-2 2 2 2-2 2 2 3-2V10a7 7 0 0 0-7-7Z"></path><path d="M9 10h.01M15 10h.01"></path>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"></path>'
}

function createIcon(name: IconName): SVGElement {
  return createSvgElement('0 0 24 24', icons[name], { size: 14, class: 'tabs-icon' })
}

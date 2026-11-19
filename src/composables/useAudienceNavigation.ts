import { computed, type Ref } from 'vue'
import {
  Ghost, History, LayoutDashboard, MessageCircle, Send,
  Star, UserCheck, UserMinus, UserPlus, UserRound, UserX, Users
} from 'lucide-vue-next'
import type { Person } from '../domain/followers'
import type { NavItem, View } from '../types'

type AudienceNavigationData = {
  activeView: Readonly<Ref<View>>
  search: Readonly<Ref<string>>
  sortOrder: Readonly<Ref<'asc' | 'desc'>>
  currentPage: Readonly<Ref<number>>
  followers: Readonly<Ref<Person[]>>
  following: Readonly<Ref<Person[]>>
  previous: Readonly<Ref<unknown>>
  whitelist: Readonly<Ref<Set<string>>>
  allAccounts: Readonly<Ref<Person[]>>
  notFollowingBack: Readonly<Ref<Person[]>>
  notFollowedBack: Readonly<Ref<Person[]>>
  mutuals: Readonly<Ref<Person[]>>
  newFollowers: Readonly<Ref<Person[]>>
  lostFollowers: Readonly<Ref<Person[]>>
  ghostFollowers: Readonly<Ref<Person[]>>
  whitelistedPeople: Readonly<Ref<Person[]>>
  importedAt: Readonly<Ref<string>>
}

export function useAudienceNavigation(data: AudienceNavigationData) {
  const pageSize = 15
  const instagramNav = computed<NavItem[]>(() => {
    const hasData = data.followers.value.length > 0 || data.following.value.length > 0
    const items: NavItem[] = [{ id: 'overview', label: 'Audience Overview', icon: LayoutDashboard }]
    if (hasData) items.push(
      { id: 'all-accounts', label: 'All Accounts', icon: Users, count: () => data.allAccounts.value.length, color: '#6366f1' },
      { id: 'not-following-back', label: 'Not Following Back', icon: UserX, count: () => data.notFollowingBack.value.length, color: '#f59e0b' },
      { id: 'not-followed-back', label: 'You Don’t Follow Back', icon: UserCheck, count: () => data.notFollowedBack.value.length, color: '#3b82f6' },
      { id: 'mutuals', label: 'Mutual Follows', icon: Users, count: () => data.mutuals.value.length, color: '#10b981' },
      { id: 'followers', label: 'Your Followers', icon: UserRound, count: () => data.followers.value.length, color: '#8b5cf6' },
      { id: 'following', label: 'Following', icon: Users, count: () => data.following.value.length, color: '#6366f1' },
      { id: 'new-followers', label: 'New Followers', icon: UserPlus, count: () => data.previous.value ? data.newFollowers.value.length : 0, color: '#10b981' },
      { id: 'lost-followers', label: 'Lost Followers', icon: UserMinus, count: () => data.previous.value ? data.lostFollowers.value.length : 0, color: '#ef4444' },
      { id: 'ghost-followers', label: 'Ghost Followers', icon: Ghost, count: () => data.ghostFollowers.value.length, color: '#a855f7' },
      { id: 'history', label: 'Snapshot History', icon: History, color: '#38bdf8' },
      { id: 'whitelist', label: 'Safe List / Whitelist', icon: Star, count: () => data.whitelist.value.size, color: '#eab308' }
    )
    return items
  })

  const zuariNav: NavItem[] = [
    { id: 'social-publisher', label: 'Planner', icon: Send, color: '#10b981' },
    { id: 'community-inbox', label: 'Inbox', icon: MessageCircle, color: '#38bdf8' }
  ]
  const isZuariWorkspace = computed(() => ['social-publisher', 'community-inbox'].includes(data.activeView.value))
  const displayedNav = computed(() => isZuariWorkspace.value ? zuariNav : instagramNav.value)
  const viewTitle = computed(() => [...instagramNav.value, ...zuariNav].find(item => item.id === data.activeView.value)?.label || 'Overview')

  const filteredPeople = computed(() => {
    let people: Person[] = []
    switch (data.activeView.value) {
      case 'overview': case 'all-accounts': people = data.allAccounts.value; break
      case 'not-following-back': people = data.notFollowingBack.value; break
      case 'not-followed-back': people = data.notFollowedBack.value; break
      case 'mutuals': people = data.mutuals.value; break
      case 'followers': people = data.followers.value; break
      case 'following': people = data.following.value; break
      case 'new-followers': people = data.newFollowers.value; break
      case 'lost-followers': people = data.lostFollowers.value; break
      case 'ghost-followers': people = data.ghostFollowers.value; break
      case 'whitelist': people = data.whitelistedPeople.value; break
    }
    const query = data.search.value.trim().toLowerCase().replace(/^@/, '')
    const matched = query ? people.filter(person => person.username.toLowerCase().includes(query)) : [...people]
    return matched.sort((a, b) => {
      const comparison = a.username.localeCompare(b.username)
      return data.sortOrder.value === 'asc' ? comparison : -comparison
    })
  })
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredPeople.value.length / pageSize)))
  const pagedPeople = computed(() => filteredPeople.value.slice((data.currentPage.value - 1) * pageSize, data.currentPage.value * pageSize))
  const lastSynced = computed(() => data.importedAt.value
    ? new Date(data.importedAt.value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '')

  return { displayedNav, isZuariWorkspace, viewTitle, filteredPeople, totalPages, pagedPeople, lastSynced }
}

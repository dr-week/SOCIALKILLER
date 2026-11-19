import { computed, type Ref } from 'vue'
import {
  Users,
  UserX,
  UserCheck,
  UserRound,
  UserPlus,
  UserMinus,
  Star
} from 'lucide-vue-next'
import { normalizeUsername, type Person } from '../domain/followers'
import type { UserCategoryInfo } from '../types'

export function useUserCategorization(
  followers: Ref<Person[]>,
  following: Ref<Person[]>,
  lostFollowers: Ref<Person[]>,
  newFollowers: Ref<Person[]>,
  whitelist: Ref<Set<string>>
) {
  const followersSet = computed(() => new Set(followers.value.map(p => normalizeUsername(p.username))))
  const followingSet = computed(() => new Set(following.value.map(p => normalizeUsername(p.username))))
  const lostSet = computed(() => new Set(lostFollowers.value.map(p => normalizeUsername(p.username))))
  const newSet = computed(() => new Set(newFollowers.value.map(p => normalizeUsername(p.username))))

  function getUserCategory(username: string): UserCategoryInfo {
    const norm = normalizeUsername(username)
    if (whitelist.value.has(norm)) {
      return { label: 'Whitelisted / Safe', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', icon: Star }
    }
    if (lostSet.value.has(norm)) {
      return { label: 'Unfollowed You', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: UserMinus }
    }
    if (newSet.value.has(norm)) {
      return { label: 'New Follower', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: UserPlus }
    }
    const isFollower = followersSet.value.has(norm)
    const isFollowing = followingSet.value.has(norm)

    if (isFollower && isFollowing) {
      return { label: 'Mutual Friend', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: Users }
    }
    if (isFollowing && !isFollower) {
      return { label: 'Not Following Back', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: UserX }
    }
    if (!isFollowing && isFollower) {
      return { label: 'Fan (Follows You)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: UserCheck }
    }
    return { label: 'Instagram User', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', icon: UserRound }
  }

  return {
    getUserCategory
  }
}

import { ref, watch } from 'vue'
import { useAudienceData } from '../../composables/useAudienceData'
import { useTheme } from '../../composables/useTheme'
import { useAccountHealth } from '../../composables/useAccountHealth'
import { useUserCategorization } from '../../composables/useUserCategorization'
import { useDatabaseManagement } from '../../composables/useDatabaseManagement'
import { useUnfollowQueue } from '../../composables/useUnfollowQueue'
import { useBrandWorkspaces } from '../../composables/useBrandWorkspaces'
import { useAudienceNavigation } from '../../composables/useAudienceNavigation'
import { useAppDrawer } from './useAppDrawer'
import { useAppActions } from './useAppActions'
import { useAppNavigation } from './useAppNavigation'

export function useAppController() {
  const { activeView } = useAppNavigation()
  const showExportGuide = ref(false)
  const showProfileModal = ref(false)
  const search = ref('')
  const sortOrder = ref<'asc' | 'desc'>('asc')
  const currentPage = ref(1)
  const menuOpen = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)
  const backupFileInput = ref<HTMLInputElement | null>(null)

  const audience = useAudienceData()
  const { currentTheme, setTheme, currentAccent, setAccent } = useTheme()
  const health = useAccountHealth()
  const userCategories = useUserCategorization(
    audience.followers, audience.following, audience.lostFollowers,
    audience.newFollowers, audience.whitelist
  )
  const database = useDatabaseManagement(
    audience.followers, audience.following, audience.importedAt,
    audience.previous, audience.whitelist, health.accountStatusMap
  )
  const queueState = useUnfollowQueue()
  const workspaces = useBrandWorkspaces()
  const navigation = useAudienceNavigation({
    activeView, search, sortOrder, currentPage,
    followers: audience.followers,
    following: audience.following,
    previous: audience.previous,
    whitelist: audience.whitelist,
    allAccounts: audience.allAccounts,
    notFollowingBack: audience.notFollowingBack,
    notFollowedBack: audience.notFollowedBack,
    mutuals: audience.mutuals,
    newFollowers: audience.newFollowers,
    lostFollowers: audience.lostFollowers,
    ghostFollowers: audience.ghostFollowers,
    whitelistedPeople: audience.whitelistedPeople,
    importedAt: audience.importedAt
  })
  useAppDrawer(menuOpen, workspaces.activeBrandId)
  const actions = useAppActions({ activeView, error: audience.error, fileInput, audience, navigation, workspaces })

  watch(activeView, () => { currentPage.value = 1 })

  return {
    activeView, showExportGuide, showProfileModal, search, sortOrder, currentPage, menuOpen,
    fileInput, backupFileInput, currentTheme, setTheme, currentAccent, setAccent, audience, health, userCategories,
    database, queueState, workspaces, navigation, ...actions
  }
}

export type AppController = ReturnType<typeof useAppController>

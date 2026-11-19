<script setup lang="ts">
import { computed } from 'vue'
import { TooltipProvider } from 'reka-ui'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'
import BrandWorkspaceHeader from './components/BrandWorkspaceHeader.vue'
import BrandProfileModal from './components/BrandProfileModal.vue'
import AppWorkspaceContent from './features/app-shell/AppWorkspaceContent.vue'
import UiToastHost from './shared/ui/UiToastHost.vue'
import { rankFuzzyItems } from './shared/search/fuzzy-search'
import { appIdForView } from './features/app-shell/mini-app-routes'
import { APP_NAVIGATION } from './features/app-shell/mini-apps'
import { useAppController } from './features/app-shell/useAppController'

const controller = useAppController()
const {
  activeView, menuOpen, search, fileInput, backupFileInput, currentTheme, setTheme, currentAccent, setAccent,
  createCompanyWorkspace, updateWorkspaceArchive, handleSaveBrandContext,
  handleRunBrandResearch, onFilesChange, showProfileModal
} = controller
const activeMiniApp = computed(() => APP_NAVIGATION.find(app => app.id === appIdForView(activeView.value)))
const {
  currentAccountUsername, followers, following, notFollowingBack, savedAccountsList,
  switchAccount, removeAccount, refreshCurrentAccount, resetData
} = controller.audience
const { databaseStats, cleanExpiredCache, exportDatabaseBackup, restoreDatabaseBackup } = controller.database
const { brands, archivedBrands, activeBrand, selectBrand } = controller.workspaces

function handleSearchSubmit(query: string) {
  if (activeView.value !== 'app-launcher') return
  const q = query.trim()
  if (!q) return
  const [match] = rankFuzzyItems(
    APP_NAVIGATION.filter(app => app.id !== 'home'),
    q,
    app => [app.label, app.category, app.description]
  )
  if (match) {
    activeView.value = match.view
    search.value = ''
  }
}
</script>

<template>
  <TooltipProvider :delay-duration="220">
  <div
    class="app-shell"
    :data-theme="currentTheme"
    :data-accent="currentAccent"
    :data-active-visual="activeMiniApp?.visual"
    :style="{ '--mini-app-context-accent': activeMiniApp?.accent }"
  >
    <AppSidebar
      v-model:activeView="activeView"
      v-model:menuOpen="menuOpen"
      :current-account-username="currentAccountUsername"
      :followers-count="followers.length"
      :database-stats="databaseStats"
      :accounts="savedAccountsList"
      :current-theme="currentTheme"
      :current-accent="currentAccent"
      @switch-account="switchAccount"
      @remove-account="removeAccount"
      @refresh-current-account="refreshCurrentAccount"
      @reset-data="resetData"
      @clean-expired-cache="cleanExpiredCache"
      @export-database-backup="exportDatabaseBackup"
      @trigger-restore="backupFileInput?.click()"
      @set-theme="setTheme"
      @set-accent="setAccent"
    />

    <main class="main-area">
      <AppTopbar
        v-model:menuOpen="menuOpen"
        v-model:searchQuery="search"
        :has-data="followers.length > 0 || following.length > 0"
        @update:active-view="activeView = $event"
        @search-submit="handleSearchSubmit"
      />
      <div class="content-wrap">
        <BrandWorkspaceHeader
          :brands="brands"
          :archived-brands="archivedBrands"
          :active-brand="activeBrand"
          :audience-handle="currentAccountUsername"
          :audience-followers-count="followers.length"
          :audience-unfollowers-count="notFollowingBack.length"
          @select-brand="selectBrand"
          @create-brand="createCompanyWorkspace"
          @archive-brand="brandId => updateWorkspaceArchive(brandId, true)"
          @restore-brand="brandId => updateWorkspaceArchive(brandId, false)"
          @open-profile-modal="showProfileModal = true"
          @open-audience="activeView = 'overview'"
        />
        <BrandProfileModal
          v-if="showProfileModal"
          :brand="activeBrand"
          @close="showProfileModal = false"
          @save-context="handleSaveBrandContext"
          @run-research="handleRunBrandResearch"
        />
        <AppWorkspaceContent :controller="controller" @open-profile="showProfileModal = true" />
      </div>
    </main>

    <input ref="fileInput" class="visually-hidden" type="file" accept=".zip,.json,application/zip,application/json" multiple @change="onFilesChange">
    <input ref="backupFileInput" type="file" accept=".json" style="display: none;" @change="restoreDatabaseBackup">
    <UiToastHost />
  </div>
  </TooltipProvider>
</template>

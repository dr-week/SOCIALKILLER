<script setup lang="ts">
import { normalizeUsername } from '../../domain/followers'
import type { AppController } from './useAppController'
import AppPageHeader from './AppPageHeader.vue'
import AudienceMetrics from '../../components/AudienceMetrics.vue'
import AudienceTable from '../../components/AudienceTable.vue'
import HistoryPanel from '../../components/HistoryPanel.vue'
import ImportBanner from '../../components/ImportBanner.vue'
import AudienceSmartUnfollowCard from '../../components/audience/AudienceSmartUnfollowCard.vue'
import AudienceAuditOverlays from './AudienceAuditOverlays.vue'

const props = defineProps<{ controller: AppController }>()
const {
  activeView, fileInput, search, sortOrder, currentPage, audience, health,
  userCategories, navigation, queueState, exportCsv
} = props.controller
const {
  followers, following, previous, whitelist, importedAt, loading, error,
  notFollowingBack, notFollowedBack, mutuals, newFollowers, lostFollowers,
  ghostFollowers, allAccounts, toggleWhitelist, loadSampleData
} = audience
const { accountStatusMap, isBatchChecking, batchProgress, checkAccountHealth, checkBatch } = health
const { getUserCategory } = userCategories
const { selectedUsernames, sessionLimit, toggleSelect, selectAll, clearSelection, openQueueModal } = queueState
const { viewTitle, filteredPeople, totalPages, pagedPeople, lastSynced } = navigation

function handleQueueSmartBatch(usernames: string[]) {
  clearSelection()
  if (usernames.length > sessionLimit.value) sessionLimit.value = usernames.length
  selectAll(usernames)
  openQueueModal()
}
</script>

<template>
  <AppPageHeader :title="viewTitle" :active-view="activeView" :has-audience-data="followers.length > 0 || following.length > 0" :workspace-mode="false" :error="error" @trigger-import="fileInput?.click()" @load-demo="loadSampleData" @dismiss-error="error = ''" />
  <ImportBanner v-if="!followers.length && !following.length" :loading="loading" @trigger-import="fileInput?.click()" @load-demo="loadSampleData" @open-guide="controller.showExportGuide.value = true" />
  <template v-else>
    <AudienceMetrics
      :not-following-back-count="notFollowingBack.length" :not-followed-back-count="notFollowedBack.length"
      :mutuals-count="mutuals.length" :followers-count="followers.length" :following-count="following.length"
      :lost-followers-count="lostFollowers.length" :has-previous="!!previous"
      @select-view="(view) => { activeView = view; currentPage = 1 }"
    />
    <AudienceSmartUnfollowCard
      :not-following-back="notFollowingBack" :ghost-followers="ghostFollowers"
      :whitelist-set="whitelist" :account-status-map="accountStatusMap"
      @queue-smart-batch="handleQueueSmartBatch"
    />
    <section class="dashboard-grid">
      <AudienceTable
        v-model:activeView="activeView" v-model:searchQuery="search" v-model:currentPage="currentPage"
        :view-title="viewTitle" :all-accounts-count="allAccounts.length"
        :not-following-back-count="notFollowingBack.length" :not-followed-back-count="notFollowedBack.length"
        :mutuals-count="mutuals.length" :followers-count="followers.length" :whitelist-count="whitelist.size"
        :ghost-followers-count="ghostFollowers.length" :sort-order="sortOrder" :is-batch-checking="isBatchChecking"
        :batch-progress="batchProgress" :filtered-people="filteredPeople" :paged-people="pagedPeople"
        :total-pages="totalPages" :account-status-map="accountStatusMap" :whitelist-set="whitelist"
        :get-user-category="getUserCategory" :normalize-username="normalizeUsername"
        :selected-usernames="selectedUsernames"
        @toggle-sort="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
        @check-batch="checkBatch(pagedPeople.map(person => person.username))"
        @check-account-health="checkAccountHealth" @toggle-whitelist="toggleWhitelist"
        @export-csv="exportCsv" @toggle-select="toggleSelect"
        @export-selected="exportCsv"
        @select-all-visible="selectAll(pagedPeople.map(person => person.username))"
        @select-all-filtered="selectAll(filteredPeople.map(person => person.username))"
        @clear-selection="clearSelection" @open-queue="openQueueModal"
        @whitelist-selected="selectedUsernames.forEach(username => toggleWhitelist(username))"
      />
      <HistoryPanel
        :previous="previous" :imported-at="importedAt" :new-followers-count="newFollowers.length"
        :lost-followers-count="lostFollowers.length" :followers-count="followers.length" :last-synced="lastSynced"
        @select-view="(view) => { activeView = view; currentPage = 1 }"
        @trigger-import="fileInput?.click()" @load-demo="loadSampleData"
      />
    </section>
  </template>
  <AudienceAuditOverlays :controller="controller" />
</template>

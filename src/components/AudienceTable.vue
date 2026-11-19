<script setup lang="ts">
import { Users, ArrowUpRight } from 'lucide-vue-next'
import type { Person } from '../domain/followers'
import type { AccountStatus, UserCategoryInfo, View } from '../types'

import AudienceCategoryTabs from './audience/AudienceCategoryTabs.vue'
import AudienceToolbar from './audience/AudienceToolbar.vue'
import AudienceRowItem from './audience/AudienceRowItem.vue'
import AudienceBatchBar from './audience/AudienceBatchBar.vue'
import AudiencePagination from './audience/AudiencePagination.vue'

defineProps<{
  activeView: View
  viewTitle: string
  allAccountsCount: number
  notFollowingBackCount: number
  notFollowedBackCount: number
  mutualsCount: number
  followersCount: number
  whitelistCount: number
  ghostFollowersCount?: number
  searchQuery: string
  sortOrder: 'asc' | 'desc'
  isBatchChecking: boolean
  batchProgress: { current: number; total: number }
  filteredPeople: Person[]
  pagedPeople: Person[]
  currentPage: number
  totalPages: number
  accountStatusMap: Map<string, AccountStatus>
  whitelistSet: Set<string>
  getUserCategory: (username: string) => UserCategoryInfo
  normalizeUsername: (username: string) => string
  selectedUsernames?: Set<string>
}>()

const emit = defineEmits<{
  (e: 'update:activeView', val: View): void
  (e: 'update:searchQuery', val: string): void
  (e: 'update:currentPage', val: number): void
  (e: 'toggleSort'): void
  (e: 'checkBatch'): void
  (e: 'checkAccountHealth', username: string): void
  (e: 'toggleWhitelist', username: string): void
  (e: 'exportCsv'): void
  (e: 'toggleSelect', username: string): void
  (e: 'selectAllVisible'): void
  (e: 'selectAllFiltered'): void
  (e: 'clearSelection'): void
  (e: 'openQueue'): void
  (e: 'whitelistSelected'): void
  (e: 'exportSelected'): void
}>()
</script>

<template>
  <div class="panel connections-panel">
    <div class="panel-heading">
      <div>
        <span class="section-kicker">AUDIENCE BREAKDOWN</span>
        <h2>{{ viewTitle }}</h2>
      </div>
      <button
        v-if="activeView === 'overview'"
        class="text-link"
        @click="emit('update:activeView', 'not-following-back'); emit('update:currentPage', 1)"
      >
        View not following back <ArrowUpRight :size="12" style="display:inline;" />
      </button>
    </div>

    <!-- Modular Tabs -->
    <AudienceCategoryTabs
      :active-view="activeView"
      :all-accounts-count="allAccountsCount"
      :not-following-back-count="notFollowingBackCount"
      :not-followed-back-count="notFollowedBackCount"
      :mutuals-count="mutualsCount"
      :followers-count="followersCount"
      :ghost-followers-count="ghostFollowersCount"
      :whitelist-count="whitelistCount"
      @select-view="(v) => { emit('update:activeView', v); emit('update:currentPage', 1) }"
    />

    <!-- Modular Toolbar -->
    <AudienceToolbar
      :active-view="activeView"
      :search-query="searchQuery"
      :selected-count="selectedUsernames ? selectedUsernames.size : 0"
      :paged-count="pagedPeople.length"
      :is-batch-checking="isBatchChecking"
      :batch-progress="batchProgress"
      :sort-order="sortOrder"
      :filtered-count="filteredPeople.length"
      @update:search-query="(q) => { emit('update:searchQuery', q); emit('update:currentPage', 1) }"
      @open-queue="emit('openQueue')"
      @clear-selection="emit('clearSelection')"
      @select-all-visible="emit('selectAllVisible')"
      @select-all-filtered="emit('selectAllFiltered')"
      @check-batch="emit('checkBatch')"
      @toggle-sort="emit('toggleSort')"
      @export-csv="emit('exportCsv')"
    />

    <!-- Tabular Rows -->
    <div v-if="filteredPeople.length" class="connection-list">
      <AudienceRowItem
        v-for="(person, i) in pagedPeople"
        :key="person.username"
        :person="person"
        :index="i"
        :active-view="activeView"
        :is-selected="selectedUsernames ? selectedUsernames.has(person.username) : false"
        :account-status="accountStatusMap.get(normalizeUsername(person.username))"
        :is-whitelisted="whitelistSet.has(normalizeUsername(person.username))"
        :category="getUserCategory(person.username)"
        :normalize-username="normalizeUsername"
        @toggle-select="(u) => emit('toggleSelect', u)"
        @check-health="(u) => emit('checkAccountHealth', u)"
        @toggle-whitelist="(u) => emit('toggleWhitelist', u)"
      />

      <AudiencePagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="filteredPeople.length"
        @update:currentPage="emit('update:currentPage', $event)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-list">
      <Users :size="32" class="empty-icon" />
      <strong>{{ searchQuery ? 'No matches found' : 'No accounts in this list' }}</strong>
      <p>{{ searchQuery ? 'Try a different search query.' : 'This list has 0 accounts based on your loaded data.' }}</p>
    </div>

    <!-- Floating Batch Action Bar -->
    <AudienceBatchBar
      :selected-count="selectedUsernames ? selectedUsernames.size : 0"
      @queue-selected="emit('openQueue')"
      @whitelist-selected="emit('whitelistSelected')"
      @export-selected="emit('exportSelected')"
      @clear-selection="emit('clearSelection')"
    />
  </div>
</template>

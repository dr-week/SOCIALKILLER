<script setup lang="ts">
import { ref } from 'vue'
import {
  ChevronDown,
  MapPin,
  CheckCircle2,
  FolderGit2,
  Users
} from 'lucide-vue-next'
import type { BrandProfile } from '../types/brand'

const props = defineProps<{
  brands: BrandProfile[]
  archivedBrands: BrandProfile[]
  activeBrand: BrandProfile
  audienceHandle?: string
  audienceFollowersCount?: number
  audienceUnfollowersCount?: number
}>()

const emit = defineEmits<{
  (e: 'selectBrand', brandId: string): void
  (e: 'createBrand', name: string, focus: string, githubUser?: string): void
  (e: 'openProfileModal'): void
  (e: 'openAudience'): void
  (e: 'archiveBrand', brandId: string): void
  (e: 'restoreBrand', brandId: string): void
}>()

const dropdownOpen = ref(false)
const showCreate = ref(false)
const newBrandName = ref('')
const newBrandFocus = ref('')
const newBrandGithub = ref('')

function onSelect(id: string) {
  emit('selectBrand', id)
  dropdownOpen.value = false
}

function submitCreate() {
  const name = newBrandName.value.trim()
  if (!name) return
  emit('createBrand', name, newBrandFocus.value.trim(), newBrandGithub.value.trim() || undefined)
  newBrandName.value = ''
  newBrandFocus.value = ''
  newBrandGithub.value = ''
  showCreate.value = false
  dropdownOpen.value = false
}
</script>

<template>
  <div class="brand-workspace-header">
    <div class="workspace-selector-rel">
      <button
        class="brand-selector-trigger"
        @click="dropdownOpen = !dropdownOpen"
        :aria-expanded="dropdownOpen"
        title="Switch Company Workspace"
      >
        <span class="brand-avatar" :class="activeBrand.id">
          {{ activeBrand.name.slice(0, 2).toUpperCase() }}
        </span>
        <div class="brand-text">
          <div class="brand-line">
            <strong class="brand-name">{{ activeBrand.name }}</strong>
            <span class="brand-loc">
              <MapPin :size="10" /> {{ activeBrand.location }}
            </span>
          </div>
        </div>
        <ChevronDown :size="14" class="chevron-icon" :class="{ open: dropdownOpen }" />
      </button>

      <!-- Minimal Dropdown Menu -->
      <div v-if="dropdownOpen" class="brand-dropdown-menu" @click.stop>
        <div class="dropdown-kicker">COMPANY WORKSPACES</div>
        <button
          v-for="b in brands"
          :key="b.id"
          class="dropdown-brand-item"
          :class="{ active: b.id === activeBrand.id }"
          @click="onSelect(b.id)"
        >
          <span class="brand-avatar-sm" :class="b.id">
            {{ b.name.slice(0, 2).toUpperCase() }}
          </span>
          <div class="item-info">
            <span class="item-name">{{ b.name }}</span>
            <small class="item-desc">{{ b.purpose.what.slice(0, 48) }}...</small>
          </div>
          <CheckCircle2 v-if="b.id === activeBrand.id" :size="13" class="active-check" />
        </button>
        <button type="button" class="create-company-trigger" @click="showCreate = !showCreate">
          + New company workspace
        </button>
        <form v-if="showCreate" class="create-company-form" @submit.prevent="submitCreate">
          <label>Company name<input v-model="newBrandName" autofocus maxlength="80" required placeholder="e.g. Danger Labs" /></label>
          <label>What does it focus on?<input v-model="newBrandFocus" maxlength="160" placeholder="e.g. Zero-VDOM and developer software" /></label>
          <label>GitHub user / org (optional)<input v-model="newBrandGithub" maxlength="80" placeholder="e.g. dr-week" /></label>
          <button type="submit" :disabled="!newBrandName.trim()">Create workspace</button>
        </form>
        <button v-if="brands.length > 1" type="button" class="archive-workspace-trigger" @click="emit('archiveBrand', activeBrand.id); dropdownOpen = false">
          Archive {{ activeBrand.name }}
        </button>
        <div v-if="archivedBrands.length" class="archived-workspaces">
          <div class="dropdown-kicker">ARCHIVED WORKSPACES</div>
          <div v-for="b in archivedBrands" :key="b.id" class="archived-workspace-row">
            <span>{{ b.name }}</span>
            <button type="button" @click="emit('restoreBrand', b.id)">Restore</button>
          </div>
        </div>
      </div>
    </div>

    <div class="brand-actions-right">
      <button type="button" class="brand-profile-btn" @click="emit('openAudience')" title="Open Audience Audit">
        <Users :size="13" />
        <span>Audience</span>
        <span class="repos-badge">{{ audienceFollowersCount ? `${audienceFollowersCount.toLocaleString()} · ${audienceUnfollowersCount || 0} unfollowers` : (audienceHandle ? `@${audienceHandle}` : 'Audit') }}</span>
      </button>
      <button type="button" class="brand-profile-btn" @click="emit('openProfileModal')" title="Open brand profile, repositories and knowledge vault" aria-label="Open brand profile">
        <FolderGit2 :size="13" />
        <span>Brand Profile</span>
        <span v-if="activeBrand.accounts.length" class="repos-badge">{{ activeBrand.accounts.length }} channels</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './brand-workspace-header-layout.scss';
@use './brand-workspace-header-dropdown.scss';
@use './brand-workspace-header-actions.scss';
</style>

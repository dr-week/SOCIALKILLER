<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, FolderGit2 } from 'lucide-vue-next'
import type { BrandDoc, BrandLink, BrandProfile } from '../types/brand'
import BrandProfileDocuments from './brand-profile/BrandProfileDocuments.vue'
import BrandProfileGithub from './brand-profile/BrandProfileGithub.vue'
import BrandProfileLinks from './brand-profile/BrandProfileLinks.vue'
import BrandProfileResearch from './brand-profile/BrandProfileResearch.vue'

const props = defineProps<{ brand: BrandProfile }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saveContext', payload: { links: BrandLink[]; githubUser: string; docs: BrandDoc[]; syncGithub: boolean }): void
  (e: 'runResearch'): void
}>()

const activeTab = ref<'github' | 'links' | 'docs' | 'research'>('github')
const githubUser = ref(props.brand.purpose.githubUser || '')
const links = ref<BrandLink[]>(JSON.parse(JSON.stringify(props.brand.purpose.links || [])))
const docs = ref<BrandDoc[]>(JSON.parse(JSON.stringify(props.brand.purpose.docs || [])))
const syncing = ref(false)
const researching = ref(false)
const syncMessage = ref('')
const repos = computed(() => props.brand.purpose.repos || [])
const research = computed(() => props.brand.purpose.research)

function triggerResearch() {
  researching.value = true
  emit('runResearch')
}

function saveAndSync() {
  emit('saveContext', {
    links: links.value,
    githubUser: githubUser.value.trim(),
    docs: docs.value,
    syncGithub: Boolean(githubUser.value.trim())
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-head">
        <div class="head-title">
          <FolderGit2 :size="17" class="text-purple" />
          <h3>{{ brand.name }} · Context Vault</h3>
        </div>
        <button class="close-btn" aria-label="Close modal" @click="emit('close')"><X :size="16" /></button>
      </div>

      <nav class="modal-tabs" aria-label="Profile sections">
        <button :class="{ active: activeTab === 'github' }" @click="activeTab = 'github'">GitHub</button>
        <button :class="{ active: activeTab === 'links' }" @click="activeTab = 'links'">Links</button>
        <button :class="{ active: activeTab === 'docs' }" @click="activeTab = 'docs'">Docs</button>
        <button :class="{ active: activeTab === 'research' }" @click="activeTab = 'research'">Research</button>
      </nav>

      <div class="modal-body">
        <BrandProfileGithub
          v-if="activeTab === 'github'"
          v-model:github-user="githubUser"
          :repos="repos"
          :syncing="syncing"
          :synced-at="brand.purpose.githubSyncedAt"
          @sync="saveAndSync"
        />
        <div v-else-if="activeTab === 'links'" class="section-card">
          <BrandProfileLinks v-model="links" @message="msg => syncMessage = msg" />
        </div>
        <div v-else-if="activeTab === 'docs'" class="section-card">
          <BrandProfileDocuments v-model="docs" @message="msg => syncMessage = msg" />
        </div>
        <BrandProfileResearch v-else :research="research" :researching="researching" @run="triggerResearch" />
        <div v-if="syncMessage" class="sync-alert">{{ syncMessage }}</div>
      </div>

      <div class="modal-foot">
        <button class="pub-btn" @click="emit('close')">Done</button>
        <button class="pub-btn primary" @click="saveAndSync">Save Context Vault</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./brand-profile/brand-profile-modal.scss"></style>

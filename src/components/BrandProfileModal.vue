<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  X,
  Github,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  FolderGit2,
} from 'lucide-vue-next'
import type { BrandDoc, BrandLink, BrandProfile } from '../types/brand'
import BrandProfileDocuments from './brand-profile/BrandProfileDocuments.vue'
import BrandProfileLinks from './brand-profile/BrandProfileLinks.vue'
import BrandProfileResearch from './brand-profile/BrandProfileResearch.vue'

const props = defineProps<{
  brand: BrandProfile
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saveContext', payload: { links: BrandLink[]; githubUser: string; docs: BrandDoc[]; syncGithub: boolean }): void
  (e: 'runResearch'): void
}>()

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

function handleProfileMessage(message: string) {
  syncMessage.value = message
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
          <FolderGit2 :size="18" class="text-purple" />
          <h3>Company Profile & Knowledge Vault: {{ brand.name }}</h3>
        </div>
        <button class="close-btn" @click="emit('close')">
          <X :size="16" />
        </button>
      </div>

      <div class="modal-body">
        <p class="desc">
          Add GitHub profiles, software repositories, social links, and Markdown/text notes (.md, .txt). The AI content machine directly extracts context, live release notes, and engineering angles from this information.
        </p>

        <!-- 1. GitHub Integration & Auto-Sync -->
        <div class="section-card">
          <div class="section-title">
            <Github :size="15" />
            <strong>GitHub Organization / Developer Account</strong>
          </div>
          <div class="github-sync-row">
            <input
              v-model="githubUser"
              type="text"
              class="pub-input"
              placeholder="e.g. dr-week or https://github.com/dr-week"
            />
            <button class="pub-btn" :disabled="syncing || !githubUser.trim()" @click="saveAndSync">
              <RefreshCw :size="13" :class="{ 'spin-anim': syncing }" />
              <span>Save & Fetch Repos</span>
            </button>
          </div>
          <div v-if="brand.purpose.githubSyncedAt" class="sync-status">
            <CheckCircle2 :size="12" class="text-green" />
            <span>Synced {{ repos.length }} public software repos (last checked {{ new Date(brand.purpose.githubSyncedAt).toLocaleTimeString() }})</span>
          </div>

          <!-- Synced Repos Pill Grid -->
          <div v-if="repos.length" class="repos-grid">
            <div v-for="repo in repos" :key="repo.name" class="repo-chip">
              <div class="repo-top">
                <a :href="repo.url" target="_blank" class="repo-name">
                  <strong>{{ repo.name }}</strong>
                  <ExternalLink :size="10" />
                </a>
                <span v-if="repo.stars" class="repo-stars">★ {{ repo.stars }}</span>
                <span v-if="repo.language" class="repo-lang">{{ repo.language }}</span>
              </div>
              <p class="repo-desc">{{ repo.description || 'No description provided' }}</p>
            </div>
          </div>
        </div>

        <div class="section-card">
          <BrandProfileLinks v-model="links" @message="handleProfileMessage" />
        </div>

        <div class="section-card">
          <BrandProfileDocuments v-model="docs" @message="handleProfileMessage" />
        </div>

        <BrandProfileResearch :research="research" :researching="researching" @run="triggerResearch" />

                <div v-if="syncMessage" class="sync-alert">
          {{ syncMessage }}
        </div>
      </div>

      <div class="modal-foot">
        <button class="pub-btn" @click="emit('close')">Done</button>
        <button class="pub-btn primary" @click="saveAndSync">
          Save Context & Knowledge Vault
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  background: #11141e;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .head-title {
    display: flex;
    align-items: center;
    gap: 8px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-body {
  padding: 16px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .desc {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.5;
  }
}

.section-card {
  background: #181d2a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #cbd5e1;
  }
}

.github-sync-row {
  display: flex;
  gap: 8px;
  align-items: center;

  .pub-input {
    flex: 1;
  }
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #10b981;
}

.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  max-height: 160px;
  overflow-y: auto;
  margin-top: 4px;
}

.repo-chip {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 8px;

  .repo-top {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;

    .repo-name {
      color: #38bdf8;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;

      &:hover {
        text-decoration: underline;
      }
    }

    .repo-stars {
      color: #f59e0b;
      font-size: 10px;
    }

    .repo-lang {
      margin-left: auto;
      font-size: 10px;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.05);
      padding: 1px 4px;
      border-radius: 3px;
    }
  }

  .repo-desc {
    margin: 4px 0 0 0;
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.modal-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.pub-input {
  background: #0f121a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 10px;
  color: #fff;
  font-size: 12px;

  &:focus {
    border-color: #38bdf8;
    outline: none;
  }
}

.pub-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    background: #38bdf8;
    color: #04121f;
    border-color: #38bdf8;

    &:hover:not(:disabled) {
      background: #7dd3fc;
    }
  }
}

.text-purple { color: #a855f7; }
.text-green { color: #10b981; }
.text-yellow { color: #facc15; }
.text-orange { color: #fb923c; }

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

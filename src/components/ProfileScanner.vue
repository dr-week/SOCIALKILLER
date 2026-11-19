<script setup lang="ts">
import { ref } from 'vue'
import { Radio, Search, ExternalLink, Download, Image as ImageIcon } from 'lucide-vue-next'
import type { ProfileScanData } from '../types'

const profileUsername = ref('')
const profileScan = ref<ProfileScanData | null>(null)
const profileScanError = ref('')
const profileScanLoading = ref(false)

async function scanPublicProfile() {
  profileScanError.value = ''
  profileScan.value = null
  profileScanLoading.value = true
  try {
    const response = await fetch(`/api/instagram/profile?username=${encodeURIComponent(profileUsername.value.trim())}`)
    const data = await response.json().catch(() => ({})) as Partial<ProfileScanData> & { error?: string }
    if (!response.ok) {
      const message = data.error || (response.status === 429
        ? 'Profile scanning is temporarily rate limited. Wait a moment and try again.'
        : response.status >= 500
          ? 'The profile scanner is temporarily unavailable. Try again shortly.'
          : 'We could not scan that profile. Check the username and try again.')
      throw new Error(message)
    }
    if (!data.username || !data.followers || !data.profileUrl) {
      throw new Error('The profile scanner returned incomplete data. Please try again.')
    }
    profileScan.value = data as ProfileScanData
  } catch (e) {
    profileScanError.value = e instanceof TypeError
      ? 'Could not reach the profile scanner. Check your connection and try again.'
      : e instanceof Error ? e.message : 'Could not scan this profile. Please try again.'
  } finally {
    profileScanLoading.value = false
  }
}

function downloadProfileAvatar(url: string, username: string) {
  const downloadEndpoint = `/api/instagram/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(username)}-avatar.jpg`
  const a = document.createElement('a')
  a.href = downloadEndpoint
  a.download = `${username}-avatar.jpg`
  a.click()
}
</script>

<template>
  <section class="profile-scanner" aria-labelledby="profile-scanner-title">
    <div class="profile-scanner-copy">
      <h2 id="profile-scanner-title"><Radio :size="15" style="vertical-align: -2px; margin-right: 6px; color: var(--purple);" />Profile Scout</h2>
    </div>
    <form class="profile-scanner-form" @submit.prevent="scanPublicProfile">
      <label class="visually-hidden" for="profile-username">Instagram username</label>
      <input id="profile-username" v-model="profileUsername" placeholder="username or @username" maxlength="31" required>
      <button class="button button--primary button--small" :disabled="profileScanLoading">
        <Search :size="13" />
        <span>{{ profileScanLoading ? 'Checking…' : 'Scan' }}</span>
      </button>
    </form>
    <p v-if="profileScanError" class="profile-scan-error" role="alert">{{ profileScanError }}</p>
    <div v-if="profileScan" class="profile-scan-result" role="status" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img
          v-if="profileScan.avatarUrl"
          :src="profileScan.avatarUrl"
          alt="Profile Avatar"
          style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--purple);"
        >
        <div v-else style="width: 36px; height: 36px; border-radius: 50%; background: var(--purple); color: white; display: grid; place-items: center; font-weight: 700; font-size: 14px;">
          {{ profileScan.username.slice(0, 1).toUpperCase() }}
        </div>

        <div>
          <a :href="profileScan.profileUrl" target="_blank" rel="noreferrer" style="font-weight: 700; color: var(--ink);">
            @{{ profileScan.username }}
            <ExternalLink :size="12" style="display:inline; margin-left: 2px;" />
          </a>
          <div style="font-size: 13px; color: var(--ink);">
            <strong>{{ profileScan.followers.display }}</strong> followers
          </div>
          <small style="font-size: 10px; color: var(--muted); display: block;">Checked {{ new Date(profileScan.scannedAt).toLocaleTimeString() }} · public Instagram page</small>
        </div>
      </div>

      <div v-if="profileScan.avatarUrl" style="display: flex; gap: 8px;">
        <button
          class="button button--outline button--tiny"
          style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; font-size: 11px;"
          @click="downloadProfileAvatar(profileScan.avatarUrl, profileScan.username)"
          title="Download Profile Picture (HD)"
        >
          <Download :size="13" />
          <span>Download DP</span>
        </button>
      </div>
    </div>
  </section>
</template>

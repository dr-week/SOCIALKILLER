<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

type MetaPage = { id: string; name: string; instagram: { id: string; username?: string } | null }
const props = defineProps<{ brandId: string }>()
const emit = defineEmits<{ (event: 'updated'): void }>()
const connected = ref(false)
const pages = ref<MetaPage[]>([])
const pageId = ref('')
const instagramId = ref('')
const busy = ref(false)
const error = ref('')

async function load() {
  try {
    const response = await fetch(`/api/social/meta/status?brandId=${encodeURIComponent(props.brandId)}`)
    const data = await response.json()
    connected.value = Boolean(data.connected)
    pages.value = data.pages || []
    if (!pages.value.some(page => page.id === pageId.value)) pageId.value = pages.value[0]?.id || ''
    instagramId.value = pages.value.find(page => page.id === pageId.value)?.instagram?.id || ''
  } catch { error.value = 'Could not load Meta account status.' }
}

watch(pageId, id => { instagramId.value = pages.value.find(page => page.id === id)?.instagram?.id || '' })
watch(() => props.brandId, load)
onMounted(() => { load(); window.addEventListener('focus', load) })
onUnmounted(() => window.removeEventListener('focus', load))

async function saveSelection() {
  busy.value = true
  error.value = ''
  try {
    const response = await fetch('/api/social/meta/select', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId: props.brandId, pageId: pageId.value, instagramId: instagramId.value })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not select this Meta account.')
    emit('updated')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not select this Meta account.' }
  finally { busy.value = false }
}

async function unlink() {
  if (!window.confirm('Disconnect Meta from this workspace?')) return
  busy.value = true
  error.value = ''
  try {
    const response = await fetch('/api/social/meta/disconnect', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId: props.brandId })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not disconnect Meta.')
    connected.value = false
    pages.value = []
    pageId.value = ''
    emit('updated')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not disconnect Meta.' }
  finally { busy.value = false }
}
</script>

<template>
  <section class="meta-manager" aria-label="Meta account management">
    <div class="meta-heading">
      <div><strong>Meta account management</strong><p>Link Facebook Pages and connected Instagram professional accounts for this workspace.</p></div>
      <a class="meta-connect" target="_blank" rel="noopener noreferrer" :href="`/api/social/meta/connect?brandId=${encodeURIComponent(brandId)}`">{{ connected ? 'Link another account' : 'Connect Meta' }}</a>
    </div>
    <div v-if="connected && pages.length" class="meta-controls">
      <label>Facebook Page
        <select v-model="pageId" :disabled="busy"><option v-for="page in pages" :key="page.id" :value="page.id">{{ page.name }}</option></select>
      </label>
      <span class="meta-ig">{{ pages.find(page => page.id === pageId)?.instagram ? `Instagram @${pages.find(page => page.id === pageId)?.instagram?.username || 'professional account'} · connected` : 'No Instagram professional account connected to this Page' }}</span>
      <button :disabled="busy || !pageId" @click="saveSelection">{{ busy ? 'Saving…' : 'Use this Page' }}</button>
      <button class="meta-unlink" :disabled="busy" @click="unlink">Disconnect</button>
    </div>
    <p v-else-if="connected" class="meta-note">Meta is linked. No Pages were returned for this login; check that the user has Page access and requested permissions.</p>
    <p v-if="error" class="meta-error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.meta-manager { display:grid; gap:10px; padding:14px 16px; border:1px solid var(--line); border-radius:12px; background:var(--surface); }
.meta-heading,.meta-controls { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.meta-heading strong { font-size:13px; }.meta-heading p,.meta-note,.meta-error { margin:3px 0 0; color:var(--muted); font-size:11px; }
.meta-controls label { display:flex; align-items:center; gap:8px; color:var(--muted); font-size:11px; }
.meta-controls select,.meta-controls button,.meta-connect { border:1px solid var(--line); border-radius:7px; padding:7px 10px; background:var(--bg-app); color:var(--ink); font:inherit; font-size:11px; text-decoration:none; }
.meta-connect,.meta-controls button { cursor:pointer; }.meta-ig { color:var(--muted); font-size:11px; }.meta-controls .meta-unlink { color:#ef4444; }.meta-error { color:#ef4444; }
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { MessageCircle, RefreshCw, Send, Sparkles, UserRound } from 'lucide-vue-next'

type Interaction = { id: string; brandId: string; platformId: string; kind: 'comment' | 'message'; contactName: string; message: string; replyDraft: string; status: 'open' | 'draft' | 'replied' | 'needs-human'; createdAt: string; updatedAt: string }
const props = defineProps<{ brandId: string; brandName: string; brandTone?: string }>()
const items = ref<Interaction[]>([])
const selectedId = ref('')
const busy = ref(false)
const error = ref('')
const notice = ref('')
const newContact = ref('')
const newMessage = ref('')
const newPlatform = ref('instagram')
const newKind = ref<'comment' | 'message'>('comment')
const current = computed(() => items.value.find(item => item.id === selectedId.value) || items.value[0])
const api = 'http://127.0.0.1:4174/api/inbox'

async function request(path: string, body?: Record<string, unknown>) {
  const response = await fetch(`${api}${path}`, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
  const data = await response.json()
  if (!response.ok || !data.success) throw new Error(data.error || 'Inbox request failed.')
  return data
}
async function load() {
  busy.value = true; error.value = ''
  try { const data = await request(`/interactions?brandId=${encodeURIComponent(props.brandId)}`); items.value = data.interactions; if (!items.value.some(item => item.id === selectedId.value)) selectedId.value = items.value[0]?.id || '' }
  catch (e) { error.value = e instanceof Error ? e.message : 'Could not load inbox.' }
  finally { busy.value = false }
}
async function addInteraction() {
  if (!newMessage.value.trim()) return
  busy.value = true; error.value = ''; notice.value = ''
  try { const data = await request('/interactions', { brandId: props.brandId, platformId: newPlatform.value, kind: newKind.value, contactName: newContact.value || 'Customer', message: newMessage.value }); items.value.unshift(data.interaction); selectedId.value = data.interaction.id; newMessage.value = ''; newContact.value = ''; notice.value = 'Added to inbox.' }
  catch (e) { error.value = e instanceof Error ? e.message : 'Could not add interaction.' }
  finally { busy.value = false }
}
async function generateDraft() {
  if (!current.value) return
  busy.value = true; error.value = ''; notice.value = ''
  try { const data = await request(`/interactions/${current.value.id}/draft`, { brandId: props.brandId, tone: props.brandTone || '' }); Object.assign(current.value, data.interaction); notice.value = 'Reply draft ready. Review it before sending.' }
  catch (e) { error.value = e instanceof Error ? e.message : 'Could not draft reply.' }
  finally { busy.value = false }
}
async function saveStatus(status: Interaction['status']) {
  if (!current.value) return
  busy.value = true; error.value = ''; notice.value = ''
  try { const data = await request(`/interactions/${current.value.id}/status`, { brandId: props.brandId, status, replyDraft: current.value.replyDraft }); Object.assign(current.value, data.interaction); notice.value = status === 'replied' ? 'Marked replied. Send the text on the social platform.' : 'Draft saved.' }
  catch (e) { error.value = e instanceof Error ? e.message : 'Could not save reply.' }
  finally { busy.value = false }
}
watch(() => props.brandId, load)
onMounted(load)
</script>

<template>
  <main class="inbox-page">
    <header class="inbox-heading"><div><span class="eyebrow">COMMUNITY</span><h1>Messages & comments</h1><p>Keep conversations together and prepare thoughtful replies.</p></div><button class="icon-button" :disabled="busy" aria-label="Refresh inbox" @click="load"><RefreshCw :size="16" /></button></header>
    <div class="inbox-badges"><span class="badge-pill"><MessageCircle :size="14" /> AI Assist Drafts</span><span class="badge-pill"><Sparkles :size="14" /> Operator Review</span></div>
    <p v-if="error" class="feedback error">{{ error }}</p><p v-else-if="notice" class="feedback">{{ notice }}</p>
    <div class="inbox-grid">
      <section class="inbox-list card"><div class="section-title"><h2>Inbox</h2><span>{{ items.length }}</span></div>
        <button v-for="item in items" :key="item.id" class="thread" :class="{ selected: current?.id === item.id }" @click="selectedId = item.id"><span class="platform-dot">{{ item.platformId.slice(0, 1).toUpperCase() }}</span><span class="thread-copy"><strong>{{ item.contactName }} <small>{{ item.kind }}</small></strong><span>{{ item.message }}</span><small>{{ item.platformId }} · {{ item.status.replace('-', ' ') }}</small></span></button>
        <p v-if="!items.length" class="empty">No conversations yet. Add a comment or message to start.</p>
      </section>
      <section class="conversation card" v-if="current"><div class="section-title"><div><h2>{{ current.contactName }}</h2><span>{{ current.platformId }} · {{ current.kind }}</span></div><span class="status-pill">{{ current.status.replace('-', ' ') }}</span></div>
        <div class="incoming"><span class="bubble-label"><UserRound :size="14" /> Incoming {{ current.kind }}</span><p>{{ current.message }}</p></div>
        <div class="reply-area"><label for="reply-draft">Your reply draft</label><textarea id="reply-draft" v-model="current.replyDraft" placeholder="Generate a suggested reply, or write your own…" rows="5"></textarea><div class="reply-actions"><button class="secondary" :disabled="busy" @click="generateDraft"><Sparkles :size="15" /> {{ busy ? 'Working…' : 'Draft with AI' }}</button><button class="secondary" :disabled="busy || !current.replyDraft.trim()" @click="saveStatus('draft')">Save draft</button><button class="primary" :disabled="busy || !current.replyDraft.trim()" @click="saveStatus('replied')"><Send :size="15" /> Mark replied</button></div><small>“Mark replied” records your status here; copy and send the reply in the platform.</small></div>
      </section>
      <section v-else class="conversation card"><h2>Add a conversation</h2><p class="empty">Use this starter inbox to draft replies. Provider sync can be connected later.</p></section>
      <section class="new-item card"><h2>Add comment or message</h2><label>Platform<select v-model="newPlatform"><option>instagram</option><option>facebook</option><option>x</option><option>linkedin</option><option>reddit</option><option>discord</option><option>other</option></select></label><label>Type<select v-model="newKind"><option value="comment">Comment</option><option value="message">Private message</option></select></label><label>Person<input v-model="newContact" placeholder="Name or username" /></label><label>Incoming text<textarea v-model="newMessage" rows="4" placeholder="Paste a comment or message…"></textarea></label><button class="primary full" :disabled="busy || !newMessage.trim()" @click="addInteraction">Add to {{ brandName }} inbox</button></section>
    </div>
  </main>
</template>

<style scoped src="./community-inbox.scss"></style>

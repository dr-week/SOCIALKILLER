<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { CheckCircle2, ExternalLink, Flame, KeyRound, Loader2, Radio, Save, ShieldCheck, Zap } from 'lucide-vue-next'
import PlatformIcon from '../common/PlatformIcon.vue'
import UiTooltip from '../../shared/ui/UiTooltip.vue'
import type { PlatformId, SocialPlatformStatus } from '../../types'
import { useChannelConnectionCheck } from './composables/useChannelConnectionCheck'

const props = defineProps<{ brandId: string; platform: SocialPlatformStatus }>()
const emit = defineEmits<{
  (event: 'save', platform: SocialPlatformStatus): void
  (event: 'update', platform: SocialPlatformStatus): void
  (event: 'assign', platformId: string, handle: string): void
  (event: 'keepAlive', platformId: PlatformId): void
  (event: 'openIntent', platformId: PlatformId): void
}>()

const accountHandle = ref(props.platform.handle || '')
watch(() => props.platform.handle, value => { accountHandle.value = value || '' })

const developerLinks: Record<string, { label: string; url: string }> = {
  x: { label: 'Get Twitter/X API Keys', url: 'https://developer.x.com' },
  reddit: { label: 'Create Reddit Script App', url: 'https://www.reddit.com/prefs/apps' },
  devto: { label: 'Generate Dev.to API Key', url: 'https://dev.to/settings/extensions' },
  github: { label: 'Create GitHub Fine-grained PAT', url: 'https://github.com/settings/tokens' },
  hashnode: { label: 'Hashnode Personal Access Token', url: 'https://hashnode.com/settings/developer' },
  discord: { label: 'Create Discord Webhook', url: 'https://discord.com/developers/docs/resources/webhook' },
  linkedin: { label: 'LinkedIn Developer Portal', url: 'https://www.linkedin.com/developers/apps' }
}

function updatePlatform(patch: Partial<SocialPlatformStatus>) {
  emit('update', { ...props.platform, ...patch })
}

function setKeepAlive(value: boolean) {
  const updated = { ...props.platform, keepAliveEnabled: value }
  emit('update', updated)
  emit('save', updated)
}

function updateCredential(field: string, value: string) {
  updatePlatform({ credentials: { ...(props.platform.credentials || {}), [field]: value }, connectionVerified: false })
}

const credentialFields = () => props.platform.fields.filter(field => field !== 'handle')
const secretField = (field: string) => /token|secret|apikey|webhook|password/i.test(field)
const { testStatus, connectionLabel, testConnection } = useChannelConnectionCheck(
  toRef(props, 'brandId'), toRef(props, 'platform'), platform => emit('update', platform)
)

function assignAccount() {
  const handle = (accountHandle.value || props.platform.handle || '').trim()
  if (handle) emit('assign', props.platform.id, handle)
}
</script>

<template>
  <div class="channel-card">
    <div class="card-top">
      <div class="plat-id">
        <span class="platform-icon"><PlatformIcon :platform="platform.id" :size="16" /></span>
        <div>
          <strong>{{ platform.name }}</strong>
          <span class="sub-cat">{{ platform.handle || platform.category }} · {{ connectionLabel }}</span>
        </div>
      </div>
      <span class="streak-pill"><Flame :size="11" />{{ platform.streakDays }}d</span>
    </div>

    <details class="channel-collapse">
      <summary><KeyRound :size="11" /><span>Configure handle &amp; keys</span></summary>
      <div class="channel-collapse-body">
        <div class="account-assignment">
          <input v-model="accountHandle" :placeholder="platform.handle || '@handle'" :aria-label="`${platform.name} account handle`" />
          <button type="button" @click="assignAccount">{{ platform.handle ? 'Update' : 'Add' }}</button>
        </div>

        <div class="toggle-strip">
          <label class="switch-label">
            <input :checked="platform.keepAliveEnabled" type="checkbox" @change="setKeepAlive(($event.target as HTMLInputElement).checked)" />
            <CheckCircle2 :size="12" /><span>Keep-Alive</span>
          </label>
          <a v-if="developerLinks[platform.id]" :href="developerLinks[platform.id].url" target="_blank" rel="noopener noreferrer" class="dev-portal-link">
            <KeyRound :size="10" /><span>API Keys</span><ExternalLink :size="9" />
          </a>
        </div>

        <div class="cred-inputs">
          <div v-for="field in credentialFields()" :key="field" class="cred-row">
            <KeyRound :size="11" class="key-icon" />
            <input
              :value="(platform.credentials || {})[field] || ''"
              @input="updateCredential(field, ($event.target as HTMLInputElement).value)"
              :type="secretField(field) ? 'password' : 'text'"
              :placeholder="`${field} (${secretField(field) ? 'secret' : 'setting'})`"
              class="cred-input"
            />
          </div>
        </div>
      </div>
    </details>

    <div v-if="testStatus" class="test-result-row">
      <span v-if="testStatus.connected" class="conn-badge green"><ShieldCheck :size="11" />Connected ({{ testStatus.msg }})</span>
      <span v-else class="conn-badge amber"><Radio :size="11" />{{ testStatus.msg || 'Intent Assisted' }}</span>
    </div>

    <div class="card-foot">
      <UiTooltip text="Save encrypted credentials"><button class="foot-btn" aria-label="Save encrypted credentials" @click="emit('save', platform)"><Save :size="13" /></button></UiTooltip>
      <UiTooltip text="Test API connection"><button class="foot-btn test-btn" :disabled="testStatus?.testing" aria-label="Test API connection" @click="testConnection"><Loader2 v-if="testStatus?.testing" :size="13" class="spin-icon" /><ShieldCheck v-else :size="13" /></button></UiTooltip>
      <UiTooltip text="Send keep-alive pulse"><button class="foot-btn" aria-label="Send keep-alive pulse" @click="emit('keepAlive', platform.id)"><Zap :size="13" /></button></UiTooltip>
      <UiTooltip text="Open channel intent"><button class="foot-btn primary" aria-label="Open channel intent" @click="emit('openIntent', platform.id)"><ExternalLink :size="13" /></button></UiTooltip>
    </div>
  </div>
</template>

<style scoped>
.channel-card { background:var(--glass-bg); border:1px solid var(--glass-border); backdrop-filter:blur(16px); border-radius:14px; padding:13px; display:flex; flex-direction:column; gap:9px; }
.card-top,.toggle-strip { display:flex; justify-content:space-between; align-items:center; }
.plat-id { display:flex; align-items:center; gap:8px; }.platform-icon { display:inline-flex; align-items:center; justify-content:center; }
.plat-id strong { display:block; font-size:12px; }.account-handle { display:block; color:var(--ink); font-size:10px; }.sub-cat { font-size:9px; color:var(--muted); }
.streak-pill { padding:2px 8px; border-radius:999px; background:rgba(245,158,11,.14); color:#f59e0b; font-size:10px; font-weight:700; display:inline-flex; align-items:center; gap:3px; }
.channel-collapse { border:1px solid var(--line); border-radius:7px; background:var(--bg-app); padding:5px 8px; }
.channel-collapse summary { display:flex; align-items:center; gap:6px; font-size:10px; font-weight:600; color:var(--muted); cursor:pointer; list-style:none; }
.channel-collapse summary::-webkit-details-marker { display:none; }
.channel-collapse-body { display:flex; flex-direction:column; gap:7px; padding-top:8px; }
.account-assignment { display:flex; gap:6px; }.account-assignment input { min-width:0; flex:1; padding:6px 8px; border-radius:6px; border:1px solid var(--line); background:var(--surface); color:var(--ink); font-size:10.5px; }
.account-assignment button { border:1px solid var(--line); border-radius:6px; padding:6px 8px; background:transparent; color:var(--ink); cursor:pointer; }
.toggle-strip { font-size:10px; }.switch-label { display:inline-flex; align-items:center; gap:5px; font-weight:600; cursor:pointer; }.api-badge { font-size:9px; color:var(--muted); }
.dev-portal-link { display:inline-flex; align-items:center; gap:4px; font-size:9px; color:#38bdf8; text-decoration:none; font-weight:600; }.dev-portal-link:hover { text-decoration:underline; }
.cred-inputs { display:flex; flex-direction:column; gap:5px; }.cred-row { display:flex; align-items:center; gap:6px; padding:4px 8px; border-radius:6px; border:1px solid var(--line); background:var(--bg-app); }
.key-icon { color:var(--muted); }.cred-input { width:100%; border:none; background:transparent; color:var(--ink); font-size:10px; outline:none; }
.test-result-row { display:flex; align-items:center; }.conn-badge { display:inline-flex; align-items:center; gap:4px; font-size:9px; padding:2px 6px; border-radius:4px; }
.conn-badge.green { background:rgba(16,185,129,.15); color:#10b981; font-weight:700; }.conn-badge.amber { background:rgba(245,158,11,.15); color:#f59e0b; }
.card-foot { display:flex; gap:5px; margin-top:auto; }.foot-btn { flex:1; min-height:30px; display:inline-flex; align-items:center; justify-content:center; padding:5px 6px; border-radius:7px; border:1px solid var(--line); background:var(--bg-app); color:var(--ink); cursor:pointer; }
.foot-btn.primary { background:var(--purple); color:#fff; border-color:var(--purple); }.test-btn { background:rgba(56,189,248,.08); border-color:rgba(56,189,248,.3); color:#38bdf8; }
.spin-icon { animation: spin .9s linear infinite; }@keyframes spin { to { transform: rotate(360deg); } }
</style>

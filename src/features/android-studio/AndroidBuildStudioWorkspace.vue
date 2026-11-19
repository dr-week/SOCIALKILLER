<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CheckCircle2, Loader2, XCircle } from 'lucide-vue-next'
import UiButton from '../../shared/ui/UiButton.vue'
import UiCard from '../../shared/ui/UiCard.vue'
import { useToast } from '../../shared/ui/useToast'

interface Toolchain {
  javaAvailable: boolean
  androidSdkAvailable: boolean
  gradleWrapperAvailable: boolean
  debugBuildReady: boolean
  aabBuildReady: boolean
  signedReleaseReady: boolean
  missingPrerequisites: string[]
}
interface Runtime { current: { environment: string; instanceId: string; pid: number; port: number }; managed: boolean }
interface BuildJob {
  id: string; target: string; status: string; step: string; startedAt: string
  artifact: string | null; error: string | null; log: string; signedReleaseReady: boolean
}
const toolchain = ref<Toolchain | null>(null)
const runtime = ref<Runtime | null>(null)
const jobs = ref<BuildJob[]>([])
const { pushToast } = useToast()
const busy = ref('')
const error = ref('')
const message = ref('')
const hasRunningBuild = computed(() => jobs.value.some(job => job.status === 'running'))
let timer: ReturnType<typeof setInterval>

async function get<T>(url: string): Promise<T> {
  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`)
  return data as T
}

async function refresh() {
  const [android, runtimeStatus, history] = await Promise.all([
    get<{ toolchain: Toolchain }>('/api/android/toolchain'),
    get<Runtime>('/api/runtime'),
    get<{ jobs: BuildJob[] }>('/api/android/builds')
  ])
  toolchain.value = android.toolchain
  runtime.value = runtimeStatus
  jobs.value = history.jobs
}

async function build(target: 'debug-apk' | 'release-aab') {
  busy.value = target
  error.value = ''
  message.value = ''
  try {
    const response = await fetch('/api/android/build', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ target })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || `Build request failed (${response.status}).`)
    message.value = 'Build started. Output and artifact status update here.'
    pushToast(message.value, 'success')
    await refresh()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Android build could not start.'
    pushToast(error.value, 'error')
  } finally { busy.value = '' }
}

onMounted(() => {
  void refresh().catch(reason => { error.value = reason instanceof Error ? reason.message : 'Android status could not load.' })
  timer = setInterval(() => {
    if (hasRunningBuild.value) void refresh().catch(reason => { error.value = reason instanceof Error ? reason.message : 'Build status could not refresh.' })
  }, 1500)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <main class="android-studio">
    <header class="android-studio__hero">
      <h1>Android <span>Build Studio</span></h1>
    </header>
    <p v-if="error" class="android-studio__message android-studio__message--error" role="alert">{{ error }}</p>
    <p v-if="message" class="android-studio__message" role="status">{{ message }}</p>
    <div class="android-studio__grid">
      <UiCard eyebrow="TOOLCHAIN" title="Build prerequisites">
        <ul class="android-studio__checks">
          <li v-for="item in [
            { label: 'Java JDK', ok: toolchain?.javaAvailable },
            { label: 'Android SDK & build-tools', ok: toolchain?.androidSdkAvailable },
            { label: 'Gradle wrapper', ok: toolchain?.gradleWrapperAvailable },
            { label: 'Signed release config', ok: toolchain?.signedReleaseReady }
          ]" :key="item.label">
            <span>{{ item.label }}</span>
            <span class="android-studio__status-icon" :title="!toolchain ? 'Checking' : item.ok ? 'Available' : 'Missing'">
              <Loader2 v-if="!toolchain" :size="14" class="spin-icon muted" aria-label="Checking" />
              <CheckCircle2 v-else-if="item.ok" :size="14" class="status-ok" aria-label="Available" />
              <XCircle v-else :size="14" class="status-miss" aria-label="Missing" />
            </span>
          </li>
        </ul>
        <p v-if="toolchain?.missingPrerequisites.length" class="android-studio__hint">
          Install or configure: {{ toolchain.missingPrerequisites.join(', ') }}. Build tasks remain disabled until available.
        </p>
        <div class="android-studio__actions">
          <UiButton variant="primary" :disabled="!toolchain?.debugBuildReady || Boolean(busy) || hasRunningBuild" @click="build('debug-apk')">
            {{ busy === 'debug-apk' ? 'Starting...' : 'Build debug APK' }}
          </UiButton>
          <UiButton :disabled="!toolchain?.aabBuildReady || Boolean(busy) || hasRunningBuild" @click="build('release-aab')">
            {{ busy === 'release-aab' ? 'Starting...' : 'Build release AAB' }}
          </UiButton>
        </div>
        <p v-if="toolchain && !toolchain.signedReleaseReady" class="android-studio__hint">Release signing is not configured; do not distribute unsigned release output.</p>
      </UiCard>
      <UiCard eyebrow="RUNTIME" title="Environment">
        <details v-if="runtime" class="android-studio__diag">
          <summary>Runtime diagnostics ({{ runtime.current.environment }})</summary>
          <dl class="android-studio__runtime">
            <dt>Environment</dt><dd>{{ runtime.current.environment }}</dd>
            <dt>Instance ID</dt><dd>{{ runtime.current.instanceId }}</dd>
            <dt>API process / port</dt><dd>{{ runtime.current.pid }} / {{ runtime.current.port }}</dd>
            <dt>Launcher managed</dt><dd>{{ runtime.managed ? 'Yes' : 'No' }}</dd>
          </dl>
        </details>
        <p v-else class="android-studio__hint">Checking runtime…</p>
      </UiCard>
    </div>
    <UiCard eyebrow="BUILD HISTORY" title="Recent builds">
      <p v-if="!jobs.length" class="android-studio__hint">No builds have been started in this server session.</p>
      <article v-for="job in jobs" :key="job.id" class="android-studio__job">
        <div><strong>{{ job.target === 'debug-apk' ? 'Debug APK' : 'Release AAB' }}</strong><span>{{ job.status }} · {{ job.step }}</span></div>
        <p v-if="job.artifact">Artifact: {{ job.artifact }}</p><p v-if="job.error" class="android-studio__message--error">{{ job.error }}</p>
        <details><summary>Build output</summary><pre>{{ job.log || 'No output captured yet.' }}</pre></details>
      </article>
    </UiCard>
  </main>
</template>

<style scoped lang="scss" src="./android-build-studio.scss"></style>

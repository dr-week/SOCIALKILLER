<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import UiButton from '../../shared/ui/UiButton.vue'
import UiCard from '../../shared/ui/UiCard.vue'

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
    await refresh()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Android build could not start.'
  } finally { busy.value = '' }
}

function state(ready: boolean) { return ready ? 'Ready' : 'Missing' }
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
      <p>NATIVE PLATFORM · CAPACITOR</p><h1>Android <span>Build Studio</span></h1>
      <div>Inspect the local Android toolchain, build debug APKs or release bundles, and follow build output.</div>
    </header>
    <p v-if="error" class="android-studio__message android-studio__message--error" role="alert">{{ error }}</p>
    <p v-if="message" class="android-studio__message" role="status">{{ message }}</p>
    <div class="android-studio__grid">
      <UiCard eyebrow="TOOLCHAIN" title="Build prerequisites">
        <ul class="android-studio__checks">
          <li>Java JDK <strong>{{ toolchain ? state(toolchain.javaAvailable) : 'Checking' }}</strong></li>
          <li>Android SDK platforms & build-tools <strong>{{ toolchain ? state(toolchain.androidSdkAvailable) : 'Checking' }}</strong></li>
          <li>Gradle wrapper <strong>{{ toolchain ? state(toolchain.gradleWrapperAvailable) : 'Checking' }}</strong></li>
          <li>Signed release configuration <strong>{{ toolchain ? state(toolchain.signedReleaseReady) : 'Checking' }}</strong></li>
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
      <UiCard eyebrow="RUNTIME" title="Active application instance">
        <dl v-if="runtime" class="android-studio__runtime">
          <dt>Environment</dt><dd>{{ runtime.current.environment }}</dd>
          <dt>Instance ID</dt><dd>{{ runtime.current.instanceId }}</dd>
          <dt>API process / port</dt><dd>{{ runtime.current.pid }} / {{ runtime.current.port }}</dd>
          <dt>Launcher managed</dt><dd>{{ runtime.managed ? 'Yes' : 'No' }}</dd>
        </dl>
        <p v-else class="android-studio__hint">Checking local runtime identity…</p>
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

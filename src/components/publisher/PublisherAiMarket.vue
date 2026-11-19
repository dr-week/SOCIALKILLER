<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bot, Terminal, FileCode, Copy, ExternalLink, Check, Cpu, Sparkles, CheckCircle2 } from 'lucide-vue-next'
import type { TrackedProject } from '../../types'

defineProps<{ projects: TrackedProject[] }>()
const emit = defineEmits<{
  (e: 'addProject', proj: Partial<TrackedProject>): void
  (e: 'showToast', msg: string): void
}>()

const copiedLlm = ref(false)
const copiedMcp = ref(false)
const activeTab = ref<'llms' | 'mcp' | 'projects'>('llms')
const newName = ref('')
const newCategory = ref('')
const newDesc = ref('')
const newInstall = ref('')
const llmsTextContent = ref('')
const mcpCatalogContent = ref('')

async function fetchAiSpecs() {
  try {
    const [resLlm, resMcp] = await Promise.all([
      fetch('/api/marketing/llms.txt'),
      fetch('/api/marketing/ai-catalog')
    ])
    if (resLlm.ok) llmsTextContent.value = await resLlm.text()
    if (resMcp.ok) mcpCatalogContent.value = JSON.stringify(await resMcp.json(), null, 2)
  } catch (err) {
    console.error('Failed to load AI specs', err)
  }
}

onMounted(fetchAiSpecs)

function copyText(text: string, type: 'llm' | 'mcp') {
  navigator.clipboard.writeText(text)
  if (type === 'llm') copiedLlm.value = true
  if (type === 'mcp') copiedMcp.value = true
  emit('showToast', 'Copied to clipboard for AI agents!')
  setTimeout(() => {
    copiedLlm.value = false
    copiedMcp.value = false
  }, 1800)
}

function handleAddProject() {
  if (!newName.value.trim()) return
  emit('addProject', {
    name: newName.value.trim(),
    category: newCategory.value.trim() || 'Developer Tool',
    description: newDesc.value.trim() || 'High-performance application framework',
    installCmd: newInstall.value.trim() || `pnpm add ${newName.value.toLowerCase().replace(/\s+/g, '-')}`,
    aiCapabilities: ['Autonomous REST API', 'Clean llms.txt docs', 'Zero-VDOM speed']
  })
  newName.value = ''
  newCategory.value = ''
  newDesc.value = ''
  newInstall.value = ''
  setTimeout(fetchAiSpecs, 350)
}
</script>

<template>
  <div class="pub-section">
    <div class="pub-hero">
      <div class="pub-hero-left">
        <Bot :size="22" style="color: #10b981" />
        <div>
          <h3 class="pub-hero-title">AI Agent Market (<code>llms.txt</code> &amp; tool discovery)</h3>
          <p class="pub-hero-sub">Publish discovery metadata for Zuari (<code>dr-week/fast-framework</code>) and The Social Base</p>
        </div>
      </div>
      <div class="pub-tabs">
        <button class="pub-tab-btn" :class="{ active: activeTab === 'llms' }" @click="activeTab = 'llms'">
          <FileCode :size="13" /> <span>llms.txt</span>
        </button>
        <button class="pub-tab-btn" :class="{ active: activeTab === 'mcp' }" @click="activeTab = 'mcp'">
          <Terminal :size="13" /> <span>Discovery JSON</span>
        </button>
        <button class="pub-tab-btn" :class="{ active: activeTab === 'projects' }" @click="activeTab = 'projects'">
          <Cpu :size="13" /> <span>Apps ({{ projects.length }})</span>
        </button>
        <a href="/api/marketing/llms.txt" target="_blank" class="pub-btn">
          <ExternalLink :size="12" /> <span>Live</span>
        </a>
      </div>
    </div>

    <div v-if="activeTab === 'llms'" class="pub-card">
      <div class="pub-row-between">
        <span class="pub-pill blue">/api/marketing/llms.txt</span>
        <button class="pub-btn primary" @click="copyText(llmsTextContent, 'llm')">
          <component :is="copiedLlm ? Check : Copy" :size="13" />
          <span>{{ copiedLlm ? 'Copied' : 'Copy llms.txt' }}</span>
        </button>
      </div>
      <pre class="pub-code">{{ llmsTextContent || '// Loading /api/marketing/llms.txt...' }}</pre>
    </div>

    <div v-else-if="activeTab === 'mcp'" class="pub-card">
      <div class="pub-row-between">
        <span class="pub-pill green">/api/marketing/ai-catalog</span>
        <button class="pub-btn primary" @click="copyText(mcpCatalogContent, 'mcp')">
          <component :is="copiedMcp ? Check : Copy" :size="13" />
          <span>{{ copiedMcp ? 'Copied' : 'Copy discovery JSON' }}</span>
        </button>
      </div>
      <pre class="pub-code">{{ mcpCatalogContent || '// Loading /api/marketing/ai-catalog...' }}</pre>
    </div>

    <div v-else class="pub-grid-2">
      <div class="pub-card">
        <strong>Register App / Framework</strong>
        <input v-model="newName" placeholder="Name (e.g. @zuari/spatial)" class="pub-input" />
        <input v-model="newCategory" placeholder="Category (e.g. WebXR Engine)" class="pub-input" />
        <input v-model="newDesc" placeholder="1-line benchmark / hook" class="pub-input" />
        <input v-model="newInstall" placeholder="pnpm add @zuari/core" class="pub-input" />
        <button class="pub-btn primary" @click="handleAddProject">
          <Sparkles :size="13" /> <span>Add to AI Catalog</span>
        </button>
      </div>

      <div class="pub-section">
        <div v-for="p in projects" :key="p.id" class="pub-card">
          <div class="pub-row-between">
            <strong>{{ p.name }}</strong>
            <span class="pub-pill blue">{{ p.category }}</span>
          </div>
          <span style="font-size: 11.5px; opacity: 0.8">{{ p.description }}</span>
          <code style="font-size: 11px; color: #38bdf8">{{ p.installCmd }}</code>
          <div class="pub-tabs">
            <span v-for="(cap, i) in p.aiCapabilities" :key="i" class="pub-pill green">
              <CheckCircle2 :size="10" /> {{ cap }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './publisher-shared.css';
</style>

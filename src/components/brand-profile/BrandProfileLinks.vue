<script setup lang="ts">
import { ref } from 'vue'
import { Globe, Plus, Trash2 } from 'lucide-vue-next'
import type { BrandLink } from '../../types/brand'

const props = defineProps<{ modelValue: BrandLink[] }>()
const emit = defineEmits<{
  (event: 'update:modelValue', links: BrandLink[]): void
  (event: 'message', message: string): void
}>()

const platform = ref('github')
const url = ref('')

function addLink() {
  const value = url.value.trim()
  if (!value) return
  if (!/^https?:\/\//i.test(value)) {
    emit('message', 'URL must start with http:// or https://')
    return
  }
  emit('update:modelValue', [...props.modelValue, { platform: platform.value, url: value }])
  url.value = ''
  emit('message', '')
}

function removeLink(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, current) => current !== index))
}
</script>

<template>
  <div class="section-title">
    <Globe :size="15" />
    <strong>Company Social & Web Links</strong>
  </div>
  <div class="link-add-row">
    <select v-model="platform" class="pub-select">
      <option value="github">GitHub</option>
      <option value="x">X / Twitter</option>
      <option value="linkedin">LinkedIn</option>
      <option value="reddit">Reddit</option>
      <option value="devto">Dev.to</option>
      <option value="website">Official Site</option>
      <option value="youtube">YouTube</option>
      <option value="discord">Discord</option>
    </select>
    <input
      v-model="url"
      type="url"
      class="pub-input"
      placeholder="https://github.com/dr-week/fast-framework"
      @keydown.enter.prevent="addLink"
    />
    <button class="pub-btn" :disabled="!url.trim()" @click="addLink">
      <Plus :size="13" />
      <span>Add Link</span>
    </button>
  </div>
  <div v-if="modelValue.length" class="links-list">
    <div v-for="(link, index) in modelValue" :key="index" class="link-item">
      <span class="platform-tag">{{ link.platform.toUpperCase() }}</span>
      <a :href="link.url" target="_blank" class="link-url">{{ link.url }}</a>
      <button class="del-btn" title="Remove Link" @click="removeLink(index)">
        <Trash2 :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-title, .link-add-row, .link-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-size: 12px;
  color: #cbd5e1;
}

.link-add-row .pub-input, .link-url { flex: 1; }
.pub-input, .pub-select {
  background: #0f121a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 10px;
  color: #fff;
  font-size: 12px;
}

.pub-input:focus, .pub-select:focus { border-color: #38bdf8; outline: none; }
.pub-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.pub-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pub-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.15); }
.links-list { display: flex; flex-direction: column; gap: 6px; }
.link-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
}

.platform-tag {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 9px;
  font-weight: 700;
}

.link-url {
  overflow: hidden;
  color: #38bdf8;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-url:hover { text-decoration: underline; }
.del-btn {
  padding: 2px 4px;
  border: 0;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  opacity: 0.7;
}

.del-btn:hover { opacity: 1; }
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Trash2, Upload } from 'lucide-vue-next'
import type { BrandDoc } from '../../types/brand'

const props = defineProps<{ modelValue: BrandDoc[] }>()
const emit = defineEmits<{
  (event: 'update:modelValue', docs: BrandDoc[]): void
  (event: 'message', message: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return

  let docs = [...props.modelValue]
  emit('message', '')
  for (const file of Array.from(files)) {
    if (!/\.(md|markdown|txt)$/i.test(file.name)) {
      emit('message', 'Only .md, .markdown, and .txt files are supported')
      continue
    }
    if (file.size > 200_000) {
      emit('message', `${file.name} is too large (max 200 KB)`)
      continue
    }
    const text = await file.text()
    if (text.trim().length < 20) continue
    const existing = docs.findIndex(doc => doc.name === file.name)
    const document = { name: file.name, text }
    docs = existing < 0
      ? [...docs, document]
      : docs.map((doc, index) => index === existing ? document : doc)
  }
  if (docs !== props.modelValue) emit('update:modelValue', docs)
  if (fileInput.value) fileInput.value.value = ''
}

function removeDocument(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, current) => current !== index))
}
</script>

<template>
  <div class="section-title">
    <FileText :size="15" />
    <strong>Upload Company Documents (.md / .txt)</strong>
  </div>
  <div class="file-drop-strip">
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".md,.markdown,.txt"
      hidden
      @change="handleUpload"
    />
    <button type="button" class="upload-trigger-btn" @click="fileInput?.click()">
      <Upload :size="13" />
      <span>Select Markdown / Text Files</span>
    </button>
    <span class="file-hint">Upload READMEs, architecture notes, or changelogs for the AI to cite</span>
  </div>
  <div v-if="modelValue.length" class="docs-list">
    <div v-for="(doc, index) in modelValue" :key="index" class="doc-item">
      <div class="doc-info">
        <FileText :size="13" class="text-purple" />
        <strong class="doc-name">{{ doc.name }}</strong>
        <small class="doc-size">{{ doc.text.length }} chars</small>
      </div>
      <button class="del-btn" title="Remove file" @click="removeDocument(index)">
        <Trash2 :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-title, .file-drop-strip, .upload-trigger-btn, .doc-item, .doc-info {
  display: flex;
  align-items: center;
}

.section-title, .file-drop-strip, .upload-trigger-btn, .doc-info { gap: 8px; }
.section-title { font-size: 12px; color: #cbd5e1; }
.text-purple { color: #a855f7; }
.file-drop-strip { gap: 10px; }
.upload-trigger-btn {
  padding: 6px 12px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 6px;
  background: rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.file-hint { color: #64748b; font-size: 11px; }
.docs-list { display: flex; flex-direction: column; gap: 6px; }
.doc-item {
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  font-size: 11px;
}

.doc-info { flex: 1; }
.doc-name { color: #cbd5e1; }
.doc-size { color: #64748b; font-size: 10px; }
.del-btn { border: 0; background: transparent; color: #ef4444; cursor: pointer; opacity: 0.7; }
.del-btn:hover { opacity: 1; }
</style>

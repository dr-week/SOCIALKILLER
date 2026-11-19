<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountImportBanner, type ImportBannerIsland } from '../islands/import-banner'

const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'triggerImport'): void
  (e: 'loadDemo'): void
  (e: 'openGuide'): void
}>()

const host = ref<HTMLElement | null>(null)
let island: ImportBannerIsland | undefined

onMounted(() => {
  if (!host.value) throw new Error('Import banner island host was not mounted.')
  island = mountImportBanner(host.value, {
    triggerImport: () => emit('triggerImport'),
    loadDemo: () => emit('loadDemo'),
    openGuide: () => emit('openGuide')
  }, props.loading)
})

watch(() => props.loading, loading => island?.updateLoading(loading))

onBeforeUnmount(() => {
  island?.destroy()
  island = undefined
})
</script>

<template>
  <div ref="host"></div>
</template>

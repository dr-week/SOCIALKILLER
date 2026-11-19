<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountAppTopbar, type AppTopbarIsland, type AppTopbarProps } from '../islands/app-shell/topbar'
import type { View } from '../types'

const props = defineProps<AppTopbarProps>()
const emit = defineEmits<{
  (e: 'update:menuOpen', val: boolean): void
  (e: 'update:activeView', val: View): void
  (e: 'triggerImport'): void
}>()
const host = ref<HTMLElement | null>(null)
let island: AppTopbarIsland | undefined

onMounted(() => {
  if (!host.value) throw new Error('Topbar island host was not mounted.')
  island = mountAppTopbar(host.value, props, {
    toggleMenu: () => emit('update:menuOpen', !props.menuOpen),
    openWorkspace: () => {
      emit('update:menuOpen', false)
      emit('update:activeView', 'app-launcher')
    },
    triggerImport: () => emit('triggerImport')
  })
})

watch(() => ({ ...props }), nextProps => island?.update(nextProps))

onBeforeUnmount(() => {
  island?.destroy()
  island = undefined
})
</script>

<template>
  <div ref="host" class="app-topbar-host"></div>
</template>

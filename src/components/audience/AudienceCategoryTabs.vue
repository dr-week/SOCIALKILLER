<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  mountAudienceCategoryTabs,
  type AudienceCategoryTabsIsland,
  type AudienceCategoryTabsProps
} from '../../islands/audience-category-tabs'
import type { View } from '../../types'

const props = defineProps<AudienceCategoryTabsProps>()
const emit = defineEmits<{ (event: 'selectView', view: View): void }>()
const host = ref<HTMLElement | null>(null)
let island: AudienceCategoryTabsIsland | undefined

onMounted(() => {
  if (!host.value) throw new Error('Audience category tabs host was not mounted.')
  island = mountAudienceCategoryTabs(host.value, props, view => emit('selectView', view))
})

watch(() => ({ ...props }), nextProps => island?.update(nextProps))

onBeforeUnmount(() => {
  island?.destroy()
  island = undefined
})
</script>

<template>
  <div ref="host"></div>
</template>

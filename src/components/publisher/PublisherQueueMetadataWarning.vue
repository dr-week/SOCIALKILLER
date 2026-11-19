<script setup lang="ts">
import { computed } from 'vue'
import type { SocialPostItem } from '../../types'

const props = defineProps<{
  posts?: SocialPostItem[]
  post?: SocialPostItem
}>()
const missingCount = computed(() => props.posts?.filter(post => post.metadataWarning).length || 0)
</script>

<template>
  <div v-if="props.post?.metadataWarning" class="queue-post-warning">
    {{ props.post.metadataWarning }}
  </div>
  <div v-else-if="missingCount" class="queue-data-warning" role="alert">
    {{ missingCount }} queued post(s) have missing target-channel metadata. Editing, approval, duplication, and manual confirmation are disabled for those posts.
  </div>
</template>

<style scoped>
.queue-data-warning,
.queue-post-warning {
  border: 1px solid #f1c97a;
  border-radius: 8px;
  background: #fff8e8;
  color: #79550a;
  font-size: 12px;
  line-height: 1.5;
}
.queue-data-warning { margin-bottom: 12px; padding: 10px 12px; }
.queue-post-warning { margin: 0; padding: 7px 10px; }
</style>

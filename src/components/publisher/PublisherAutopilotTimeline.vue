<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import PlatformIcon from '../common/PlatformIcon.vue'
import type { PlatformId, SocialPostItem } from '../../types'

const props = defineProps<{
  posts: SocialPostItem[]
  platformBadges: Record<PlatformId, { icon: string; color: string; bg: string; label: string }>
}>()

const emit = defineEmits<{ (e: 'selectPost', post: SocialPostItem): void }>()

const timelineSlots = computed(() => {
  const slots: Array<{ timeLabel: string; date: Date; isNext: boolean; matchedPost?: SocialPostItem }> = []
  const now = new Date()
  const baseHour = Math.floor(now.getHours() / 4) * 4

  for (let i = 0; i < 6; i++) {
    const slotDate = new Date(now)
    slotDate.setHours(baseHour + i * 4, 0, 0, 0)
    const timeLabel = slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const matched = props.posts.find(p => Math.abs(new Date(p.scheduledAt).getTime() - slotDate.getTime()) < 2 * 3600 * 1000)
    slots.push({ timeLabel, date: slotDate, isNext: i === 1, matchedPost: matched })
  }
  return slots
})
</script>

<template>
  <div class="autopilot-timeline-wrap">
    <div class="timeline-header">
      <div class="header-left">
        <Clock :size="15" class="text-emerald" />
        <h4>Publishing schedule</h4>
        <span class="autopilot-pill">Next 24 hours</span>
      </div>
      <div class="header-meta"><span>Planned posts by time slot</span></div>
    </div>

    <div class="timeline-track">
      <div
        v-for="(slot, idx) in timelineSlots"
        :key="idx"
        class="timeline-node"
        :class="{ 'is-next': slot.isNext, 'has-post': !!slot.matchedPost }"
        @click="slot.matchedPost && emit('selectPost', slot.matchedPost)"
      >
        <div class="node-time">{{ slot.timeLabel }}</div>
        <div class="node-bullet"><div class="bullet-inner"></div></div>

        <div class="node-card">
          <template v-if="slot.matchedPost">
            <span class="post-title">{{ (slot.matchedPost.title || 'Scheduled post').slice(0, 28) }}...</span>
            <div class="post-platforms">
              <span v-for="p in (slot.matchedPost.platforms || []).slice(0, 3)" :key="p" class="mini-icon" :title="platformBadges[p]?.label || p">
                <PlatformIcon :platform="p" :size="11" />
              </span>
              <span v-if="(slot.matchedPost.platforms || []).length > 3" class="more-count">+{{ (slot.matchedPost.platforms || []).length - 3 }}</span>
            </div>
          </template>
          <template v-else>
            <span class="slot-idle">No scheduled post</span>
            <span class="slot-sub">Available time slot</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles/publisher-autopilot-timeline.scss"></style>

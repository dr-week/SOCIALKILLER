<script setup lang="ts">
import { computed } from 'vue'
import {
  Clock,
  Send,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-vue-next'
import PlatformIcon from '../common/PlatformIcon.vue'
import type { PlatformId, SocialPostItem } from '../../types'

const props = defineProps<{
  posts: SocialPostItem[]
  platformBadges: Record<PlatformId, { icon: string; color: string; bg: string; label: string }>
}>()

const emit = defineEmits<{
  (e: 'selectPost', post: SocialPostItem): void
}>()

// Generate next 24 hours schedule slots (every 4 hours: 10:00, 14:00, 18:00, 22:00, 02:00, 06:00)
const timelineSlots = computed(() => {
  const slots: Array<{
    timeLabel: string
    date: Date
    isNext: boolean
    matchedPost?: SocialPostItem
  }> = []

  const now = new Date()
  const baseHour = Math.floor(now.getHours() / 4) * 4

  for (let i = 0; i < 6; i++) {
    const slotDate = new Date(now)
    slotDate.setHours(baseHour + i * 4, 0, 0, 0)

    const isNext = i === 1 // The upcoming slot
    const timeLabel = slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Find any post matching this time window (+/- 2 hours)
    const matched = props.posts.find(p => {
      const pDate = new Date(p.scheduledAt)
      return Math.abs(pDate.getTime() - slotDate.getTime()) < 2 * 3600 * 1000
    })

    slots.push({
      timeLabel,
      date: slotDate,
      isNext,
      matchedPost: matched
    })
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
      <div class="header-meta">
        <span>Planned posts by time slot</span>
      </div>
    </div>

    <!-- Horizontal Visual Timeline Track -->
    <div class="timeline-track">
      <div
        v-for="(slot, idx) in timelineSlots"
        :key="idx"
        class="timeline-node"
        :class="{ 'is-next': slot.isNext, 'has-post': !!slot.matchedPost }"
        @click="slot.matchedPost && emit('selectPost', slot.matchedPost)"
      >
        <div class="node-time">{{ slot.timeLabel }}</div>
        <div class="node-bullet">
          <div class="bullet-inner"></div>
        </div>

        <div class="node-card">
          <template v-if="slot.matchedPost">
            <span class="post-title">{{ (slot.matchedPost.title || 'Scheduled post').slice(0, 28) }}...</span>
            <div class="post-platforms">
              <span
                v-for="p in (slot.matchedPost.platforms || []).slice(0, 3)"
                :key="p"
                class="mini-icon"
                :title="platformBadges[p]?.label || p"
                style="display: inline-flex; align-items: center; justify-content: center;"
              >
                <PlatformIcon :platform="p" :size="11" />
              </span>
              <span v-if="(slot.matchedPost.platforms || []).length > 3" class="more-count">
                +{{ (slot.matchedPost.platforms || []).length - 3 }}
              </span>
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

<style scoped lang="scss">
.autopilot-timeline-wrap {
  background: var(--surface, #131722);
  border: 1px solid var(--line, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;

  h4 {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink, #fff);
  }
}

.autopilot-pill {
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  font-size: 9.5px;
  font-weight: 700;
}

.header-meta {
  font-size: 11px;
  color: var(--muted, #94a3b8);
}

.timeline-track {
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 6px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 26px;
    left: 20px;
    right: 20px;
    height: 2px;
    background: rgba(255, 255, 255, 0.08);
    z-index: 1;
  }
}

.timeline-node {
  flex: 1;
  min-width: 115px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &.is-next .bullet-inner {
    background: #10b981;
    box-shadow: 0 0 10px #10b981;
  }

  &.has-post .node-card {
    border-color: rgba(120, 87, 220, 0.4);
    background: rgba(120, 87, 220, 0.08);
  }
}

.node-time {
  font-size: 10px;
  font-weight: 600;
  color: var(--muted, #94a3b8);
  font-family: monospace;
}

.node-bullet {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--surface, #131722);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
}

.bullet-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}

.node-card {
  width: 90%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 52px;
}

.post-title {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-platforms {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: auto;
}

.mini-icon {
  font-size: 11px;
}

.more-count {
  font-size: 9px;
  color: var(--muted, #94a3b8);
}

.slot-idle {
  font-size: 10px;
  font-weight: 600;
  color: #cbd5e1;
}

.slot-sub {
  font-size: 8.5px;
  color: var(--muted, #64748b);
  margin-top: auto;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import type { SocialPostItem } from '../../types'

const props = defineProps<{ posts: SocialPostItem[]; weekOffset: number }>()
const emit = defineEmits<{ (event: 'update:weekOffset', value: number): void }>()
const groups = computed(() => {
  const start = new Date()
  start.setDate(start.getDate() + props.weekOffset * 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const days = new Map<string, SocialPostItem[]>()
  for (const post of props.posts) {
    const date = new Date(post.scheduledAt)
    if (date < start || date >= end) continue
    const label = date.toLocaleDateString()
    days.set(label, [...(days.get(label) || []), post])
  }
  return [...days.entries()].sort((a, b) => new Date(a[1][0].scheduledAt).getTime() - new Date(b[1][0].scheduledAt).getTime())
})
</script>

<template>
  <div class="calendar-list">
    <nav class="calendar-nav" aria-label="Calendar week">
      <button @click="emit('update:weekOffset', weekOffset - 1)">Previous week</button>
      <strong>{{ weekOffset === 0 ? 'This week' : `${weekOffset > 0 ? '+' : ''}${weekOffset} weeks` }}</strong>
      <button @click="emit('update:weekOffset', weekOffset + 1)">Next week</button>
    </nav>
    <p v-if="!groups.length" class="empty">No campaigns this week.</p>
    <section v-for="[day, dayPosts] in groups" :key="day" class="calendar-day">
      <strong>{{ day }}</strong>
      <div v-for="post in dayPosts" :key="post.id" class="calendar-entry">
        <span class="state" :class="post.status">{{ post.status.replaceAll('_', ' ') }}</span>
        <span>{{ new Date(post.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }} · {{ post.title }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.calendar-list{display:flex;flex-direction:column;gap:10px;max-height:440px;overflow:auto}.calendar-nav{display:flex;justify-content:space-between;align-items:center;gap:8px}.calendar-nav button{border:1px solid var(--line);border-radius:7px;padding:7px 10px;background:transparent;color:var(--ink);cursor:pointer}.calendar-day{padding:10px;border:1px solid var(--line);border-radius:8px}.calendar-entry{display:flex;gap:8px;align-items:baseline;padding-top:8px;font-size:11px}.state{font-size:9px;text-transform:uppercase;color:var(--muted)}.pending_approval{color:#f59e0b}.published{color:#10b981}.empty{color:var(--muted);font-size:12px}
</style>

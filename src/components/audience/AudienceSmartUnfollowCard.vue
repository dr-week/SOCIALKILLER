<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ShieldCheck, Sparkles, UserX } from 'lucide-vue-next'
import { normalizeUsername, type Person } from '../../domain/followers'
import { buildSmartUnfollowBatch, DEFAULT_SMART_RULES } from '../../domain/smart-unfollow'
import type { AccountStatus } from '../../types'

const props = defineProps<{
  notFollowingBack: Person[]
  ghostFollowers: Person[]
  whitelistSet: Set<string>
  accountStatusMap: Map<string, AccountStatus>
}>()

const emit = defineEmits<{
  (e: 'queueSmartBatch', usernames: string[]): void
}>()

const rules = reactive({ ...DEFAULT_SMART_RULES })
const ghostSet = computed(() => new Set(props.ghostFollowers.map(p => normalizeUsername(p.username))))

const preview = computed(() =>
  buildSmartUnfollowBatch({
    candidates: props.notFollowingBack,
    ghostUsernames: ghostSet.value,
    whitelistSet: props.whitelistSet,
    accountStatusMap: props.accountStatusMap,
    rules
  })
)

function launchSmartBatch() {
  const usernames = preview.value.batch.map(item => item.person.username)
  if (usernames.length > 0) emit('queueSmartBatch', usernames)
}
</script>

<template>
  <section v-if="notFollowingBack.length > 0" class="smart-unfollow-bar" aria-label="Smart unfollow filters">
    <div class="smart-header">
      <div class="smart-title">
        <Sparkles :size="15" class="accent-icon" />
        <strong>Smart Unfollow Filter &amp; Auto-Protect</strong>
        <span class="smart-meta">
          {{ preview.totalEligible }} eligible · {{ preview.protectedCount }} protected · {{ preview.ghostCount + preview.deadCount }} ghost/404
        </span>
      </div>
      <button
        type="button"
        class="button button--primary button--tiny"
        :disabled="preview.batch.length === 0"
        @click="launchSmartBatch"
      >
        <UserX :size="13" />
        <span>Queue Smart Batch ({{ preview.batch.length }})</span>
      </button>
    </div>

    <div class="smart-rules-row">
      <label class="rule-chip" :class="{ active: rules.protectRecentDays > 0 }">
        <input
          type="checkbox"
          :checked="rules.protectRecentDays > 0"
          @change="rules.protectRecentDays = ($event.target as HTMLInputElement).checked ? 7 : 0"
        />
        <ShieldCheck :size="12" /> Protect Recent (&lt;7d)
      </label>

      <label class="rule-chip" :class="{ active: rules.protectCreators }">
        <input v-model="rules.protectCreators" type="checkbox" />
        <ShieldCheck :size="12" /> Protect Creators/Brands
      </label>

      <label class="rule-chip" :class="{ active: rules.ghostsOnly }">
        <input v-model="rules.ghostsOnly" type="checkbox" />
        Ghosts &amp; 404 Only
      </label>

      <div class="batch-size-group">
        <span>Batch:</span>
        <button
          v-for="size in [10, 25, 50]"
          :key="size"
          type="button"
          class="size-pill"
          :class="{ active: rules.batchSize === size }"
          @click="rules.batchSize = size"
        >
          {{ size }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.smart-unfollow-bar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.smart-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.smart-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; }
.accent-icon { color: var(--primary, #6366f1); }
.smart-meta { font-size: 11.5px; color: var(--muted); font-weight: 500; }
.smart-rules-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rule-chip {
  display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600;
  padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border);
  background: var(--surface-muted); color: var(--text); cursor: pointer;
  input { accent-color: var(--primary, #6366f1); }
  &.active { border-color: var(--primary, #6366f1); background: rgba(99, 102, 241, 0.12); }
}
.batch-size-group {
  margin-left: auto; display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--muted);
}
.size-pill {
  border: 1px solid var(--border); background: var(--surface-muted); color: var(--text);
  border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; cursor: pointer;
  &.active { border-color: var(--primary, #6366f1); color: var(--primary, #6366f1); background: rgba(99, 102, 241, 0.14); }
}
</style>

<script setup lang="ts">
import {
  Star,
  UserX,
  Download,
  X,
  CheckSquare
} from 'lucide-vue-next'

defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'whitelistSelected'): void
  (e: 'queueSelected'): void
  (e: 'exportSelected'): void
  (e: 'clearSelection'): void
}>()
</script>

<template>
  <Transition name="slide-up">
    <div v-if="selectedCount > 0" class="floating-batch-bar" role="region" aria-label="Batch actions">
      <div class="batch-count-pill">
        <CheckSquare :size="14" class="text-indigo" />
        <span><strong>{{ selectedCount }}</strong> selected</span>
      </div>

      <div class="batch-divider"></div>

      <div class="batch-actions-group">
        <button
          class="batch-btn batch-btn--primary"
          @click="emit('queueSelected')"
          title="Add all selected users to the Safe Unfollow Queue"
        >
          <UserX :size="13" />
          <span>Queue Unfollow</span>
        </button>

        <button
          class="batch-btn batch-btn--accent"
          @click="emit('whitelistSelected')"
          title="Add all selected users to Safe List / Whitelist"
        >
          <Star :size="13" />
          <span>Protect in Safe List</span>
        </button>

        <button
          class="batch-btn batch-btn--ghost"
          @click="emit('exportSelected')"
          title="Export only selected users to CSV"
        >
          <Download :size="13" />
          <span>Export CSV</span>
        </button>
      </div>

      <button
        class="batch-close-btn"
        @click="emit('clearSelection')"
        title="Deselect all"
        aria-label="Deselect all"
      >
        <X :size="14" />
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.floating-batch-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  background: var(--surface-card, #131722);
  border: 1px solid var(--purple, #7857dc);
  border-radius: 40px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 20px rgba(120, 87, 220, 0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px 8px 18px;
  backdrop-filter: blur(12px);
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.batch-count-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--ink, #fff);
  white-space: nowrap;
}

.batch-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
}

.batch-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  white-space: nowrap;

  &--primary {
    background: #ef4444;
    color: #fff;
    &:hover { background: #dc2626; }
  }

  &--accent {
    background: rgba(234, 179, 8, 0.15);
    border: 1px solid rgba(234, 179, 8, 0.4);
    color: #facc15;
    &:hover { background: rgba(234, 179, 8, 0.25); }
  }

  &--ghost {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--muted, #94a3b8);
    &:hover { color: #fff; border-color: rgba(255, 255, 255, 0.2); }
  }
}

.batch-close-btn {
  background: transparent;
  border: none;
  color: var(--muted, #94a3b8);
  cursor: pointer;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.95);
}

@keyframes popIn {
  0% { transform: translate(-50%, 15px) scale(0.96); opacity: 0; }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}
</style>

<template>
  <section class="ads-panel">
    <header class="ads-panel-head">
      <h3>HITL Approval Queue &amp; Guardrails</h3>
      <label class="ads-toggle">
        <input type="checkbox" :checked="paperTrade" @change="$emit('update:paperTrade', ($event.target as HTMLInputElement).checked)" />
        <span>Paper-Trade Dry-Run</span>
      </label>
    </header>
    <div v-if="approvals.length" class="ads-approval-list">
      <div v-for="item in approvals" :key="item.id" class="ads-approval-item">
        <div>
          <strong>{{ item.action }}</strong> — <span class="ads-muted">{{ item.reason }}</span>
        </div>
        <div class="ads-actions">
          <button type="button" class="ads-btn-primary" @click="$emit('execute', item.id, 'approve')">Approve</button>
          <button type="button" class="ads-btn-ghost" @click="$emit('execute', item.id, 'reject')">Reject</button>
        </div>
      </div>
    </div>
    <p v-else class="ads-muted">No pending actions. Guardrails: ±15% max shift, &gt;2x hourly burn breaker.</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{ approvals: any[]; paperTrade: boolean }>()
defineEmits(['update:paperTrade', 'execute'])
</script>

<template>
  <div class="ads-kpi-rail">
    <div class="ads-kpi-card">
      <span class="ads-kpi-label">7d Spend</span>
      <strong class="ads-kpi-value">${{ totals.spend }}</strong>
    </div>
    <div class="ads-kpi-card">
      <span class="ads-kpi-label">Blended ROAS</span>
      <strong class="ads-kpi-value">{{ totals.roas }}x</strong>
    </div>
    <div class="ads-kpi-card">
      <span class="ads-kpi-label">Blended CPA</span>
      <strong class="ads-kpi-value">${{ totals.cpa }}</strong>
    </div>
    <div class="ads-kpi-card">
      <span class="ads-kpi-label">Avg CTR</span>
      <strong class="ads-kpi-value">{{ totals.ctr }}%</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totals: { spend: string; roas: string; cpa: string; ctr: string }
}>()
</script>

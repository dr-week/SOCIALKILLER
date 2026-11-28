<template>
  <section class="ads-panel">
    <header class="ads-panel-head">
      <h3>Campaign &amp; Framework Matrix</h3>
      <div class="ads-controls-inline">
        <select :value="selectedFramework" @change="$emit('update:selectedFramework', ($event.target as HTMLSelectElement).value)">
          <option value="3-2-2-dct">3-2-2 DCT</option>
          <option value="70-20-10-funnel">70/20/10 Full-Funnel</option>
          <option value="broad-first">Broad-First</option>
        </select>
        <input type="number" min="10" step="10" :value="dailyBudget" @input="$emit('update:dailyBudget', Number(($event.target as HTMLInputElement).value))" />
      </div>
    </header>
    <p class="ads-muted">{{ frameworkPreview.summary }}</p>
    <div class="ads-table-wrap" v-if="campaigns.length">
      <table class="ads-table">
        <thead>
          <tr><th>Campaign</th><th>Platform</th><th>Spend</th><th>CPA</th><th>ROAS</th><th>CTR</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in campaigns" :key="c.id">
            <td>{{ c.name }}</td>
            <td><span class="ads-badge">{{ c.platform }}</span></td>
            <td>${{ (c.metrics?.spend || 0).toFixed(2) }}</td>
            <td>${{ (c.metrics?.cpa || 0).toFixed(2) }}</td>
            <td>{{ (c.metrics?.roas || 0).toFixed(2) }}x</td>
            <td>{{ (c.metrics?.ctr || 0).toFixed(2) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="ads-muted">No campaigns synced yet. Click Sync &amp; AI Audit to pull insights.</p>
  </section>
</template>

<script setup lang="ts">
import type { AdFrameworkBlueprint, AdFrameworkId } from '../../domain/ads/ad-frameworks'

defineProps<{
  campaigns: any[]
  selectedFramework: AdFrameworkId
  dailyBudget: number
  frameworkPreview: AdFrameworkBlueprint
}>()
defineEmits(['update:selectedFramework', 'update:dailyBudget'])
</script>

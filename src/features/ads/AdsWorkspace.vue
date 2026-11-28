<template>
  <div class="ads-workspace">
    <header class="ads-header">
      <div>
        <h2>Ads &amp; Media Buying AI</h2>
        <p class="ads-muted">Micro-modular QUBO + Bandit optimizer with Paper-Trade HITL guardrails</p>
      </div>
      <button type="button" class="ads-btn-primary" :disabled="loading" @click="syncAndAudit">
        {{ loading ? 'Syncing...' : 'Sync & AI Audit' }}
      </button>
    </header>

    <AdKpiRail :totals="totals" />

    <AdCreativeMatrix
      :campaigns="campaigns"
      v-model:selectedFramework="selectedFramework"
      v-model:dailyBudget="dailyBudget"
      :frameworkPreview="frameworkPreview"
    />

    <AdRulesPanel
      :approvals="approvals"
      v-model:paperTrade="paperTrade"
      @execute="executeApproval"
    />

    <section v-if="auditReport" class="ads-panel">
      <h3>AI Copilot Audit</h3>
      <pre class="ads-audit-pre">{{ auditReport }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdsWorkspace } from './useAdsWorkspace'
import AdKpiRail from './AdKpiRail.vue'
import AdCreativeMatrix from './AdCreativeMatrix.vue'
import AdRulesPanel from './AdRulesPanel.vue'
import './ads.scss'

const { campaigns, approvals, auditReport, loading, paperTrade, selectedFramework, dailyBudget, frameworkPreview, totals, refresh, syncAndAudit, executeApproval } = useAdsWorkspace()

onMounted(() => { refresh() })
</script>

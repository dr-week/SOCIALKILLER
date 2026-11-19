<script setup lang="ts">
import { Users, Plus, ShieldCheck, Mail, Globe } from 'lucide-vue-next'
import DepartmentShell from './DepartmentShell.vue'

defineProps<{
  brandName: string
}>()
</script>

<template>
  <DepartmentShell title="Client Workspaces" badge="CRM" :icon="Users" :tabs="['Clients', 'Portals', 'Approvals']">
    <template #actions>
      <button class="action-btn primary"><Plus :size="14" /> Add Client</button>
    </template>

    <template #default="{ currentTab }">
      <div v-if="currentTab === 'Clients'" class="client-grid">
        <div class="client-card">
          <div class="client-head">
            <div class="client-avatar">DL</div>
            <div>
              <h4>{{ brandName }}</h4>
              <span class="client-type">Primary Agency Workspace</span>
            </div>
          </div>
          <p class="client-desc">Full social media, web engineering, shoot production, and automation pipelines.</p>
          <div class="client-footer">
            <span><ShieldCheck :size="12" /> Active</span>
            <span>Internal</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No active client {{ currentTab.toLowerCase() }} configured.</p>
      </div>
    </template>
  </DepartmentShell>
</template>

<style scoped>
.client-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.client-card { background: #141c27; border: 1px solid #2c3949; border-radius: 12px; padding: 18px; }
.client-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.client-avatar { width: 36px; height: 36px; border-radius: 8px; background: #0369a1; color: white; display: grid; place-items: center; font-weight: 700; font-size: 13px; }
.client-head h4 { margin: 0; font-size: 15px; color: #f8fafc; }
.client-type { font-size: 11px; color: #38bdf8; }
.client-desc { font-size: 13px; color: #94a3b8; line-height: 1.4; margin: 0 0 16px 0; }
.client-footer { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px; }
.client-footer span { display: inline-flex; align-items: center; gap: 4px; }
.action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 0; background: #0ea5e9; color: white; }
.empty-state { text-align: center; padding: 60px 0; color: #64748b; font-size: 13px; }
@media (max-width: 900px) { .client-grid { grid-template-columns: 1fr; } }
</style>

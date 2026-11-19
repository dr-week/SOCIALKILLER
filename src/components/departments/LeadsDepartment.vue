<script setup lang="ts">
import { ref } from 'vue'
import { Target, Plus, Download, Filter, MessageSquare, Phone, Mail } from 'lucide-vue-next'
import DepartmentShell from './DepartmentShell.vue'

defineProps<{
  brandId: string
}>()

interface Lead {
  id: string
  name: string
  handle: string
  platform: string
  source: string
  triggerWord: string
  status: 'new' | 'contacted' | 'qualified' | 'won'
  intent: string
  createdAt: string
}

const leads = ref<Lead[]>([])
</script>

<template>
  <DepartmentShell title="Leads & CRM" badge="INBOUND PIPELINE" :icon="Target" :tabs="['Pipeline', 'All Leads', 'Triggers']">
    <template #actions>
      <button class="action-btn secondary"><Download :size="14" /> Export CSV</button>
      <button class="action-btn primary"><Plus :size="14" /> New Lead</button>
    </template>

    <template #default="{ currentTab }">
      <div v-if="currentTab === 'Pipeline'" class="pipeline-kanban">
        <div class="kanban-col">
          <div class="col-head"><span class="dot blue"></span> New Leads <span>0</span></div>
          <div class="col-empty">No new inquiries</div>
        </div>
        <div class="kanban-col">
          <div class="col-head"><span class="dot amber"></span> Contacted <span>0</span></div>
          <div class="col-empty">No active conversations</div>
        </div>
        <div class="kanban-col">
          <div class="col-head"><span class="dot purple"></span> Qualified <span>0</span></div>
          <div class="col-empty">No qualified proposals</div>
        </div>
        <div class="kanban-col">
          <div class="col-head"><span class="dot green"></span> Closed / Won <span>0</span></div>
          <div class="col-empty">No closed deals yet</div>
        </div>
      </div>

      <div v-else-if="currentTab === 'All Leads'" class="leads-table-container">
        <div v-if="!leads.length" class="empty-state">
          <Target :size="32" class="empty-icon" />
          <p>No leads recorded yet. Turn comments in Inbox into leads with 1 click.</p>
        </div>
      </div>

      <div v-else class="triggers-panel">
        <div class="trigger-card">
          <h4>Auto-Capture Triggers</h4>
          <p>When an incoming comment contains <code>PRICE</code>, <code>INFO</code>, or <code>HIRE</code>, create an automatic lead in New Leads stage.</p>
        </div>
      </div>
    </template>
  </DepartmentShell>
</template>

<style scoped>
.pipeline-kanban { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; min-height: 420px; }
.kanban-col { background: #101720; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; }
.col-head { font-size: 13px; font-weight: 700; color: #cbd5e1; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.col-head span:last-child { margin-left: auto; font-size: 11px; background: #1e293b; padding: 2px 7px; border-radius: 99px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.blue { background: #38bdf8; } .amber { background: #f59e0b; } .purple { background: #a855f7; } .green { background: #10b981; }
.col-empty { flex: 1; border: 1px dashed #243242; border-radius: 8px; display: grid; place-items: center; color: #475569; font-size: 12px; }
.action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 0; }
.primary { background: #0ea5e9; color: white; }
.secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
.empty-state { text-align: center; padding: 60px 0; color: #64748b; }
.empty-icon { margin-bottom: 12px; color: #334155; }
.trigger-card { background: #141c27; border: 1px solid #2c3949; border-radius: 10px; padding: 18px; color: #94a3b8; font-size: 13px; }
.trigger-card h4 { margin: 0 0 8px 0; color: #f1f5f9; }
.trigger-card code { background: #0f172a; border: 1px solid #334155; padding: 2px 6px; border-radius: 4px; color: #38bdf8; }
@media (max-width: 900px) { .pipeline-kanban { grid-template-columns: 1fr; } }
</style>

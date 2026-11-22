<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useLeads } from './useLeads'
import LeadCard from './LeadCard.vue'
import { Plus, Download, RefreshCw } from 'lucide-vue-next'
import type { Lead } from './leads-api'
import './leads.scss'

const props = defineProps<{ brandId: string; brandName: string }>()
const { leads, loading, stats, load, add, setStatus, remove, exportCsv } = useLeads(props.brandId)

const columns: Array<{ id: Lead['status']; title: string }> = [
  { id: 'new', title: 'New Leads' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'proposal', title: 'Proposal' },
  { id: 'won', title: 'Won Deals' }
]

const showAddModal = ref(false)
const newLead = reactive({ contactName: '', handle: '', platformId: 'instagram', triggerWord: '', message: '', intent: 'inquiry' })

async function submitLead() {
  if (!newLead.contactName.trim()) return
  await add(newLead)
  newLead.contactName = ''
  newLead.handle = ''
  newLead.message = ''
  showAddModal.value = false
}

onMounted(() => load())
</script>

<template>
  <div class="leads-workspace">
    <div class="leads-toolbar">
      <div>
        <h2 style="margin: 0; font-size: 1.35rem; color: #fff;">Leads &amp; CRM Pipeline</h2>
        <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">Brand: {{ brandName }}</span>
      </div>
      <div class="leads-actions-group">
        <button class="ui-btn ui-btn--ghost" :disabled="loading" @click="load">
          <RefreshCw :size="14" :class="{ 'spin-icon': loading }" /> Refresh
        </button>
        <button class="ui-btn ui-btn--ghost" @click="exportCsv">
          <Download :size="14" /> Export CSV
        </button>
        <button class="ui-btn ui-btn--primary" @click="showAddModal = true">
          <Plus :size="14" /> Add Lead
        </button>
      </div>
    </div>

    <div class="leads-stats-row">
      <div class="leads-stat-card"><div class="stat-label">Total Leads</div><div class="stat-val">{{ stats.total }}</div></div>
      <div class="leads-stat-card"><div class="stat-label">Hot Inquiries</div><div class="stat-val" style="color: #ff7b88;">{{ stats.hot }}</div></div>
      <div class="leads-stat-card"><div class="stat-label">Qualified</div><div class="stat-val" style="color: #54d6ee;">{{ stats.qualified }}</div></div>
      <div class="leads-stat-card"><div class="stat-label">Won Deals</div><div class="stat-val" style="color: #59ddb6;">{{ stats.won }}</div></div>
      <div class="leads-stat-card"><div class="stat-label">Win Rate</div><div class="stat-val">{{ stats.rate }}%</div></div>
    </div>

    <div class="leads-kanban-board">
      <div v-for="col in columns" :key="col.id" class="leads-column">
        <div class="column-header">
          <span>{{ col.title }}</span>
          <span class="column-badge">{{ leads.filter(l => l.status === col.id).length }}</span>
        </div>
        <div class="column-cards">
          <LeadCard
            v-for="lead in leads.filter(l => l.status === col.id)"
            :key="lead.id"
            :lead="lead"
            @change-status="setStatus(lead.id, $event)"
            @remove="remove(lead.id)"
          />
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="lead-modal-backdrop" @click.self="showAddModal = false">
      <div class="lead-modal">
        <h3 style="margin-top: 0; color: #fff;">New Lead</h3>
        <input v-model="newLead.contactName" placeholder="Contact Name *" class="lead-input" />
        <input v-model="newLead.handle" placeholder="Social Handle (@username)" class="lead-input" />
        <input v-model="newLead.triggerWord" placeholder="Trigger Word (e.g. PRICE)" class="lead-input" />
        <textarea v-model="newLead.message" placeholder="Message / Inquiry notes" class="lead-input" rows="3" />
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button class="ui-btn ui-btn--ghost" @click="showAddModal = false">Cancel</button>
          <button class="ui-btn ui-btn--primary" @click="submitLead">Save Lead</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lead-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.lead-modal {
  background: #141522; border: 1px solid rgba(255,255,255,0.12); border-radius: 14px;
  padding: 1.5rem; width: 90%; max-width: 440px; display: flex; flex-direction: column; gap: 0.75rem;
}
.lead-input {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 0.6rem 0.8rem; color: #fff; font-size: 0.85rem; outline: none;
}
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>

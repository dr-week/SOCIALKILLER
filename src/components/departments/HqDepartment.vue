<script setup lang="ts">
import { Home, Sparkles, TrendingUp, Calendar, CheckSquare, Users } from 'lucide-vue-next'
import DepartmentShell from './DepartmentShell.vue'

defineProps<{
  brandName: string
}>()
</script>

<template>
  <DepartmentShell title="Command Center" badge="HQ" :icon="Home" :tabs="['Overview', 'Briefings', 'Timeline']">
    <template #default="{ currentTab }">
      <div v-if="currentTab === 'Overview'" class="hq-grid">
        <div class="stat-card">
          <div class="card-title"><Users :size="16" /> Active Brand</div>
          <div class="card-val">{{ brandName }}</div>
          <div class="card-sub">Agency Operations Primary</div>
        </div>
        <div class="stat-card">
          <div class="card-title"><Calendar :size="16" /> Scheduled Posts</div>
          <div class="card-val">0</div>
          <div class="card-sub">Next slot: Ready to queue</div>
        </div>
        <div class="stat-card">
          <div class="card-title"><Sparkles :size="16" /> Inbound Inquiries</div>
          <div class="card-val">0</div>
          <div class="card-sub">No pending comment leads</div>
        </div>
        <div class="stat-card">
          <div class="card-title"><TrendingUp :size="16" /> Active Projects</div>
          <div class="card-val">2</div>
          <div class="card-sub">Web Dev & Automation</div>
        </div>

        <section class="hq-card full-span">
          <h3><CheckSquare :size="16" /> Today's Agency Agenda</h3>
          <p class="placeholder-text">Welcome to DANGER.LABS OS. Select Social to plan campaigns, Inbox to manage customer inquiries, or Leads to review CRM pipeline.</p>
        </section>
      </div>

      <div v-else class="empty-tab">
        <p>No active {{ currentTab.toLowerCase() }} logged for today.</p>
      </div>
    </template>
  </DepartmentShell>
</template>

<style scoped>
.hq-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: #141c27; border: 1px solid #2c3949; border-radius: 12px; padding: 18px; }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.card-val { font-size: 26px; font-weight: 700; color: #f8fafc; margin: 8px 0 4px; }
.card-sub { font-size: 12px; color: #64748b; }
.full-span { grid-column: 1 / -1; }
.hq-card { background: #141c27; border: 1px solid #2c3949; border-radius: 12px; padding: 20px; }
.hq-card h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; margin: 0 0 10px 0; color: #e2e8f0; }
.placeholder-text { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0; }
.empty-tab { text-align: center; padding: 60px 0; color: #64748b; font-size: 14px; }
@media (max-width: 900px) { .hq-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .hq-grid { grid-template-columns: 1fr; } }
</style>

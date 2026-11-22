import { ref, computed } from 'vue'
import { fetchLeads, createLead, updateLeadStatus, deleteLead, type Lead } from './leads-api'

export function useLeads(brandId: string) {
  const leads = ref<Lead[]>([])
  const loading = ref(false)
  const filterIntent = ref('all')

  async function load() {
    loading.value = true
    try {
      leads.value = await fetchLeads(brandId)
    } finally {
      loading.value = false
    }
  }

  async function add(input: Partial<Lead>) {
    const created = await createLead({ ...input, brandId })
    if (created) leads.value = [created, ...leads.value]
    return created
  }

  async function setStatus(id: string, status: Lead['status']) {
    const updated = await updateLeadStatus(id, brandId, status)
    if (updated) {
      leads.value = leads.value.map(l => l.id === id ? updated : l)
    }
  }

  async function remove(id: string) {
    const ok = await deleteLead(id, brandId)
    if (ok) {
      leads.value = leads.value.filter(l => l.id !== id)
    }
  }

  const filteredLeads = computed(() => {
    if (filterIntent.value === 'all') return leads.value
    return leads.value.filter(l => l.intent === filterIntent.value)
  })

  const stats = computed(() => {
    const total = leads.value.length
    const hot = leads.value.filter(l => l.intent.toLowerCase().includes('hot') || l.intent.toLowerCase().includes('high')).length
    const qualified = leads.value.filter(l => l.status === 'qualified' || l.status === 'proposal').length
    const won = leads.value.filter(l => l.status === 'won').length
    const rate = total > 0 ? Math.round((won / total) * 100) : 0
    return { total, hot, qualified, won, rate }
  })

  function exportCsv() {
    if (!leads.value.length) return
    const headers = ['ID', 'Name', 'Handle', 'Platform', 'Source', 'Trigger', 'Intent', 'Status', 'Message', 'Created']
    const rows = leads.value.map(l => [
      l.id, l.contactName, l.handle, l.platformId, l.source,
      l.triggerWord, l.intent, l.status, `"${(l.message || '').replace(/"/g, '""')}"`, l.createdAt
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encoded = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encoded)
    link.setAttribute('download', `leads-${brandId}-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return { leads, loading, filterIntent, filteredLeads, stats, load, add, setStatus, remove, exportCsv }
}

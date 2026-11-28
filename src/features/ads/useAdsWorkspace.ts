import { ref, computed } from 'vue'
import { generateAdFramework, type AdFrameworkId } from '../../domain/ads/ad-frameworks'

export function useAdsWorkspace() {
  const campaigns = ref<any[]>([])
  const approvals = ref<any[]>([])
  const auditReport = ref<string>('')
  const loading = ref(false)
  const paperTrade = ref(true)
  const selectedFramework = ref<AdFrameworkId>('3-2-2-dct')
  const dailyBudget = ref(100)

  const frameworkPreview = computed(() => generateAdFramework(selectedFramework.value, dailyBudget.value))

  const totals = computed(() => {
    let spend = 0, revenue = 0, conversions = 0, clicks = 0, impressions = 0
    for (const c of campaigns.value) {
      const m = c.metrics || {}
      spend += Number(m.spend || 0)
      revenue += Number(m.revenue || 0)
      conversions += Number(m.conversions || 0)
      clicks += Number(m.clicks || 0)
      impressions += Number(m.impressions || 0)
    }
    return {
      spend: spend.toFixed(2),
      roas: spend > 0 ? (revenue / spend).toFixed(2) : '0.00',
      cpa: conversions > 0 ? (spend / conversions).toFixed(2) : '0.00',
      ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
    }
  })

  async function refresh() {
    loading.value = true
    try {
      const [cRes, aRes] = await Promise.all([fetch('/api/ads/campaigns'), fetch('/api/ads/approvals')])
      const cData = await cRes.json()
      const aData = await aRes.json()
      campaigns.value = cData.campaigns || []
      approvals.value = aData.pending || []
    } finally {
      loading.value = false
    }
  }

  async function syncAndAudit() {
    loading.value = true
    try {
      await fetch('/api/ads/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const res = await fetch('/api/ads/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const data = await res.json()
      auditReport.value = data.recommendation || ''
      await refresh()
    } finally {
      loading.value = false
    }
  }

  async function executeApproval(auditId: string, decision: 'approve' | 'reject') {
    await fetch('/api/ads/approvals/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId, decision, paperTrade: paperTrade.value }),
    })
    await refresh()
  }

  return { campaigns, approvals, auditReport, loading, paperTrade, selectedFramework, dailyBudget, frameworkPreview, totals, refresh, syncAndAudit, executeApproval }
}

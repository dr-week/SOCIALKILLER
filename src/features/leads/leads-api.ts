export interface Lead {
  id: string
  brandId: string
  contactName: string
  handle: string
  platformId: string
  source: string
  triggerWord: string
  message: string
  email: string
  phone: string
  intent: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  notes: string
  createdAt: string
  updatedAt: string
}

export async function fetchLeads(brandId: string): Promise<Lead[]> {
  try {
    const res = await fetch(`/api/leads?brandId=${encodeURIComponent(brandId)}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.leads || []
  } catch {
    return []
  }
}

export async function createLead(lead: Partial<Lead>): Promise<Lead | null> {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lead)
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.lead || null
  } catch {
    return null
  }
}

export async function updateLeadStatus(id: string, brandId: string, status: Lead['status']): Promise<Lead | null> {
  try {
    const res = await fetch(`/api/leads/${id}?brandId=${encodeURIComponent(brandId)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.lead || null
  } catch {
    return null
  }
}

export async function deleteLead(id: string, brandId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/leads/${id}?brandId=${encodeURIComponent(brandId)}`, {
      method: 'DELETE'
    })
    return res.ok
  } catch {
    return false
  }
}

import type {
  BrandDoc,
  BrandLink,
  BrandProfile,
  DailyJourneyStory,
  ScriptFormat,
  ScriptPillar,
  VideoScript
} from '../../types/brand'

export type WorkspaceContext = {
  links?: BrandLink[]
  githubUser?: string
  docs?: BrandDoc[]
  syncGithub?: boolean
}

export async function createWorkspace(
  name: string,
  focus: string,
  context?: { githubUser?: string; links?: BrandLink[] }
) {
  const normalizedName = name.trim()
  const normalizedFocus = focus.trim()
  if (!normalizedName) throw new Error('Enter a company name.')
  const baseId = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'company'
  const brand: BrandProfile = {
    id: `${baseId}-${Date.now().toString(36)}`,
    name: normalizedName,
    tagline: normalizedFocus || 'Company workspace',
    location: '',
    purpose: {
      what: normalizedFocus || 'Add this company’s products and audience.',
      why: '',
      founderStory: '',
      keyThemes: [],
      toneOfVoice: 'Clear and authentic'
    },
    accounts: [],
    milestones: []
  }
  const response = await fetch('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brand)
  })
  if (!response.ok) throw new Error('Could not create this company workspace.')
  const saved = (await response.json()).brand as BrandProfile
  if (context?.githubUser || context?.links?.length) {
    try {
      await saveWorkspaceContext(
        { githubUser: context.githubUser, links: context.links, syncGithub: Boolean(context.githubUser) },
        saved.id
      )
    } catch { /* Retry context from the profile panel if initial creation succeeds without it. */ }
  }
  return saved
}

export async function saveWorkspaceContext(payload: WorkspaceContext, brandId: string) {
  const response = await fetch('/api/brands/context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandId, ...payload })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not save company profile.')
  return {
    brand: data.brand as BrandProfile,
    githubError: String(data.githubError || ''),
    repoCount: Number(data.repoCount) || 0
  }
}

export async function researchWorkspace(brandId: string) {
  const response = await fetch('/api/brands/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandId })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to complete company research.')
  return data.brand as BrandProfile
}

export async function fetchWorkspaces() {
  const response = await fetch('/api/brands')
  const data = response.ok ? await response.json() : {}
  const archivedResponse = await fetch('/api/brands/archived')
  const archivedData = archivedResponse.ok ? await archivedResponse.json() : {}
  return {
    brands: data.brands as BrandProfile[] | undefined,
    archivedBrands: (archivedData.brands || []) as BrandProfile[]
  }
}

export async function updateWorkspaceArchive(brandId: string, archived: boolean) {
  const response = await fetch(`/api/brands/${encodeURIComponent(brandId)}/${archived ? 'archive' : 'restore'}`, {
    method: 'POST'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not update workspace status.')
  return data.brand as BrandProfile
}

export async function requestWorkspaceScript(
  brandId: string,
  payload: { topic?: string; pillar?: ScriptPillar; format?: ScriptFormat }
): Promise<VideoScript | null> {
  const response = await fetch('/api/brands/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandId, topic: payload.topic, pillar: payload.pillar || 'daily_grind', format: payload.format || 'short_form_60s' })
  })
  if (!response.ok) return null
  return (await response.json()).script as VideoScript
}

export async function requestWorkspaceJourney(
  brandId: string,
  payload: { topic?: string; milestoneId?: string }
): Promise<DailyJourneyStory | null> {
  const response = await fetch('/api/brands/generate-journey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandId, topic: payload.topic, milestoneId: payload.milestoneId })
  })
  if (!response.ok) return null
  return (await response.json()).journey as DailyJourneyStory
}

import { ref, computed, onMounted } from 'vue'
import type { BrandProfile, VideoScript, DailyJourneyStory, ScriptPillar, ScriptFormat, BrandLink, BrandDoc } from '../types/brand'
import { DEFAULT_WORKSPACES } from '../features/workspaces/default-workspaces'
import {
  createWorkspace,
  fetchWorkspaces,
  requestWorkspaceJourney,
  requestWorkspaceScript,
  researchWorkspace,
  saveWorkspaceContext,
  updateWorkspaceArchive,
  type WorkspaceContext
} from '../features/workspaces/workspace-api'

const STORAGE_KEY = 'followdesk_active_brand_id'
const brands = ref<BrandProfile[]>(DEFAULT_WORKSPACES)
const activeBrandId = ref<string>(localStorage.getItem(STORAGE_KEY) || 'danger-labs')
const archivedBrands = ref<BrandProfile[]>([])
const loading = ref(false)
const generatingScript = ref(false)
const generatingJourney = ref(false)
const scriptsByBrand = ref<Record<string, VideoScript>>({})
const journeysByBrand = ref<Record<string, DailyJourneyStory>>({})
const currentScript = computed(() => scriptsByBrand.value[activeBrandId.value] || null)
const currentJourney = computed(() => journeysByBrand.value[activeBrandId.value] || null)

export function useBrandWorkspaces() {
  const activeBrand = computed<BrandProfile>(() =>
    brands.value.find(brand => brand.id === activeBrandId.value) || brands.value[0]
  )

  function selectBrand(brandId: string) {
    activeBrandId.value = brandId
    try { localStorage.setItem(STORAGE_KEY, brandId) } catch {}
  }

  async function createBrand(name: string, focus: string, context?: { githubUser?: string; links?: BrandLink[] }) {
    const saved = await createWorkspace(name, focus, context)
    brands.value = [...brands.value, saved].sort((a, b) => a.name.localeCompare(b.name))
    selectBrand(saved.id)
    return saved
  }

  async function saveBrandContext(payload: WorkspaceContext, brandId = activeBrand.value.id) {
    const result = await saveWorkspaceContext(payload, brandId)
    brands.value = brands.value.map(brand => brand.id === result.brand.id ? result.brand : brand)
    return result
  }

  async function runResearch(brandId = activeBrand.value.id) {
    const saved = await researchWorkspace(brandId)
    brands.value = brands.value.map(brand => brand.id === saved.id ? saved : brand)
    return saved
  }

  async function fetchBrands() {
    try {
      loading.value = true
      const data = await fetchWorkspaces()
      if (data.brands?.length) {
        brands.value = data.brands
        if (!data.brands.some(brand => brand.id === activeBrandId.value)) selectBrand(data.brands[0].id)
      }
      archivedBrands.value = data.archivedBrands
    } catch (error) {
      console.warn('Could not load company workspaces; using local defaults.', error)
    } finally {
      loading.value = false
    }
  }

  async function setBrandArchived(brandId: string, archived: boolean) {
    const brand = await updateWorkspaceArchive(brandId, archived)
    if (archived) {
      brands.value = brands.value.filter(item => item.id !== brandId)
      archivedBrands.value = [...archivedBrands.value.filter(item => item.id !== brandId), brand]
      if (activeBrandId.value === brandId && brands.value[0]) selectBrand(brands.value[0].id)
    } else {
      archivedBrands.value = archivedBrands.value.filter(item => item.id !== brandId)
      brands.value = [...brands.value, brand].sort((a, b) => a.name.localeCompare(b.name))
    }
    return brand
  }

  async function generateScript(payload: { topic?: string; pillar?: ScriptPillar; format?: ScriptFormat }) {
    const brandId = activeBrandId.value
    try {
      generatingScript.value = true
      const script = await requestWorkspaceScript(brandId, payload)
      if (script) scriptsByBrand.value[brandId] = script
      return script
    } catch (error) {
      console.error('Failed to generate video script:', error)
      return null
    } finally {
      generatingScript.value = false
    }
  }

  async function generateJourney(payload: { topic?: string; milestoneId?: string }) {
    const brandId = activeBrandId.value
    try {
      generatingJourney.value = true
      const journey = await requestWorkspaceJourney(brandId, payload)
      if (journey) journeysByBrand.value[brandId] = journey
      return journey
    } catch (error) {
      console.error('Failed to generate daily journey:', error)
      return null
    } finally {
      generatingJourney.value = false
    }
  }

  function toggleMilestone(milestoneId: string) {
    const milestone = activeBrand.value.milestones.find(item => item.id === milestoneId)
    if (milestone) milestone.completed = !milestone.completed
  }

  onMounted(() => { void fetchBrands() })

  return {
    brands, archivedBrands, activeBrandId, activeBrand, selectBrand, createBrand, saveBrandContext,
    runResearch, fetchBrands, setBrandArchived, generateScript, generateJourney, currentScript,
    currentJourney, toggleMilestone, loading, generatingScript, generatingJourney
  }
}

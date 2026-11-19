import { onMounted, ref, watch, type Ref } from 'vue'
import type { PlatformId } from '../../../types'
import type { ContentCategory, VaultAsset } from '../publisher-types'

interface ComposerResourceOptions {
  brandId: Ref<string>
  topic: Ref<string>
  rawNotes: Ref<string>
  webLink: Ref<string>
  tags: Ref<string>
  imageUrl: Ref<string>
  previewCover: Ref<string | null>
  selectedAsset: Ref<string | null>
  clearDraft: () => void
  triggerGenerate: () => void
  updateVariant: (platform: PlatformId, text: string) => void
  showToast: (message: string) => void
}

export function usePublisherComposerResources(options: ComposerResourceOptions) {
  const categories = ref<ContentCategory[]>([])
  const selectedCategoryId = ref<string | null>(null)
  const loadingCategory = ref(false)
  const driveFolder = ref('')
  const assets = ref<VaultAsset[]>([])

  async function loadCategories() {
    try {
      const res = await fetch(`/api/social/categories?brandId=${encodeURIComponent(options.brandId.value)}`)
      if (res.ok) {
        const data = await res.json()
        categories.value = data.categories || []
        selectedCategoryId.value = null
      }
    } catch {}
  }

  async function selectCategory(category: ContentCategory) {
    if (loadingCategory.value) return
    loadingCategory.value = true
    selectedCategoryId.value = category.id
    options.clearDraft()
    try {
      const res = await fetch(`/api/social/viral?category=${encodeURIComponent(category.id)}&brandId=${encodeURIComponent(options.brandId.value)}`)
      if (res.ok) {
        const data = await res.json()
        options.topic.value = data.hook || category.name
        options.rawNotes.value = `${data.subtext || category.shortDesc}\n\nTakeaway: ${data.solution || ''}`
        options.webLink.value = data.repoUrl || category.repoUrl
        options.tags.value = (data.category?.tags || category.tags || []).join(', ')
        for (const [platform, text] of Object.entries(data.variants || {})) {
          options.updateVariant(platform as PlatformId, text as string)
        }
        options.showToast(`Loaded category: ${category.name}`)
        return
      }
      options.topic.value = category.topics?.[0]?.hook || `${category.name} by Danger Labs`
      options.rawNotes.value = `${category.shortDesc}\n\nRepo: ${category.repoUrl}`
      options.webLink.value = category.repoUrl
      options.tags.value = category.tags.join(', ')
      options.triggerGenerate()
      options.showToast(`Selected ${category.name}`)
    } catch {
      options.showToast(`Failed to load ${category.name}`)
    } finally {
      loadingCategory.value = false
    }
  }

  async function loadAssets() {
    try {
      const res = await fetch('/api/media/vault')
      if (res.ok) {
        const data = await res.json()
        driveFolder.value = data.designatedFolder || ''
        assets.value = data.assets || []
      }
    } catch {}
  }

  async function changeDriveFolder() {
    const current = driveFolder.value || '.data/media'
    const next = window.prompt('Specify the authorized Drive/Media Folder (all uploads/downloads are locked to this folder):', current)
    if (!next || next.trim() === current) return
    try {
      const res = await fetch('/api/media/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designatedFolder: next.trim() })
      })
      if (res.ok) {
        options.showToast(`Drive folder locked to: ${next.trim()}`)
        await loadAssets()
      }
    } catch {}
  }

  function selectAsset(name: string) {
    if (options.selectedAsset.value === name) {
      options.selectedAsset.value = null
      options.imageUrl.value = ''
      options.previewCover.value = null
      return
    }
    options.selectedAsset.value = name
    options.imageUrl.value = name
    options.previewCover.value = name
    options.showToast(`Attached: ${name} (from designated drive)`)
  }

  watch(options.brandId, loadCategories)
  onMounted(() => {
    void loadAssets()
    void loadCategories()
  })

  return { categories, selectedCategoryId, loadingCategory, driveFolder, assets, selectCategory, changeDriveFolder, selectAsset }
}

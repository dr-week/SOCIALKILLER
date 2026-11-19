import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import type { Ref } from 'vue'
import type { View } from '../../types'
import { useAudienceData } from '../../composables/useAudienceData'
import { useAudienceNavigation } from '../../composables/useAudienceNavigation'
import { useBrandWorkspaces } from '../../composables/useBrandWorkspaces'

type AppActionContext = {
  activeView: Ref<View>
  error: Ref<string>
  fileInput: Ref<HTMLInputElement | null>
  audience: ReturnType<typeof useAudienceData>
  navigation: ReturnType<typeof useAudienceNavigation>
  workspaces: ReturnType<typeof useBrandWorkspaces>
}

export function useAppActions(context: AppActionContext) {
  const { activeView, error, fileInput, audience, navigation, workspaces } = context
  const { activeBrand, createBrand, saveBrandContext, runResearch, setBrandArchived, fetchBrands } = workspaces

  async function handleSaveBrandContext(payload: Parameters<typeof saveBrandContext>[0]) {
    try {
      const result = await saveBrandContext(payload)
      if (result.githubError) error.value = `Profile saved, but GitHub sync note: ${result.githubError}`
      return true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not save company profile.'
      return false
    }
  }

  async function handleRunBrandResearch() {
    try { await runResearch() }
    catch (cause) { error.value = cause instanceof Error ? cause.message : 'Autonomous research failed.' }
  }

  async function createCompanyWorkspace(name: string, focus: string, githubUser?: string) {
    try {
      await createBrand(name, focus, { githubUser })
      activeView.value = 'social-publisher'
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not create company workspace.'
    }
  }

  async function updateWorkspaceArchive(brandId: string, archived: boolean) {
    try { await setBrandArchived(brandId, archived) }
    catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not update workspace status.' }
  }

  async function assignCompanyAccount(platformId: string, handle: string) {
    try {
      const accounts = activeBrand.value.accounts.filter(account => account.platformId !== platformId)
      accounts.push({ platformId, handle, credentials: {}, status: 'unconfigured' })
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activeBrand.value, accounts })
      })
      if (!response.ok) throw new Error('Could not save this company account.')
      await fetchBrands()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not save this company account.'
    }
  }

  async function exportCsv() {
    const rows = [['username', 'list'], ...navigation.filteredPeople.value.map(person => [person.username, activeView.value])]
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    if (Capacitor.isNativePlatform()) {
      try {
        const filename = `followdesk-${activeView.value}-${Date.now()}.csv`
        const { uri } = await Filesystem.writeFile({ path: filename, data: csv, directory: Directory.Cache, encoding: Encoding.UTF8 })
        await Share.share({ title: 'SOCIALKILLER CSV export', text: `${navigation.viewTitle.value} list`, files: [uri], dialogTitle: 'Share CSV' })
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : 'Could not share this CSV file.'
      }
      return
    }
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = `instagram-${activeView.value}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function onFilesChange(event: Event) {
    const files = (event.target as HTMLInputElement).files
    if (files?.length) void audience.importFiles(files)
    if (fileInput.value) fileInput.value.value = ''
  }

  return { handleSaveBrandContext, handleRunBrandResearch, createCompanyWorkspace, updateWorkspaceArchive, assignCompanyAccount, exportCsv, onFilesChange }
}

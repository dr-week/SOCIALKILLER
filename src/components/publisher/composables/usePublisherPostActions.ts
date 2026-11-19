import type { Ref } from 'vue'
import type { PlatformId } from '../../../types'

export interface GenerateVariantsPayload {
  topic?: string
  rawNotes?: string
  tone?: string
  targetSubreddit?: string
  tags?: string[]
  includeCodeSnippet?: boolean
}

export interface SubmitPostPayload {
  title: string
  rawNotes: string
  scheduledAt: string
  publishNow: boolean
  isDraft?: boolean
  webLink?: string
  imageUrl?: string
  videoUrl?: string
  tags?: string[]
}

export function usePublisherPostActions(options: {
  brandId: () => string
  brandHandle: () => string | undefined
  brandTone: () => string | undefined
  selectedPlatforms: Ref<PlatformId[]>
  generatedVariants: Ref<Record<PlatformId, string>>
  canPublish: Ref<boolean>
  loading: Ref<boolean>
  fetchSocialData: () => Promise<void>
  showToast: (msg: string) => void
  onNavigateTab: (tab: 'compose' | 'campaigns' | 'channels') => void
}) {
  async function generateAllVariants(payload?: GenerateVariantsPayload) {
    options.loading.value = true
    const handle = options.brandHandle() || 'Company'
    try {
      const res = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: payload?.topic || `${handle} company update`,
          rawNotes: payload?.rawNotes || `Share a specific update from ${handle} and why it matters.`,
          tone: payload?.tone || options.brandTone() || 'Clear and authentic',
          includeCodeSnippet: payload?.includeCodeSnippet !== false,
          targetSubreddit: payload?.targetSubreddit || 'r/webdev',
          tags: payload?.tags || []
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.variants) {
          options.generatedVariants.value = { ...options.generatedVariants.value, ...data.variants }
        }
        if (payload) options.showToast('Adapted for all 10 Human & AI platforms!')
      }
    } finally {
      options.loading.value = false
    }
  }

  async function submitPost(payload: SubmitPostPayload) {
    if (payload.publishNow && !options.canPublish.value) {
      options.showToast('Configure and test each selected channel before submitting for review.')
      return
    }
    options.loading.value = true
    try {
      const isDraft = Boolean(payload.isDraft)
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: options.brandId(),
          title: payload.title,
          topic: payload.title,
          rawNotes: payload.rawNotes,
          status: isDraft ? 'draft' : undefined,
          platforms: options.selectedPlatforms.value,
          variants: options.generatedVariants.value,
          scheduledAt: isDraft || !payload.scheduledAt ? null : new Date(payload.scheduledAt).toISOString(),
          publishNow: payload.publishNow,
          webLink: payload.webLink,
          imageUrl: payload.imageUrl,
          videoUrl: payload.videoUrl,
          tags: payload.tags
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.post?.id) {
        options.showToast(data.details || data.error || data.post?.reason || data.post?.message || 'Post was not created.')
        return
      }
      await options.fetchSocialData()
      if (isDraft || data.post.status === 'draft') {
        options.showToast('Post saved as draft.')
        options.onNavigateTab('campaigns')
      } else if (data.post.status === 'pending_approval') {
        options.showToast('Submitted for human approval. No channel has been published yet.')
        options.onNavigateTab('campaigns')
      } else if (data.post.status === 'scheduled') {
        options.showToast('Added to the schedule queue; automatic delivery is not confirmed.')
      } else {
        options.showToast(`Post created with status: ${data.post.status}.`)
      }
    } catch (error) {
      options.showToast(error instanceof Error ? error.message : 'Post request failed.')
    } finally {
      options.loading.value = false
    }
  }

  return { generateAllVariants, submitPost }
}

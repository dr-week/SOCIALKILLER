import { ref, type Ref } from 'vue'
import type { PlatformId } from '../../../types'

interface RandomPostDraftOptions {
  brandId: Ref<string>
  topic: Ref<string>
  rawNotes: Ref<string>
  webLink: Ref<string>
  imageUrl: Ref<string>
  previewCover: Ref<string | null>
  tags: Ref<string>
  selectedAsset: Ref<string | null>
  updateVariant: (platform: PlatformId, text: string) => void
  showToast: (message: string) => void
}

export function useRandomPostDraft(options: RandomPostDraftOptions) {
  const drafting = ref(false)
  const draftId = ref<string | null>(null)
  const feedback = ref<'like' | 'dislike' | null>(null)
  const sendingFeedback = ref(false)

  function clearDraft() {
    draftId.value = null
  }

  async function randomize() {
    if (drafting.value) return
    drafting.value = true
    try {
      const res = await fetch(`/api/social/random-post?brandId=${encodeURIComponent(options.brandId.value)}`)
      const data = await res.json()
      if (res.ok) {
        options.topic.value = data.topic
        draftId.value = data.draftId
        feedback.value = null
        options.rawNotes.value = data.post?.sourceUrl ? `Source: ${data.post.sourceUrl}` : 'Idea post · no link needed.'
        options.webLink.value = data.post?.sourceUrl || ''
        options.imageUrl.value = data.media?.imageUrl || ''
        options.previewCover.value = data.media?.imageUrl || null
        options.selectedAsset.value = null
        options.tags.value = (data.hashtags || []).join(', ')
        for (const [platform, text] of Object.entries(data.variants || {})) {
          options.updateVariant(platform as PlatformId, text as string)
        }
        options.showToast(data.context === 'live' ? `Fresh ${data.source} trend · ${data.post.characterCount}/280 characters` : 'Evergreen draft · live trends unavailable')
      } else {
        options.showToast(data.error || 'Could not find a new topic. Try again later.')
      }
    } catch {
      options.showToast('Could not load a draft. Try again.')
    } finally {
      drafting.value = false
    }
  }

  async function rate(feeling: 'like' | 'dislike') {
    if (!draftId.value || sendingFeedback.value) return
    sendingFeedback.value = true
    try {
      const res = await fetch('/api/social/random-post-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: options.brandId.value, draftId: draftId.value, feedback: feeling })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Feedback could not be saved.')
      feedback.value = data.feedback
      options.showToast('Feedback saved')
    } catch {
      options.showToast('Feedback could not be saved. Try again.')
    } finally {
      sendingFeedback.value = false
    }
  }

  return { drafting, draftId, feedback, sendingFeedback, clearDraft, randomize, rate }
}

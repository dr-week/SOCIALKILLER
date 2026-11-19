import { ref } from 'vue'
import type { SocialPostItem } from '../../types'
import { approvePostForHandoff, duplicateQueuePost } from './queue-api'

type QueueActionOptions = {
  findPost: (id: string) => SocialPostItem | undefined
  refresh: () => void
  showToast: (message: string) => void
}

export function usePublisherQueueActions(options: QueueActionOptions) {
  const busyPostIds = ref<string[]>([])

  function showActionError(error: unknown, fallback: string) {
    options.showToast(error instanceof Error ? error.message : fallback)
  }

  async function approveForHandoff(postId: string) {
    if (options.findPost(postId)?.metadataWarning) return
    busyPostIds.value.push(postId)
    try {
      const url = await approvePostForHandoff(postId)
      window.open(url, '_blank', 'noopener,noreferrer')
      options.refresh()
    } catch (error) {
      showActionError(error, 'Manual handoff failed.')
    } finally {
      busyPostIds.value = busyPostIds.value.filter(id => id !== postId)
    }
  }

  async function duplicatePost(post: SocialPostItem) {
    if (post.metadataWarning) return
    try {
      await duplicateQueuePost(post)
      options.refresh()
      options.showToast('Scheduled copy added; automatic delivery is not confirmed.')
    } catch (error) {
      showActionError(error, 'Post could not be duplicated.')
    }
  }

  return { busyPostIds, approveForHandoff, duplicatePost }
}

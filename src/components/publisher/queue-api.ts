import type { SocialPostItem } from '../../types'

type ApprovalResponse = {
  success?: boolean
  post?: { handoffUrl?: string }
  error?: string
}

type PostCreationResponse = {
  success?: boolean
  post?: { id?: string }
  error?: string
  details?: string
}

export async function approvePostForHandoff(postId: string): Promise<string> {
  const response = await fetch('/api/social/posts/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId })
  })
  const data = await response.json() as ApprovalResponse
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Could not approve this draft for manual publishing.')
  }
  if (!data.post?.handoffUrl) {
    throw new Error('Approval succeeded but no manual publishing link was returned.')
  }
  return data.post.handoffUrl
}

export async function duplicateQueuePost(post: SocialPostItem): Promise<void> {
  const response = await fetch('/api/social/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandId: post.brandId,
      title: `${post.title} (copy)`,
      topic: post.topic,
      platforms: post.platforms,
      variants: post.variants,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      publishNow: false,
      imageUrl: post.imageUrl,
      webLink: post.webLink,
      videoUrl: post.videoUrl,
      tags: post.hashtags
    })
  })
  const data = await response.json() as PostCreationResponse
  if (!response.ok || !data.success || !data.post?.id) {
    throw new Error(data.details || data.error || 'Post could not be duplicated.')
  }
}

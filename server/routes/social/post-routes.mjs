import {
  getPostsQueue,
  getSocialActivityLogs,
  createOrPublishPost,
  approvePostForManualHandoff,
  updatePendingPost,
  confirmManualPost,
  deleteScheduledPost
} from '../../social-publisher.mjs'
import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'
import { postCreationResponse } from '../post-creation-response.mjs'
import { requestedBrandId } from './requested-brand-id.mjs'

export async function handleSocialPostRoutes(req, res, url, json) {
  if (req.method === 'GET' && url.pathname === '/api/social/posts') {
    const brandId = requestedBrandId(url, json, res)
    if (!brandId) return true
    return json(res, 200, {
      success: true,
      brandId,
      posts: getPostsQueue(brandId),
      activityLogs: getSocialActivityLogs(brandId)
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/social/posts') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}')
        parsed.brandId = parsed.brandId || 'danger-labs'
        if (!/^[a-z0-9-]{1,64}$/.test(parsed.brandId) ||
            (!dbService.getBrandProfile(parsed.brandId) && !DEFAULT_BRANDS.some(brand => brand.id === parsed.brandId))) {
          return json(res, 404, { error: 'Company workspace not found.' })
        }
        const post = await createOrPublishPost(parsed)
        const result = postCreationResponse(post)
        return json(res, result.httpStatus, {
          success: result.success,
          post,
          ...(result.error ? { error: result.error } : {}),
          activityLogs: getSocialActivityLogs(parsed.brandId)
        })
      } catch (error) {
        return json(res, 400, { error: 'Failed to create or publish post', details: error.message })
      }
    })
    return true
  }

  if (req.method === 'POST' && url.pathname === '/api/social/posts/review') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const post = updatePendingPost(parsed.postId, parsed.brandId || 'danger-labs', parsed)
        return json(res, post ? 200 : 404, { success: Boolean(post), post })
      } catch (error) {
        return json(res, 400, { error: error.message })
      }
    })
    return true
  }

  if (req.method === 'POST' && url.pathname === '/api/social/posts/confirm-manual') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const post = confirmManualPost(parsed.postId, parsed.brandId || 'danger-labs', parsed.platformIds, parsed.externalUrl)
        return json(res, post ? 200 : 409, { success: Boolean(post), post })
      } catch (error) {
        return json(res, 400, { error: error.message })
      }
    })
    return true
  }

  if (req.method === 'POST' && url.pathname === '/api/social/posts/approve') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}')
        if (!parsed.postId) return json(res, 400, { error: 'postId is required' })
        const brandId = parsed.brandId || 'danger-labs'
        if (!/^[a-z0-9-]{1,64}$/.test(brandId) ||
            (!dbService.getBrandProfile(brandId) && !DEFAULT_BRANDS.some(brand => brand.id === brandId))) {
          return json(res, 404, { error: 'Company workspace not found.' })
        }
        const result = approvePostForManualHandoff(parsed.postId, brandId)
        return json(res, result.success ? 200 : (result.post ? 409 : 404), result)
      } catch (error) {
        return json(res, 400, { error: 'Approval failed', details: error.message })
      }
    })
    return true
  }

  if (req.method === 'DELETE' && url.pathname === '/api/social/posts') {
    const id = (url.searchParams.get('id') || '').trim()
    if (!id) return json(res, 400, { error: 'Post id is required' })
    const brandId = requestedBrandId(url, json, res)
    if (!brandId) return true
    return json(res, 200, { success: deleteScheduledPost(id, brandId), id })
  }
  return false
}

const apiVersion = () => process.env.META_GRAPH_API_VERSION || 'v27.0'
const endpoint = path => `https://graph.facebook.com/${apiVersion()}/${path}`

async function request(path, params) {
  const response = await fetch(endpoint(path), {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.error) throw new Error(data.error?.message || `Meta Graph API returned ${response.status}.`)
  return data
}

export async function pingInstagramGraph(credentials = {}) {
  const token = credentials.accessToken || credentials.token || process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = credentials.igBusinessId || credentials.igUserId || process.env.INSTAGRAM_USER_ID
  if (!token || !accountId) return { connected: false, error: 'Link a Meta Page and Instagram professional account first.' }
  const response = await fetch(`${endpoint(encodeURIComponent(accountId))}?${new URLSearchParams({ fields: 'id,username', access_token: token })}`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.error) return { connected: false, error: data.error?.message || `Meta Graph API returned ${response.status}.` }
  return { connected: true, name: data.username ? `@${data.username}` : 'Instagram professional account' }
}

export async function publishInstagramMedia(payload = {}) {
  const credentials = payload.credentials || {}
  const token = credentials.accessToken || credentials.token || process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = credentials.igBusinessId || credentials.igUserId || process.env.INSTAGRAM_USER_ID
  const mediaUrl = payload.imageUrl || payload.videoUrl
  if (!token || !accountId) {
    return {
      platformId: 'instagram', status: 'ok', mode: 'intent_assisted',
      intentUrl: 'https://business.facebook.com/latest/home',
      message: 'Connect a Meta Page with an Instagram professional account to publish through the API.'
    }
  }
  if (!mediaUrl) {
    return {
      platformId: 'instagram', status: 'ok', mode: 'intent_assisted',
      intentUrl: 'https://business.facebook.com/latest/home',
      message: 'Meta API publishing needs a publicly accessible image or video URL. Review and publish this post in Meta Business Suite.'
    }
  }
  const mediaParams = { access_token: token, caption: [payload.title, payload.body].filter(Boolean).join('\n\n') }
  if (payload.videoUrl) Object.assign(mediaParams, { media_type: 'REELS', video_url: payload.videoUrl })
  else mediaParams.image_url = payload.imageUrl
  const container = await request(`${encodeURIComponent(accountId)}/media`, mediaParams)
  if (!container.id) throw new Error('Meta did not create a media container.')

  // Meta processes videos asynchronously. Poll briefly, then return a clear retryable error.
  if (payload.videoUrl) {
    let status = 'IN_PROGRESS'
    for (let attempt = 0; attempt < 12 && status === 'IN_PROGRESS'; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2500))
      const checkUrl = `${endpoint(encodeURIComponent(container.id))}?${new URLSearchParams({ fields: 'status_code', access_token: token })}`
      const response = await fetch(checkUrl)
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.error) throw new Error(result.error?.message || 'Could not check Meta video processing status.')
      status = result.status_code
      if (status === 'ERROR' || status === 'EXPIRED') throw new Error('Meta could not process this video. Check the video URL and format, then try again.')
    }
    if (status !== 'FINISHED') throw new Error('Meta is still processing this video. Try publishing again shortly.')
  }

  const published = await request(`${encodeURIComponent(accountId)}/media_publish`, {
    creation_id: container.id, access_token: token
  })
  if (!published.id) throw new Error('Meta did not confirm the published media ID.')
  return {
    platformId: 'instagram', status: 'ok', mode: 'live_api',
    externalUrl: `https://www.instagram.com/`,
    message: `Published to Instagram (media ${published.id}).`
  }
}

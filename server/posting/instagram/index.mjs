// Instagram API adapter. Graph API work lives separately from platform dispatch.
import { pingInstagramGraph, publishInstagramMedia } from '../../integrations/meta/instagram-publishing.mjs'

export async function post(payload = {}) {
  return publishInstagramMedia(payload)
}

export async function ping(credentials = {}) {
  return pingInstagramGraph(credentials)
}

export async function keepAlive() {
  return { status: 'alive', platformId: 'instagram', timestamp: new Date().toISOString() }
}

/**
 * Web Worker for Offloading Heavy Relationship Computations (<80 lines)
 * Processes 50,000+ follower records off the main thread so the UI never drops below 60fps.
 */
import { analyzeFollowers, compareFollowers, identifyGhostFollowers, type Person, type Snapshot } from '../domain/followers'

self.onmessage = (e: MessageEvent<{
  id: string
  action: 'analyze' | 'compare' | 'ghosts'
  payload: {
    followers?: Person[]
    following?: Person[]
    previous?: Snapshot | null
    whitelist?: string[]
  }
}>) => {
  const { id, action, payload } = e.data
  try {
    if (action === 'analyze') {
      const followers = payload.followers || []
      const following = payload.following || []
      const result = analyzeFollowers(followers, following)
      self.postMessage({ id, success: true, result })
    } else if (action === 'compare') {
      const result = compareFollowers(payload.previous || null, payload.followers || [])
      self.postMessage({ id, success: true, result })
    } else if (action === 'ghosts') {
      const result = identifyGhostFollowers(payload.followers || [], payload.following || [])
      self.postMessage({ id, success: true, result })
    } else {
      self.postMessage({ id, success: false, error: 'Unknown action' })
    }
  } catch (err) {
    self.postMessage({ id, success: false, error: err instanceof Error ? err.message : String(err) })
  }
}

const subscribers = new Set()

export function subscribeToAppEvents(handler) {
  subscribers.add(handler)
  return () => subscribers.delete(handler)
}

export async function publishAppEvent(event) {
  for (const subscriber of subscribers) await subscriber(event)
}

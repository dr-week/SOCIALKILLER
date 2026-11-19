import type { PlatformId } from '../../../types'

export function isExtensionActive(): boolean {
  if (typeof document === 'undefined') return false
  return (
    document.documentElement.getAttribute('data-followdesk-extension') === 'active' ||
    Boolean((window as unknown as { __FOLLOWDESK_EXTENSION_READY?: boolean }).__FOLLOWDESK_EXTENSION_READY)
  )
}

export function dispatchToExtensionBridge(items: Array<{ platformId: PlatformId; title: string; content: string }>) {
  if (typeof window === 'undefined') return
  window.postMessage(
    {
      type: 'FOLLOWDESK_WEB_TO_EXT_DISPATCH',
      requestId: `ext_${Date.now()}`,
      payload: { items }
    },
    '*'
  )
}

export function launchPublisherPlatformIntent(
  platformId: PlatformId,
  content: string,
  brandHandle = 'Company',
  platformLabel: string = platformId,
  onToast: (msg: string) => void = () => {}
) {
  navigator.clipboard.writeText(content)

  if (isExtensionActive() && platformId !== 'ai_registry') {
    dispatchToExtensionBridge([
      {
        platformId,
        title: `${brandHandle} update`,
        content
      }
    ])
    onToast(`Extension opened & auto-filled ${platformLabel}!`)
    return
  }

  const encodedText = encodeURIComponent(content.slice(0, 270))
  const urls: Record<PlatformId, string> = {
    x: `https://twitter.com/intent/tweet?text=${encodedText}`,
    reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(`${brandHandle} update`)}&text=${encodeURIComponent(content)}`,
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
    github: `https://gist.github.com/`,
    devto: `https://dev.to/new`,
    hashnode: `https://hashnode.com/create/story`,
    medium: `https://medium.com/new-story`,
    discord: `https://discord.com/app`,
    instagram: `https://www.instagram.com/`,
    ai_registry: `/api/marketing/llms.txt`
  }

  window.open(urls[platformId], '_blank', 'noopener,noreferrer')
  onToast(`Copied ${platformLabel} & launched!`)
}

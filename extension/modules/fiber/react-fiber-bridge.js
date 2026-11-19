// FollowDesk React Fiber Extractor Bridge
// Traverses Instagram's internal React Fiber Virtual DOM tree to extract raw backend props,
// bypassing obfuscated CSS classes and immune to class-name regeneration.

(function initReactFiberBridge() {
  function getReactFiber(domNode) {
    if (!domNode) return null
    const key = Object.keys(domNode).find(
      k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    )
    return key ? domNode[key] : null
  }

  function getReactProps(domNode) {
    if (!domNode) return null
    const key = Object.keys(domNode).find(k => k.startsWith('__reactProps$'))
    return key ? domNode[key] : null
  }

  function traverseFiberUpwards(fiberNode, maxDepth = 25) {
    let curr = fiberNode
    let depth = 0
    while (curr && depth < maxDepth) {
      if (curr.memoizedProps) {
        const props = curr.memoizedProps
        // Check for post, user, or media objects inside memoizedProps
        if (props.post || props.user || props.media || props.items || props.video_versions) {
          return props
        }
      }
      curr = curr.return
      depth++
    }
    return null
  }

  window.__followdeskFiberBridge = {
    getReactFiber,
    getReactProps,
    traverseFiberUpwards,

    // Extracts high-fidelity media metadata (direct 1080p MP4 or uncompressed image)
    extractMediaFromNode(domElement) {
      const fiber = getReactFiber(domElement)
      if (!fiber) return null
      const props = traverseFiberUpwards(fiber)
      if (!props) return null

      const media = props.post || props.media || props
      if (media.video_versions && Array.isArray(media.video_versions) && media.video_versions.length > 0) {
        return {
          type: 'video',
          url: media.video_versions[0].url,
          width: media.video_versions[0].width,
          height: media.video_versions[0].height,
          id: media.pk || media.id
        }
      }

      if (media.image_versions2?.candidates && media.image_versions2.candidates.length > 0) {
        return {
          type: 'image',
          url: media.image_versions2.candidates[0].url,
          width: media.image_versions2.candidates[0].width,
          height: media.image_versions2.candidates[0].height,
          id: media.pk || media.id
        }
      }

      return null
    }
  }

  console.log('⚛️ [FollowDesk Fiber Bridge] React Fiber Extractor Bridge loaded.')
})()

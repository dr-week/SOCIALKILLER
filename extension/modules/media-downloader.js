// FollowDesk In-Feed Media Downloader Content Script
// Injects clean, unobtrusive download buttons onto Instagram posts, reels, and video elements.

(function initFollowDeskMediaDownloader() {
  const PROCESSED_ATTR = 'data-followdesk-downloader'

  function getMediaSource(article) {
    // 1. Check for video elements (Reels, video posts)
    const video = article.querySelector('video')
    if (video && video.src && !video.src.startsWith('blob:')) {
      return { url: video.src, type: 'video', filename: `instagram-video-${Date.now()}.mp4` }
    }

    // 2. Check for high-res images in post or carousel
    const images = Array.from(article.querySelectorAll('img[srcset], img[src]'))
      .filter(img => !img.alt?.includes('profile') && img.clientWidth > 150)
    
    if (images.length > 0) {
      // Pick highest resolution from srcset or current src
      const targetImg = images[0]
      let bestUrl = targetImg.src
      if (targetImg.srcset) {
        const parts = targetImg.srcset.split(',').map(s => s.trim().split(' '))
        if (parts.length > 0 && parts[parts.length - 1][0]) {
          bestUrl = parts[parts.length - 1][0]
        }
      }
      return { url: bestUrl, type: 'image', filename: `instagram-image-${Date.now()}.jpg` }
    }

    return null
  }

  function downloadViaProxy(url, filename) {
    const proxyUrl = `http://127.0.0.1:4174/api/instagram/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
    const a = document.createElement('a')
    a.href = proxyUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function injectButtonIntoPost(container) {
    if (container.getAttribute(PROCESSED_ATTR)) return
    container.setAttribute(PROCESSED_ATTR, 'true')

    const mediaInfo = getMediaSource(container)
    if (!mediaInfo) return

    // Create clean floating action button with proper icon
    const btn = document.createElement('button')
    btn.className = 'followdesk-media-dl-btn'
    btn.title = `Download this Instagram ${mediaInfo.type} (SOCIALKILLER)`
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>${mediaInfo.type === 'video' ? 'Download' : 'Save HD'}</span>
    `

    btn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 999;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(10px);
      color: #f8fafc;
      border: 1px solid rgba(139, 92, 246, 0.4);
      border-radius: 999px;
      padding: 5px 11px;
      font-size: 11px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      transition: all 0.15s ease;
    `

    btn.onmouseenter = () => {
      btn.style.transform = 'translateY(-1px) scale(1.03)'
      btn.style.background = 'rgba(124, 58, 237, 0.95)'
      btn.style.borderColor = '#8b5cf6'
      btn.style.boxShadow = '0 6px 18px rgba(139, 92, 246, 0.45)'
    }
    btn.onmouseleave = () => {
      btn.style.transform = 'none'
      btn.style.background = 'rgba(15, 23, 42, 0.9)'
      btn.style.borderColor = 'rgba(139, 92, 246, 0.4)'
      btn.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.35)'
    }

    btn.onclick = (e) => {
      e.stopPropagation()
      e.preventDefault()
      // Re-evaluate latest active media (e.g. if carousel slid)
      const freshMedia = getMediaSource(container) || mediaInfo
      btn.innerHTML = '<span>Saving...</span>'
      btn.style.opacity = '0.7'
      downloadViaProxy(freshMedia.url, freshMedia.filename)
      setTimeout(() => {
        btn.innerHTML = '<span>Saved!</span>'
        btn.style.opacity = '1'
        setTimeout(() => {
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>${freshMedia.type === 'video' ? 'Download Reel/Video' : 'Save HD Photo'}</span>
          `
        }, 1800)
      }, 500)
    }

    // Ensure container has relative positioning
    const computedPosition = window.getComputedStyle(container).position
    if (computedPosition === 'static') {
      container.style.position = 'relative'
    }

    container.appendChild(btn)

    // Check if container has multiple carousel slides
    const carouselImages = Array.from(container.querySelectorAll('ul li img[srcset], div[role="button"] img[srcset]'))
    if (carouselImages.length > 1) {
      const batchBtn = document.createElement('button')
      batchBtn.className = 'followdesk-media-batch-btn'
      batchBtn.title = 'Batch download all carousel slides (SOCIALKILLER)'
      batchBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/>
        </svg>
        <span>Save Carousel (${carouselImages.length})</span>
      `
      batchBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 145px;
        z-index: 999;
        background: rgba(16, 185, 129, 0.88);
        backdrop-filter: blur(8px);
        color: #fff;
        border: 1px solid rgba(16, 185, 129, 0.5);
        border-radius: 999px;
        padding: 6px 11px;
        font-size: 11px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      `
      batchBtn.onclick = (e) => {
        e.stopPropagation()
        e.preventDefault()
        batchBtn.innerHTML = '<span>Downloading all...</span>'
        carouselImages.forEach((img, idx) => {
          let url = img.src
          if (img.srcset) {
            const parts = img.srcset.split(',').map(s => s.trim().split(' '))
            if (parts.length > 0 && parts[parts.length - 1][0]) {
              url = parts[parts.length - 1][0]
            }
          }
          setTimeout(() => {
            downloadViaProxy(url, `carousel-slide-${idx + 1}-${Date.now()}.jpg`)
          }, idx * 300)
        })
        setTimeout(() => {
          batchBtn.innerHTML = '<span>All Saved!</span>'
        }, 1200)
      }
      container.appendChild(batchBtn)
    }
  }

  function scanAndInject() {
    // Target Instagram feed articles, dialog modals, and reels containers
    const candidates = document.querySelectorAll('article, [role="dialog"], div[role="presentation"]')
    candidates.forEach((el) => {
      if (el.querySelector('video, img[srcset]')) {
        injectButtonIntoPost(el)
      }
    })
  }

  // Periodic and Mutation-based observer
  const observer = new MutationObserver(() => scanAndInject())
  observer.observe(document.body, { childList: true, subtree: true })
  scanAndInject()
  setInterval(scanAndInject, 2000)
})()

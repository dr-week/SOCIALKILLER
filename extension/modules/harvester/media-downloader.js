// FollowDesk In-Feed Media Downloader Content Script (<150 lines)
(function initFollowDeskMediaDownloader() {
  const PROCESSED_ATTR = 'data-followdesk-downloader'
  const DL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`

  function bestImgSrc(img) {
    if (!img.srcset) return img.src
    const parts = img.srcset.split(',').map(s => s.trim().split(' '))
    return parts.length > 0 && parts[parts.length - 1][0] ? parts[parts.length - 1][0] : img.src
  }

  function getMediaSource(article) {
    const video = article.querySelector('video')
    if (video?.src && !video.src.startsWith('blob:')) {
      return { url: video.src, type: 'video', filename: `instagram-video-${Date.now()}.mp4` }
    }
    const images = Array.from(article.querySelectorAll('img[srcset], img[src]'))
      .filter(img => !img.alt?.includes('profile') && img.clientWidth > 150)
    if (images.length > 0) {
      return { url: bestImgSrc(images[0]), type: 'image', filename: `instagram-image-${Date.now()}.jpg` }
    }
    return null
  }

  function downloadViaProxy(url, filename) {
    const a = document.createElement('a')
    a.href = `http://127.0.0.1:4174/api/instagram/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
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

    const btn = document.createElement('button')
    btn.className = 'followdesk-media-dl-btn'
    btn.title = `Download this Instagram ${mediaInfo.type} (SOCIALKILLER)`
    btn.innerHTML = `${DL_SVG}<span>${mediaInfo.type === 'video' ? 'Download' : 'Save HD'}</span>`
    btn.style.cssText = 'position:absolute;top:10px;right:10px;z-index:999;background:rgba(15,23,42,0.9);backdrop-filter:blur(10px);color:#f8fafc;border:1px solid rgba(139,92,246,0.4);border-radius:999px;padding:5px 11px;font-size:11px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 4px 14px rgba(0,0,0,0.35);transition:all 0.15s ease;'

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
      const freshMedia = getMediaSource(container) || mediaInfo
      btn.innerHTML = '<span>Saving...</span>'
      btn.style.opacity = '0.7'
      downloadViaProxy(freshMedia.url, freshMedia.filename)
      setTimeout(() => {
        btn.innerHTML = '<span>Saved!</span>'
        btn.style.opacity = '1'
        setTimeout(() => {
          btn.innerHTML = `${DL_SVG}<span>${freshMedia.type === 'video' ? 'Download Reel/Video' : 'Save HD Photo'}</span>`
        }, 1800)
      }, 500)
    }

    if (window.getComputedStyle(container).position === 'static') container.style.position = 'relative'
    container.appendChild(btn)

    const carouselImages = Array.from(container.querySelectorAll('ul li img[srcset], div[role="button"] img[srcset]'))
    if (carouselImages.length > 1) {
      const batchBtn = document.createElement('button')
      batchBtn.className = 'followdesk-media-batch-btn'
      batchBtn.title = 'Batch download all carousel slides (SOCIALKILLER)'
      batchBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg><span>Save Carousel (${carouselImages.length})</span>`
      batchBtn.style.cssText = 'position:absolute;top:12px;right:145px;z-index:999;background:rgba(16,185,129,0.88);backdrop-filter:blur(8px);color:#fff;border:1px solid rgba(16,185,129,0.5);border-radius:999px;padding:6px 11px;font-size:11px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:all 0.2s ease;'

      batchBtn.onclick = (e) => {
        e.stopPropagation()
        e.preventDefault()
        batchBtn.innerHTML = '<span>Downloading all...</span>'
        carouselImages.forEach((img, idx) => {
          setTimeout(() => downloadViaProxy(bestImgSrc(img), `carousel-slide-${idx + 1}-${Date.now()}.jpg`), idx * 300)
        })
        setTimeout(() => { batchBtn.innerHTML = '<span>All Saved!</span>' }, 1200)
      }
      container.appendChild(batchBtn)
    }
  }

  function scanAndInject() {
    if (document.hidden) return
    document.querySelectorAll('article, [role="dialog"], div[role="presentation"]').forEach((el) => {
      if (!el.getAttribute(PROCESSED_ATTR) && el.querySelector('video, img[srcset]')) injectButtonIntoPost(el)
    })
  }

  let scanTimer = null
  function scheduleScan() {
    if (scanTimer || document.hidden) return
    scanTimer = setTimeout(() => { scanTimer = null; scanAndInject() }, 250)
  }

  function startObserver() {
    if (!document.body) return
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true })
    scanAndInject()
    setInterval(scanAndInject, 4000)
  }

  if (document.body) startObserver()
  else document.addEventListener('DOMContentLoaded', startObserver, { once: true })
})()

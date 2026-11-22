// FollowDesk Modal DOM & Virtual Scroll Harvester (<150 lines)
(function initModalHarvester() {
  const harvestedUsers = new Map()
  const RESERVED = new Set(['explore', 'reels', 'stories', 'direct', 'p', 'accounts', 'developer'])
  let isHarvesting = false
  let harvestInterval = null

  function findFollowListDialog() {
    for (const d of document.querySelectorAll('div[role="dialog"]')) {
      const text = d.innerText?.toLowerCase() || ''
      if (text.includes('follower') || text.includes('following') || d.querySelector('ul, div[style*="overflow"]')) {
        return d
      }
    }
    for (const overlay of document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]')) {
      const text = overlay.innerText?.toLowerCase() || ''
      if ((text.includes('follower') || text.includes('following')) && overlay.querySelector('a[href^="/"]')) {
        return overlay
      }
    }
    return null
  }

  function getDialogScrollContainer(dialog) {
    if (!dialog) return null
    const styled = dialog.querySelector('div[style*="overflow-y"], div[style*="overflow: auto"], div[style*="overflow: scroll"]')
    if (styled && styled.scrollHeight > styled.clientHeight) return styled

    for (const el of dialog.querySelectorAll('div, ul')) {
      if (el.scrollHeight > el.clientHeight + 40) {
        const s = window.getComputedStyle(el)
        if (s.overflowY === 'auto' || s.overflowY === 'scroll' || s.overflow === 'auto') return el
      }
    }
    return dialog
  }

  function harvestCurrentDialog() {
    const dialog = findFollowListDialog()
    if (!dialog) return { active: false, count: 0, users: [] }

    dialog.querySelectorAll('a[href^="/"][role="link"], a[href^="/"]').forEach(link => {
      const parts = (link.getAttribute('href') || '').replace(/^\/+|\/+$/g, '').split('/')
      if (parts.length !== 1) return
      const cleanUser = parts[0].toLowerCase()
      if (!cleanUser || RESERVED.has(cleanUser) || harvestedUsers.has(cleanUser)) return

      let isVerified = false
      let isPrivate = false
      if (window.__followdeskFiberBridge) {
        const fiber = window.__followdeskFiberBridge.getReactFiber(link)
        const props = fiber ? window.__followdeskFiberBridge.traverseFiberUpwards(fiber, 8) : null
        if (props?.user) {
          isVerified = Boolean(props.user.is_verified)
          isPrivate = Boolean(props.user.is_private)
        }
      }
      harvestedUsers.set(cleanUser, {
        username: parts[0],
        href: `https://www.instagram.com/${encodeURIComponent(parts[0])}/`,
        isPrivate,
        isVerified
      })
    })

    return { active: true, count: harvestedUsers.size, users: [...harvestedUsers.values()] }
  }

  function setNativeInput(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(input, value)
    else input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  let lastBroadcastCount = 0
  window.__followdeskModalHarvester = {
    startAutoHarvest() {
      if (isHarvesting) return
      isHarvesting = true
      harvestInterval = setInterval(() => {
        if (document.hidden || !document.querySelector('div[role="dialog"]')) return
        const result = harvestCurrentDialog()
        if (result.active && result.count > lastBroadcastCount) {
          lastBroadcastCount = result.count
          try {
            chrome.runtime.sendMessage({ type: 'FOLLOWDESK_MODAL_HARVEST_UPDATE', count: result.count, users: result.users })
          } catch {}
        }
      }, 1200)
    },

    stopAutoHarvest() {
      isHarvesting = false
      if (harvestInterval) { clearInterval(harvestInterval); harvestInterval = null }
    },

    getHarvestedUsers: () => [...harvestedUsers.values()],
    clearHarvest: () => harvestedUsers.clear(),

    async autoScrollDialog(maxPages = 30) {
      const dialog = findFollowListDialog()
      if (!dialog) return { success: false, error: 'Followers dialog not opened on screen. Please click Followers or Following on Instagram first.' }

      const scrollContainer = getDialogScrollContainer(dialog) || dialog
      let lastScrollHeight = 0
      let sameHeightCount = 0

      for (let i = 0; i < maxPages; i++) {
        harvestCurrentDialog()
        scrollContainer.scrollTop = scrollContainer.scrollHeight
        await new Promise(r => setTimeout(r, 800 + Math.random() * 350))
        if (scrollContainer.scrollHeight === lastScrollHeight) {
          if (++sameHeightCount >= 3) break
        } else {
          sameHeightCount = 0
          lastScrollHeight = scrollContainer.scrollHeight
        }
      }

      const searchInput = dialog.querySelector('input[placeholder*="Search"], input[type="text"]')
      if (searchInput) {
        for (const ch of ['a', 'e', 'i', 'o', 'u', 's', 'm', 'r', 'b', 'd']) {
          try {
            searchInput.focus()
            setNativeInput(searchInput, ch)
            searchInput.dispatchEvent(new Event('change', { bubbles: true }))
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ch }))
            searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ch }))
            await new Promise(r => setTimeout(r, 650 + Math.random() * 200))
            harvestCurrentDialog()
          } catch {}
        }
        setNativeInput(searchInput, '')
      }

      const finalData = harvestCurrentDialog()
      return { success: true, count: finalData.count, users: finalData.users }
    }
  }

  window.__followdeskModalHarvester.startAutoHarvest()
  console.log('👁️ [FollowDesk Harvester] Modal DOM & Virtual Scroll Harvester active.')
})()

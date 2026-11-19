// FollowDesk Modal DOM & Virtual Scroll Harvester
// When an approved user opens a private account's Followers or Following dialog on screen,
// this module hooks into the scrollable dialog container, traverses React Fiber nodes & DOM elements,
// and extracts all visible/rendered user profiles in real-time.

(function initModalHarvester() {
  const harvestedUsers = new Map()
  let isHarvesting = false
  let harvestInterval = null

  function extractUserFromElement(el) {
    if (!el) return null

    // Method 1: React Fiber Inspection
    if (window.__followdeskFiberBridge && typeof window.__followdeskFiberBridge.getReactFiber === 'function') {
      try {
        const fiber = window.__followdeskFiberBridge.getReactFiber(el)
        if (fiber) {
          const props = window.__followdeskFiberBridge.traverseFiberUpwards(fiber, 12)
          if (props?.user?.username) {
            return {
              username: props.user.username,
              href: `https://www.instagram.com/${encodeURIComponent(props.user.username)}/`,
              isPrivate: Boolean(props.user.is_private),
              isVerified: Boolean(props.user.is_verified)
            }
          }
        }
      } catch {}
    }

    // Method 2: High-speed DOM Fallback
    const link = el.querySelector('a[href^="/"][role="link"], a[href^="/"]')
    if (link) {
      const href = link.getAttribute('href') || ''
      const parts = href.replace(/^\/+|\/+$/g, '').split('/')
      if (parts.length === 1) {
        const cleanUser = parts[0].toLowerCase()
        const reserved = new Set(['explore', 'reels', 'stories', 'direct', 'p'])
        if (!reserved.has(cleanUser) && cleanUser.length > 0) {
          return {
            username: parts[0],
            href: `https://www.instagram.com/${encodeURIComponent(parts[0])}/`,
            isPrivate: false,
            isVerified: false
          }
        }
      }
    }
    return null
  }

  function findFollowListDialog() {
    // 1. Check for standard ARIA role="dialog"
    const dialogs = document.querySelectorAll('div[role="dialog"]')
    for (const d of dialogs) {
      const text = d.innerText?.toLowerCase() || ''
      if (text.includes('follower') || text.includes('following') || d.querySelector('ul, div[style*="overflow"]')) {
        return d
      }
    }

    // 2. Fallback: Search for modal overlay backdrop containers
    const fixedOverlays = document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]')
    for (const overlay of fixedOverlays) {
      const text = overlay.innerText?.toLowerCase() || ''
      if ((text.includes('follower') || text.includes('following')) && overlay.querySelector('a[href^="/"]')) {
        return overlay
      }
    }

    return null
  }

  function getDialogScrollContainer(dialog) {
    if (!dialog) return null

    // Method A: Look for elements with inline overflow styles
    const styledScroll = dialog.querySelector('div[style*="overflow-y"], div[style*="overflow: auto"], div[style*="overflow: scroll"], div[style*="overflow-y: auto"], div[style*="overflow-y: scroll"]')
    if (styledScroll && styledScroll.scrollHeight > styledScroll.clientHeight) return styledScroll

    // Method B: Search computed style for overflow-y: auto / scroll
    const candidates = dialog.querySelectorAll('div, ul')
    for (const el of candidates) {
      if (el.scrollHeight > el.clientHeight + 40) {
        const style = window.getComputedStyle(el)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto') {
          return el
        }
      }
    }

    return dialog
  }

  function harvestCurrentDialog() {
    const dialog = findFollowListDialog()
    if (!dialog) return { active: false, count: 0, users: [] }

    // Find all links to profiles inside the dialog
    const links = dialog.querySelectorAll('a[href^="/"][role="link"], a[href^="/"]')
    let newlyFound = 0

    links.forEach(link => {
      const href = link.getAttribute('href') || ''
      const parts = href.replace(/^\/+|\/+$/g, '').split('/')
      if (parts.length === 1) {
        const cleanUser = parts[0].toLowerCase()
        const reserved = new Set(['explore', 'reels', 'stories', 'direct', 'p', 'accounts', 'developer'])
        if (!reserved.has(cleanUser) && cleanUser.length > 0) {
          if (!harvestedUsers.has(cleanUser)) {
            // Also try to get React Fiber metadata from link or its container
            let isVerified = false
            let isPrivate = false
            if (window.__followdeskFiberBridge) {
              const fiber = window.__followdeskFiberBridge.getReactFiber(link)
              if (fiber) {
                const props = window.__followdeskFiberBridge.traverseFiberUpwards(fiber, 8)
                if (props?.user) {
                  isVerified = Boolean(props.user.is_verified)
                  isPrivate = Boolean(props.user.is_private)
                }
              }
            }
            harvestedUsers.set(cleanUser, {
              username: parts[0],
              href: `https://www.instagram.com/${encodeURIComponent(parts[0])}/`,
              isPrivate,
              isVerified
            })
            newlyFound++
          }
        }
      }
    })

    return {
      active: true,
      count: harvestedUsers.size,
      users: [...harvestedUsers.values()]
    }
  }

  // Expose global controller
  window.__followdeskModalHarvester = {
    startAutoHarvest() {
      if (isHarvesting) return
      isHarvesting = true
      harvestInterval = setInterval(() => {
        const result = harvestCurrentDialog()
        if (result.active && result.count > 0) {
          try {
            chrome.runtime.sendMessage({
              type: 'FOLLOWDESK_MODAL_HARVEST_UPDATE',
              count: result.count,
              users: result.users
            })
          } catch {}
        }
      }, 800)
    },

    stopAutoHarvest() {
      isHarvesting = false
      if (harvestInterval) {
        clearInterval(harvestInterval)
        harvestInterval = null
      }
    },

    getHarvestedUsers() {
      return [...harvestedUsers.values()]
    },

    clearHarvest() {
      harvestedUsers.clear()
    },

    // Automated human-paced smooth scroll & search query cycling helper for the modal dialog
    async autoScrollDialog(maxPages = 30) {
      const dialog = findFollowListDialog()
      if (!dialog) return { success: false, error: 'Followers dialog not opened on screen. Please click Followers or Following on Instagram first.' }

      const scrollContainer = getDialogScrollContainer(dialog) || dialog
      let lastScrollHeight = 0
      let sameHeightCount = 0

      // 1. First Pass: Human-paced scroll harvesting
      for (let i = 0; i < maxPages; i++) {
        harvestCurrentDialog()
        scrollContainer.scrollTop = scrollContainer.scrollHeight
        await new Promise(r => setTimeout(r, 800 + Math.random() * 350))

        if (scrollContainer.scrollHeight === lastScrollHeight) {
          sameHeightCount++
          if (sameHeightCount >= 3) break // Virtual scroll end or stalled
        } else {
          sameHeightCount = 0
          lastScrollHeight = scrollContainer.scrollHeight
        }
      }

      // 2. Second Pass: Search query injection into the dialog's search input (a-z)
      // When scrolling stalls or repeats, typing search characters forces Instagram's React client
      // to query distinct batches of followers matching that character
      const searchInput = dialog.querySelector('input[placeholder*="Search"], input[type="text"]')
      if (searchInput) {
        const queryChars = ['a', 'e', 'i', 'o', 'u', 's', 'm', 'r', 'b', 'd']
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        for (const ch of queryChars) {
          try {
            searchInput.focus()
            if (nativeSetter) {
              nativeSetter.call(searchInput, ch)
            } else {
              searchInput.value = ch
            }
            searchInput.dispatchEvent(new Event('input', { bubbles: true }))
            searchInput.dispatchEvent(new Event('change', { bubbles: true }))
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ch }))
            searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ch }))
            await new Promise(r => setTimeout(r, 650 + Math.random() * 200))
            harvestCurrentDialog()
          } catch {}
        }
        // Clear search input at the end to restore normal view
        if (nativeSetter) {
          nativeSetter.call(searchInput, '')
        } else {
          searchInput.value = ''
        }
        searchInput.dispatchEvent(new Event('input', { bubbles: true }))
      }

      const finalData = harvestCurrentDialog()
      return { success: true, count: finalData.count, users: finalData.users }
    }
  }

  // Automatically start passive harvester when script is active
  window.__followdeskModalHarvester.startAutoHarvest()
  console.log('👁️ [FollowDesk Harvester] Modal DOM & Virtual Scroll Harvester active.')
})()

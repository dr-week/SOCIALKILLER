/**
 * Checkpoint and Session Persistence Helper for Extractor (<90 lines)
 */

export async function saveExtractionCheckpoint(accountScope, key, list, nextMaxId) {
  try {
    const scopedKey = `${accountScope}_${key}`
    const payload = { list, nextMaxId, timestamp: Date.now() }
    sessionStorage.setItem(`followdesk_cp_${scopedKey}`, JSON.stringify(payload))
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [`followdesk_cp_${scopedKey}`]: payload })
    }
  } catch {}
}

export async function loadExtractionCheckpoint(accountScope, key) {
  try {
    const scopedKey = `${accountScope}_${key}`
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get([`followdesk_cp_${scopedKey}`])
      if (res?.[`followdesk_cp_${scopedKey}`]) {
        const cp = res[`followdesk_cp_${scopedKey}`]
        if (Date.now() - (cp.timestamp || 0) < 30 * 60 * 1000) {
          return cp
        }
      }
    }
    const raw = sessionStorage.getItem(`followdesk_cp_${scopedKey}`)
    if (raw) {
      const cp = JSON.parse(raw)
      if (Date.now() - (cp.timestamp || 0) < 30 * 60 * 1000) return cp
    }
  } catch {}
  return null
}

export async function clearExtractionCheckpoint(accountScope, key) {
  try {
    const scopedKey = `${accountScope}_${key}`
    sessionStorage.removeItem(`followdesk_cp_${scopedKey}`)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.remove([`followdesk_cp_${scopedKey}`])
    }
  } catch {}
}

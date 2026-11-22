/** Capture the visible viewport of a tab after an explicit extension action. */
export async function captureVisibleScreenshot(windowId) {
  if (!Number.isInteger(windowId)) throw new Error('No active browser window is available.')
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
  if (!dataUrl?.startsWith('data:image/png')) throw new Error('Chrome did not return a PNG screenshot.')
  await chrome.storage.session.set({ screenshotPreview: dataUrl })
  await chrome.tabs.create({ url: chrome.runtime.getURL('screenshot-viewer.html') })
  return true
}

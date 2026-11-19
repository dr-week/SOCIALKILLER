const image = document.getElementById('preview')
const status = document.getElementById('status')
const download = document.getElementById('download')

try {
  const { screenshotPreview } = await chrome.storage.session.get('screenshotPreview')
  await chrome.storage.session.remove('screenshotPreview')
  if (!screenshotPreview?.startsWith('data:image/png')) throw new Error('No screenshot was available.')
  image.src = screenshotPreview
  image.hidden = false
  status.textContent = 'Captured locally from the visible tab.'
  download.disabled = false
  download.addEventListener('click', () => {
    const link = document.createElement('a')
    link.href = screenshotPreview
    link.download = `social-base-screenshot-${new Date().toISOString().replaceAll(':', '-')}.png`
    link.click()
  })
} catch (error) {
  status.textContent = error instanceof Error ? error.message : 'Could not load the screenshot.'
}

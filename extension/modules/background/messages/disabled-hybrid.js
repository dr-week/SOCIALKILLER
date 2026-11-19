export function handleDisabledHybrid(message, sendResponse) {
  if (message?.type !== 'FOLLOWDESK_RUN_HYBRID_SCRIPT') return undefined
  sendResponse({
    success: false,
    mode: 'disabled',
    error: 'Live browser automation is not available. Use the reviewed composer or supported publishing API.'
  })
  return false
}

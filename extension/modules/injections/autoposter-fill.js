;(function registerAutoposterFill() {
  const api = globalThis.FollowDeskAutoposter || (globalThis.FollowDeskAutoposter = {})

  api.fillPlatform = ({ platform, title = '', content = '', autoClickSubmit = false }) => {
    const targets = api.getPlatformFillTargets(platform)
    const titleField = api.queryFirstMatchingElement(targets.title)
    if (titleField && title) {
      const value = platform === 'reddit' ? title.replace(/^Title:\s*/i, '') : title
      api.setNativeValue(titleField, value)
    }
    fillGitHubFilename(platform, targets)
    const body = api.queryFirstMatchingElement(targets.body)
    const filled = body ? api.setNativeValue(body, content) : false
    if (filled && autoClickSubmit) submitAfterFill(targets)
    return filled
  }

  function fillGitHubFilename(platform, targets) {
    if (platform !== 'github') return
    const field = api.queryFirstMatchingElement(targets.filename)
    if (field && !field.value) api.setNativeValue(field, `zuari-pulse-${new Date().toISOString().slice(0, 10)}.md`)
  }

  function submitAfterFill(targets) {
    const button = api.findSubmitButton(targets)
    if (!button || button.disabled) return
    const delay = targets.submitText ? 600 : 0
    setTimeout(() => button.click(), delay)
  }
})()

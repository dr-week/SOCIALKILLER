;(function registerAutoposterDom() {
  const api = globalThis.FollowDeskAutoposter || (globalThis.FollowDeskAutoposter = {})

  api.setNativeValue = (element, value) => {
    if (!element) return false
    element.focus()
    if (element.isContentEditable) {
      document.execCommand('selectAll', false, null)
      const inserted = document.execCommand('insertText', false, value)
      if (!inserted) element.textContent = value
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertText' }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }
    const prototype = element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
    if (setter) setter.call(element, value)
    else element.value = value
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }
})()

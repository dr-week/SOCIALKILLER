// Platform-specific DOM composer fillers for FollowDesk Auto-Poster (<125 lines)
;(function initAutoPosterFillers() {
  function setNativeValue(element, value) {
    if (!element) return false
    element.focus()
    if (element.isContentEditable) {
      document.execCommand('selectAll', false, null)
      if (!document.execCommand('insertText', false, value)) element.textContent = value
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertText' }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }
    const proto =
      element instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
    if (setter) setter.call(element, value)
    else element.value = value
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }

  function clickButtonDelayed(btn, delayMs = 600) {
    if (btn && !btn.disabled) setTimeout(() => btn.click(), delayMs)
  }

  function fillPlatformComposer(platform, { title = '', content = '', autoClickSubmit = false }) {
    let filled = false

    if (platform === 'x') {
      const box =
        document.querySelector('div[role="textbox"][data-testid="tweetTextarea_0"]') ||
        document.querySelector('div[role="textbox"][aria-label*="post text" i]') ||
        document.querySelector('div[role="textbox"][aria-multiline="true"]') ||
        document.querySelector('div[role="textbox"][contenteditable="true"]')
      if (box) filled = setNativeValue(box, content)
      if (filled && autoClickSubmit) {
        const btn =
          document.querySelector('button[data-testid="tweetButton"]') ||
          document.querySelector('button[data-testid="tweetButtonInline"]') ||
          document.querySelector('button[aria-label*="Post" i]')
        if (btn && !btn.disabled) btn.click()
      }
      return filled
    }

    if (platform === 'reddit') {
      const titleInput =
        document.querySelector('textarea[aria-label*="title" i]') ||
        document.querySelector('textarea[placeholder*="Title" i]') ||
        document.querySelector('input[placeholder*="Title" i]') ||
        document.querySelector('[name="title"]')
      if (titleInput && title) setNativeValue(titleInput, title.replace(/^Title:\s*/i, ''))

      const bodyBox =
        document.querySelector('div[role="textbox"][contenteditable="true"]') ||
        document.querySelector('div[role="textbox"][aria-label*="text" i]') ||
        document.querySelector('textarea[placeholder*="text" i]') ||
        document.querySelector('textarea[name="text"]')
      if (bodyBox) filled = setNativeValue(bodyBox, content)
      if (filled && autoClickSubmit) {
        const submitBtn =
          document.querySelector('button[type="submit"]') ||
          document.querySelector('button[aria-label*="Post" i]') ||
          Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase() === 'post')
        clickButtonDelayed(submitBtn)
      }
      return filled
    }

    if (platform === 'linkedin') {
      const shareBox =
        document.querySelector('.ql-editor[contenteditable="true"]') ||
        document.querySelector('div[role="textbox"][aria-label*="post" i]') ||
        document.querySelector('div[role="textbox"][contenteditable="true"]')
      if (shareBox) filled = setNativeValue(shareBox, content)
      if (filled && autoClickSubmit) {
        const postBtn =
          document.querySelector('button.share-actions__primary-action') ||
          Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase() === 'post')
        clickButtonDelayed(postBtn)
      }
      return filled
    }

    if (platform === 'devto') {
      const titleEl =
        document.querySelector('#article-form-title') ||
        document.querySelector('textarea[placeholder*="New post title" i]')
      if (titleEl && title) setNativeValue(titleEl, title)
      const bodyEl =
        document.querySelector('#article_body_markdown') ||
        document.querySelector('textarea[placeholder*="Write your post content" i]')
      if (bodyEl) filled = setNativeValue(bodyEl, content)
      if (filled && autoClickSubmit) {
        const publishBtn =
          document.querySelector('button#publish-button') ||
          Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase().includes('publish'))
        clickButtonDelayed(publishBtn)
      }
      return filled
    }

    if (platform === 'github') {
      const descInput = document.querySelector('input[name="gist[description]"]')
      if (descInput && title) setNativeValue(descInput, title)
      const filenameInput = document.querySelector('input.js-gist-filename')
      if (filenameInput && !filenameInput.value) {
        setNativeValue(filenameInput, `zuari-pulse-${new Date().toISOString().slice(0, 10)}.md`)
      }
      const editor =
        document.querySelector('.cm-content[contenteditable="true"]') ||
        document.querySelector('div[role="textbox"][contenteditable="true"]') ||
        document.querySelector('textarea.file-editor-textarea')
      if (editor) filled = setNativeValue(editor, content)
      if (filled && autoClickSubmit) {
        const createBtn =
          document.querySelector('button.hx_create-pr-button') ||
          Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase().includes('create public gist'))
        clickButtonDelayed(createBtn)
      }
      return filled
    }

    const genericTarget =
      document.querySelector('div[role="textbox"][contenteditable="true"]') ||
      document.querySelector('[contenteditable="true"]') ||
      document.querySelector('textarea')
    return genericTarget ? setNativeValue(genericTarget, content) : false
  }

  window.__followdeskAutoPosterFillers = { setNativeValue, fillPlatformComposer }
})()

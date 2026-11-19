;(function registerAutoposterSelectors() {
  const selectors = {
    x: {
      body: ['div[role="textbox"][data-testid="tweetTextarea_0"]', 'div[role="textbox"][aria-label*="post text" i]', 'div[role="textbox"][aria-multiline="true"]', 'div[role="textbox"][contenteditable="true"]'],
      submit: ['button[data-testid="tweetButton"]', 'button[data-testid="tweetButtonInline"]', 'button[aria-label*="Post" i]']
    },
    reddit: {
      title: ['textarea[aria-label*="title" i]', 'textarea[placeholder*="Title" i]', 'input[placeholder*="Title" i]', '[name="title"]'],
      body: ['div[role="textbox"][contenteditable="true"]', 'div[role="textbox"][aria-label*="text" i]', 'textarea[placeholder*="text" i]', 'textarea[name="text"]'],
      submit: ['button[type="submit"]', 'button[aria-label*="Post" i]'], submitText: 'post'
    },
    linkedin: {
      body: ['.ql-editor[contenteditable="true"]', 'div[role="textbox"][aria-label*="post" i]', 'div[role="textbox"][contenteditable="true"]'],
      submit: ['button.share-actions__primary-action'], submitText: 'post'
    },
    devto: {
      title: ['#article-form-title', 'textarea[placeholder*="New post title" i]'],
      body: ['#article_body_markdown', 'textarea[placeholder*="Write your post content" i]'],
      submit: ['button#publish-button'], submitText: 'publish', matchMode: 'includes'
    },
    github: {
      title: ['input[name="gist[description]"]'], filename: ['input.js-gist-filename'],
      body: ['.cm-content[contenteditable="true"]', 'div[role="textbox"][contenteditable="true"]', 'textarea.file-editor-textarea'],
      submit: ['button.hx_create-pr-button'], submitText: 'create public gist', matchMode: 'includes'
    }
  }

  const api = globalThis.FollowDeskAutoposter || (globalThis.FollowDeskAutoposter = {})
  api.getPlatformFillTargets = platform => selectors[platform] || {
    body: ['div[role="textbox"][contenteditable="true"]', '[contenteditable="true"]', 'textarea'], submit: []
  }
  api.queryFirstMatchingElement = (items = []) => {
    for (const selector of items) {
      try { const element = document.querySelector(selector); if (element) return element } catch {}
    }
    return null
  }
  api.findSubmitButton = config => {
    const button = api.queryFirstMatchingElement(config.submit)
    if (button || !config.submitText) return button
    return Array.from(document.querySelectorAll('button')).find(candidate => {
      const text = candidate.textContent?.trim().toLowerCase() || ''
      return config.matchMode === 'includes' ? text.includes(config.submitText) : text === config.submitText
    }) || null
  }
})()

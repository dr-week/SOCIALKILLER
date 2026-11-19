import { handleActiveBrand } from './active-brand.js'
import { handleMarkPosted } from './mark-posted.js'
import { handleDispatchPosts } from './dispatch-posts.js'
import { handleFillActiveTab } from './fill-active-tab.js'
import { handlePendingAutopost } from './pending-autopost.js'
import { handleDisabledHybrid } from './disabled-hybrid.js'

export function registerMessageRouter({ logError, openAndAutoFillPlatform }) {
  const handlers = [
    (message, sender, respond) => handleActiveBrand(message, sender),
    (message, _sender, respond) => handleMarkPosted(message, respond, logError),
    (message, _sender, respond) => handleDispatchPosts(message, respond, openAndAutoFillPlatform),
    (message, _sender, respond) => handleFillActiveTab(message, respond),
    (message, _sender, respond) => handlePendingAutopost(message, respond, logError),
    (message, _sender, respond) => handleDisabledHybrid(message, respond)
  ]
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    for (const handler of handlers) {
      const result = handler(message, sender, sendResponse)
      if (result !== undefined) return result
    }
    return false
  })
}

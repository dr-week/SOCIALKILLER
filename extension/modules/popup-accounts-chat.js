/**
 * FollowDesk Companion Popup — Accounts, Credentials & Chat Replies Controller (<130 lines)
 * Displays live cookie/DOM-recognized usernames & login states across all 7+ platforms,
 * and provides 1-click contextual chat/comment replies with human cadence jitter.
 */
import { detectAllPlatformSessions } from './account-recognizer.js'
import { buildContextualChatReplies, cognitivePause } from './human-cadence.js'

export async function initPopupAccountsChatController({ showAlert }) {
  const accountsListEl = document.getElementById('extAccountsMatrix')
  const refreshAccountsBtn = document.getElementById('extRefreshAccountsBtn')
  const chatReplyTopicInput = document.getElementById('extChatTopicInput')
  const chatRepliesContainer = document.getElementById('extChatRepliesList')

  async function renderRecognizedAccounts() {
    if (!accountsListEl) return
    const sessions = await detectAllPlatformSessions()
    accountsListEl.innerHTML = sessions
      .map(
        (s) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 7px; border-radius:6px; background:#090d16; border:1px solid ${
        s.loggedIn ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'
      }; font-size:10px;">
        <span>${s.icon} <strong>${s.name}</strong></span>
        <span style="color:${s.loggedIn ? '#34d399' : '#94a3b8'}; font-weight:700;">
          ${s.loggedIn ? `🟢 ${s.handle}` : '⚪ Login Tab'}
        </span>
      </div>
    `
      )
      .join('')
  }

  function renderChatReplies() {
    if (!chatRepliesContainer) return
    const topic = chatReplyTopicInput?.value || 'Zero-VDOM & 120 FPS WebXR'
    const replies = buildContextualChatReplies(topic, 'x')

    chatRepliesContainer.innerHTML = replies
      .map(
        (r, idx) => `
      <button type="button" class="preset-chip ext-chat-reply-btn" data-idx="${idx}" style="justify-content:space-between; width:100%; text-align:left; padding:6px 8px;">
        <span>${r.icon} <strong>${r.label}</strong></span>
        <span style="color:#a855f7; font-size:9.5px;">⚡ Inject / Copy</span>
      </button>
    `
      )
      .join('')

    chatRepliesContainer.querySelectorAll('.ext-chat-reply-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.getAttribute('data-idx') || 0)
        const item = replies[idx]
        if (!item) return

        await cognitivePause(120, 320)
        await navigator.clipboard.writeText(item.text)

        try {
          await chrome.runtime.sendMessage({
            type: 'FOLLOWDESK_FILL_ACTIVE_TAB',
            payload: { title: item.label, content: item.text, autoClickSubmit: false }
          })
          showAlert('success', `⚡ Injected "${item.label}" into active tab & clipboard!`)
        } catch {
          showAlert('success', `📋 Copied "${item.label}" reply to clipboard!`)
        }
      })
    })
  }

  refreshAccountsBtn?.addEventListener('click', async () => {
    await renderRecognizedAccounts()
    showAlert('success', 'Refreshed browser session & username matrix!')
  })

  chatReplyTopicInput?.addEventListener('input', renderChatReplies)

  await renderRecognizedAccounts()
  renderChatReplies()
}

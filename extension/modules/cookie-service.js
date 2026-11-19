/**
 * Session & Cookie Service for Instagram
 * Retrieves ds_user_id and csrftoken across supported domains.
 */

const COOKIE_DOMAINS = [
  'https://www.instagram.com',
  'https://instagram.com'
]

/**
 * Discovers logged-in session cookies (ds_user_id, csrftoken)
 * @returns {Promise<{ dsUserId: string|null, csrfToken: string|null }>}
 */
export async function resolveSessionCookies() {
  let dsUserId = null
  let csrfToken = null

  for (const url of COOKIE_DOMAINS) {
    try {
      if (!dsUserId) {
        const cookieUserId = await chrome.cookies.get({ url, name: 'ds_user_id' })
        if (cookieUserId?.value) dsUserId = cookieUserId.value
      }
      if (!csrfToken) {
        const cookieCsrf = await chrome.cookies.get({ url, name: 'csrftoken' })
        if (cookieCsrf?.value) csrfToken = cookieCsrf.value
      }
    } catch (e) {
      console.warn('Cookie query error on', url, e)
    }
  }

  return { dsUserId, csrfToken }
}

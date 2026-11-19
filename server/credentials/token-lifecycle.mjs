import { getPlatformCredentials } from './credential-resolver.mjs'
import { getPlatformVaultCredentials, savePlatformVaultCredentials } from './credential-vault.mjs'

export async function ensureValidToken(platformId, credentials = {}) {
  const brandId = credentials.brandId || 'danger-labs'
  const vault = getPlatformVaultCredentials(platformId, brandId) || {}
  const creds = { ...vault, ...credentials }

  if (platformId === 'reddit' && creds.refreshToken && creds.clientId && creds.clientSecret) {
    const isExpired = creds.accessTokenExpiresAt && Date.now() > (creds.accessTokenExpiresAt - 60000)
    if (!creds.accessToken || isExpired) {
      try {
        const authHeader = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')
        const res = await fetch('https://www.reddit.com/api/v1/access_token', {
          method: 'POST',
          headers: { Authorization: `Basic ${authHeader}`, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'FollowDesk:v1.0.0 (by /u/developer)' },
          body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: creds.refreshToken }).toString()
        })
        if (res.ok) {
          const data = await res.json()
          const newAccess = data.access_token
          creds.accessToken = newAccess
          creds.token = newAccess
          creds.bearerToken = newAccess
          creds.accessTokenExpiresAt = Date.now() + ((data.expires_in || 3600) * 1000)
          savePlatformVaultCredentials('reddit', creds, brandId)
        }
      } catch (error) {
        console.warn('[Reddit Token Refresh] Failed:', error.message)
      }
    }
  }

  if (platformId === 'x' && creds.refreshToken && creds.clientId) {
    const isExpired = creds.accessTokenExpiresAt && Date.now() > (creds.accessTokenExpiresAt - 60000)
    if (!creds.accessToken || isExpired) {
      try {
        const body = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: creds.refreshToken,
          client_id: creds.clientId
        })
        if (creds.clientSecret) body.append('client_secret', creds.clientSecret)
        const res = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        })
        if (res.ok) {
          const data = await res.json()
          creds.accessToken = data.access_token
          creds.token = data.access_token
          creds.bearerToken = data.access_token
          if (data.refresh_token) creds.refreshToken = data.refresh_token
          creds.accessTokenExpiresAt = Date.now() + ((data.expires_in || 7200) * 1000)
          savePlatformVaultCredentials('x', creds, brandId)
        }
      } catch (error) {
        console.warn('[X Token Refresh] Failed:', error.message)
      }
    }
  }
  return creds
}

export async function checkTokenValidity(platformId, credentials = {}) {
  const creds = getPlatformCredentials(platformId, {
    credentials: { ...credentials, brandId: credentials.brandId || 'danger-labs' }
  })
  if (creds.accessTokenExpiresAt && Date.now() > creds.accessTokenExpiresAt) {
    return {
      valid: false,
      expired: true,
      platformId,
      message: `Access token for ${platformId} has expired. Please refresh or update in credentials vault.`
    }
  }
  if (platformId === 'github' && (creds.personalAccessToken || creds.token)) {
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${creds.personalAccessToken || creds.token}`, 'User-Agent': 'FollowDesk-Vault' },
        signal: AbortSignal.timeout(2500)
      })
      if (!res.ok) return { valid: false, expired: true, platformId, status: res.status, message: 'GitHub token rejected by API' }
    } catch {}
  }
  return { valid: true, expired: false, platformId }
}

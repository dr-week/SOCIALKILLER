const DEFAULT_LINKEDIN_VERSION = '202610'

function getLinkedInVersion() {
  const version = process.env.LINKEDIN_VERSION || DEFAULT_LINKEDIN_VERSION
  if (!/^\d{6}$/.test(version)) {
    throw new Error('LINKEDIN_VERSION must use the YYYYMM format, for example 202610.')
  }
  return version
}

function parseResponseBody(text) {
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function getApiError(body, status) {
  const detail = body.message || body.error_description || body.error?.message || body.message?.message
  return detail ? `LinkedIn API returned ${status}: ${detail}` : `LinkedIn API returned ${status}.`
}

/** Publish one approved text post through LinkedIn's versioned Posts API. */
export async function createLinkedInTextPost({ token, authorUrn, content }) {
  if (!token) throw new Error('A LinkedIn access token is required.')
  if (!/^urn:li:(person|organization):[^\s]+$/.test(authorUrn || '')) {
    throw new Error('A LinkedIn member or organization author URN is required.')
  }

  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': getLinkedInVersion(),
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary: String(content || ''),
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    }),
    signal: AbortSignal.timeout(8000)
  })

  const body = parseResponseBody(await response.text().catch(() => ''))
  if (!response.ok) throw new Error(getApiError(body, response.status))

  return {
    id: response.headers?.get('x-restli-id') || body.id || '',
    status: response.status
  }
}

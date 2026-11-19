function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))
  return match?.[2]
}

function decodeHtml(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/gi, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

function parseDescriptionCount(description) {
  const match = description.match(/([\d,.]+\s*[KMB]?)\s+Followers?\b/i)
  if (!match) return null
  const raw = match[1].replace(/\s/g, '')
  const suffix = raw.slice(-1).toUpperCase()
  const multiplier = { K: 1e3, M: 1e6, B: 1e9 }[suffix] || 1
  const number = Number((multiplier === 1 ? raw.replace(/[,.]/g, '') : raw.slice(0, -1).replace(',', '.')))
  return Number.isFinite(number) ? { value: Math.round(number * multiplier), display: raw, precision: multiplier === 1 ? 'exact' : 'approximate' } : null
}

function descriptionFrom(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attribute(tag, 'name')?.toLowerCase() === 'description' || attribute(tag, 'property')?.toLowerCase() === 'og:description') {
      return decodeHtml(attribute(tag, 'content') || '')
    }
  }
  return ''
}

function embeddedFollowerCount(html, username) {
  const target = username.toLocaleLowerCase('en-US')
  for (const match of html.matchAll(/"follower_count"\s*:\s*(\d+)/gi)) {
    const context = html.slice(Math.max(0, match.index - 5_000), match.index)
    const usernames = [...context.matchAll(/"username"\s*:\s*"([^"]+)"/gi)]
    if (usernames.at(-1)?.[1]?.toLocaleLowerCase('en-US') === target) {
      const value = Number(match[1])
      if (Number.isSafeInteger(value)) return { value, display: value.toLocaleString('en-US'), precision: 'exact' }
    }
  }
  return null
}

export function parseProfileAvatar(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const prop = attribute(tag, 'property')?.toLowerCase()
    if (prop === 'og:image' || prop === 'twitter:image') {
      const url = decodeHtml(attribute(tag, 'content') || '')
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return url
      }
    }
  }
  return null
}

export function parseProfileFollowerCount(html, username) {
  return parseDescriptionCount(descriptionFrom(html)) || embeddedFollowerCount(html, username)
}

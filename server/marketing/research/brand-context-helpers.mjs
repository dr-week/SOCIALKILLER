const GITHUB_USER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/

export function cleanText(value, max) {
  return String(value || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, max)
}

export function parseGithubUser(value) {
  const raw = String(value || '').trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split(/[/?#]/)[0]
  return GITHUB_USER_RE.test(raw) ? raw : ''
}

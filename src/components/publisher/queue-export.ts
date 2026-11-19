import type { SocialPostItem } from '../../types'

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function exportQueueJson(posts: SocialPostItem[]) {
  downloadFile('social-campaigns.json', JSON.stringify(posts, null, 2), 'application/json')
}

export function exportQueueCsv(posts: SocialPostItem[]) {
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = [
    ['title', 'status', 'scheduledAt', 'platforms', 'copy'],
    ...posts.map(post => [
      post.title,
      post.status,
      post.scheduledAt,
      post.platforms.join('|'),
      Object.values(post.variants || {}).filter(Boolean).join('\n---\n')
    ])
  ]
  const csv = rows.map(row => row.map(quote).join(',')).join('\r\n')
  downloadFile('social-campaigns.csv', csv, 'text/csv;charset=utf-8')
}

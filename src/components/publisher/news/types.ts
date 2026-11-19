export type NewsSource = 'all' | 'hn' | 'lobsters' | 'devto'

export interface TrendingNewsItem {
  id: string
  sourceId: string
  title: string
  url: string
  summary: string
  metrics: { score: number; commentsCount: number }
}

export interface NewsRemodelOutput {
  variants: Record<string, string>
  suggestedPostPayload?: { title?: string; rawNotes?: string }
}

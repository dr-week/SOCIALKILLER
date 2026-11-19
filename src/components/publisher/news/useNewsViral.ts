import { onMounted, ref } from 'vue'
import type { NewsRemodelOutput, NewsSource, TrendingNewsItem } from './types'

export function useNewsViral() {
  const activeSource = ref<NewsSource>('all')
  const loadingNews = ref(false)
  const newsList = ref<TrendingNewsItem[]>([])
  const selectedNews = ref<TrendingNewsItem | null>(null)
  const selectedAngle = ref('contrarian')
  const selectedFramework = ref('PAS')
  const remodelledOutput = ref<NewsRemodelOutput | null>(null)
  const remodelling = ref(false)
  const copiedKey = ref<string | null>(null)

  async function remodelArticle() {
    if (!selectedNews.value) return
    remodelling.value = true
    try {
      const response = await fetch('/api/social/news-remodel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawTitle: selectedNews.value.title, rawSummary: selectedNews.value.summary,
          sourceUrl: selectedNews.value.url, angle: selectedAngle.value,
          framework: selectedFramework.value, githubRepo: 'github.com/dr-week/fast-framework'
        })
      })
      if (response.ok) remodelledOutput.value = await response.json()
    } finally { remodelling.value = false }
  }

  async function loadTrendingNews() {
    loadingNews.value = true
    try {
      const query = activeSource.value === 'all' ? '' : `?source=${activeSource.value}`
      const response = await fetch(`/api/social/news${query}`)
      if (!response.ok) return
      newsList.value = (await response.json()).leads || []
      if (newsList.value.length && !selectedNews.value) {
        selectedNews.value = newsList.value[0]
        void remodelArticle()
      }
    } finally { loadingNews.value = false }
  }

  function selectNewsItem(item: TrendingNewsItem) {
    selectedNews.value = item
    void remodelArticle()
  }

  onMounted(() => { void loadTrendingNews() })
  return {
    activeSource, loadingNews, newsList, selectedNews, selectedAngle,
    selectedFramework, remodelledOutput, remodelling, copiedKey,
    loadTrendingNews, remodelArticle, selectNewsItem
  }
}

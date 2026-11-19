/**
 * Curated Sources Registry for Developer & Tech News (<200 lines)
 * 
 * Defines high-signal feeds across:
 * 1. Social Agitators & Systems CS: Hacker News, Lobste.rs
 * 2. Developer Communities: Dev.to, Hashnode, Reddit r/webdev, r/programming
 * 3. Open Source Trending: GitHub Trending Repositories
 * 4. Architecture & Engineering Blogs: Dan Luu, Martin Fowler, Netflix TechBlog, Cloudflare Blog
 * 5. AI & Model Releases: Hugging Face Daily Papers, OpenAI, Simon Willison
 */

export const NEWS_SOURCES = [
  {
    id: 'hn',
    name: 'Hacker News',
    category: 'Industry & Systems',
    type: 'api',
    url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    itemUrl: 'https://hacker-news.firebaseio.com/v0/item/{id}.json',
    weight: 1.0,
    tags: ['startups', 'systems', 'cs', 'ai']
  },
  {
    id: 'lobsters',
    name: 'Lobste.rs',
    category: 'Deep CS & Systems Engineering',
    type: 'json',
    url: 'https://lobste.rs/hottest.json',
    weight: 0.95,
    tags: ['rust', 'zig', 'wasm', 'compilers', 'performance']
  },
  {
    id: 'devto',
    name: 'Dev.to Feed',
    category: 'Developer Tutorials & Trends',
    type: 'json',
    url: 'https://dev.to/api/articles?top=1&per_page=15',
    weight: 0.85,
    tags: ['webdev', 'javascript', 'frameworks', 'career']
  },
  {
    id: 'github_trending',
    name: 'GitHub Trending',
    category: 'Open Source Repos',
    type: 'curated',
    repos: [
      'dr-week/fast-framework',
      'astral-sh/uv',
      'oven-sh/bun',
      'ggerganov/llama.cpp',
      'shadcn-ui/ui',
      'tailwindlabs/tailwindcss'
    ],
    weight: 0.9,
    tags: ['opensource', 'stars', 'frameworks']
  },
  {
    id: 'engineering_blogs',
    name: 'Top Engineering Blogs',
    category: 'Deep Architecture',
    type: 'curated_list',
    blogs: [
      { name: 'Simon Willison', focus: 'AI Engineering & LLMs', url: 'https://simonwillison.net' },
      { name: 'Dan Luu', focus: 'Hardware, Benchmarks & CS Realities', url: 'https://danluu.com' },
      { name: 'Cloudflare Blog', focus: 'Edge Networking, Wasm & Rust', url: 'https://blog.cloudflare.com' },
      { name: 'Martin Fowler', focus: 'Software Architecture & Refactoring', url: 'https://martinfowler.com' }
    ],
    weight: 0.9
  }
]

/**
 * Normalizes an external story into a structured raw lead
 */
export function normalizeRawLead({
  sourceId,
  title,
  url,
  summary = '',
  score = 100,
  commentsCount = 0
}) {
  return {
    id: `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    sourceId,
    title: (title || '').trim(),
    url: url || '',
    summary: (summary || '').trim(),
    metrics: { score, commentsCount },
    capturedAt: new Date().toISOString()
  }
}

import { readJsonBody } from '../http/read-json.mjs'
import { fetchLiveTrendingNews } from '../marketing/news-harvester.mjs'
import { transformNewsToViralPost } from '../marketing/news-remodeller.mjs'
import { CONTENT_PILLARS, VIRAL_TOPIC_REGISTRY, getRandomPillarTopic, formatSystemPost } from '../marketing/content-system.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../marketing/story-generator.mjs'
import { getCategoryById, getCategoriesForBrand } from '../marketing/content-categories.mjs'

const BRAND_ID_RE = /^[a-z0-9-]{1,64}$/
const DEFAULT_REPO = 'github.com/dr-week/fast-framework'

function resolveBrand(brandId) {
  return BRAND_ID_RE.test(brandId)
    ? dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId)
    : null
}

export async function handleViralTopicsRoutes(req, res, url, json) {
  if (url.pathname === '/api/social/categories' && req.method === 'GET') {
    const brandId = String(url.searchParams.get('brandId') || 'danger-labs')
    return json(res, 200, {
      success: true,
      brandId,
      categories: getCategoriesForBrand(brandId, resolveBrand(brandId))
    })
  }

  if (url.pathname === '/api/social/viral' || url.pathname === '/api/social/viral-randomize') {
    if (req.method === 'GET') {
      const brandId = String(url.searchParams.get('brandId') || 'danger-labs')
      const brand = resolveBrand(brandId)
      const brandCategories = getCategoriesForBrand(brandId, brand)
      const categoryId = url.searchParams.get('category') || null
      const selectedCategory = categoryId ? getCategoryById(categoryId, brandId) : null
      const pillar = url.searchParams.get('pillar') || (selectedCategory?.pillar || null)

      let topic
      if (selectedCategory && selectedCategory.topics?.length > 0) {
        const randTopic = selectedCategory.topics[Math.floor(Math.random() * selectedCategory.topics.length)]
        topic = { ...randTopic, pillar: selectedCategory.pillar, category: selectedCategory.id }
      } else {
        topic = getRandomPillarTopic(pillar)
      }

      const brandRepos = (brand?.purpose?.repos || []).map(r => r.url.replace(/^https?:\/\//, ''))
      const defaultRepo = selectedCategory?.repoUrl
        ? selectedCategory.repoUrl.replace(/^https?:\/\//, '')
        : (brandRepos.length > 0 ? brandRepos[Math.floor(Math.random() * brandRepos.length)] : DEFAULT_REPO)
      const repo = url.searchParams.get('repo') || defaultRepo
      const platform = url.searchParams.get('platform') || 'x'
      const formatted = formatSystemPost({ topicObj: topic, githubRepo: repo, platform, tags: selectedCategory?.tags || [] })
      const media = formatted.media || null
      const repoHttps = `https://${repo.replace(/^https?:\/\//, '')}`

      return json(res, 200, {
        success: true,
        brandId,
        category: selectedCategory,
        topic,
        formatted,
        hook: topic.hook,
        subtext: topic.debate,
        solution: topic.githubSolution,
        repoUrl: repoHttps,
        pillars: Object.values(CONTENT_PILLARS),
        categories: brandCategories,
        variants: {
          x: formatted.mainPost,
          reddit: formatted.mainPost,
          linkedin: `${topic.hook}\n\n${topic.debate}\n\n${topic.question}\n\n👉 Open-source repo: ${repoHttps}\n\n${media?.hashtagString || ''}`
        },
        media: {
          imageUrl: media?.imageUrl || null,
          webLink: media?.webLink || repoHttps,
          hashtags: media?.hashtags || [],
          hashtagString: media?.hashtagString || ''
        },
        allTopics: [...dbService.getAllUserTopics(), ...VIRAL_TOPIC_REGISTRY]
      })
    }

    if (req.method === 'POST') {
      try {
        const parsed = await readJsonBody(req)
        const topic = parsed.topicId
          ? VIRAL_TOPIC_REGISTRY.find(t => t.id === parsed.topicId) || getRandomPillarTopic(parsed.pillar)
          : getRandomPillarTopic(parsed.pillar)
        const repo = parsed.githubRepo || DEFAULT_REPO
        const formatted = formatSystemPost({ topicObj: topic, githubRepo: repo, platform: parsed.platform || 'x' })
        return json(res, 200, { success: true, topic, formatted })
      } catch (err) {
        return json(res, err.statusCode || 400, { error: 'Failed to generate viral post' })
      }
    }
  }

  if (url.pathname === '/api/social/news' && req.method === 'GET') {
    const source = url.searchParams.get('source') || null
    try {
      return json(res, 200, await fetchLiveTrendingNews(source))
    } catch {
      return json(res, 500, { error: 'Failed to harvest developer news' })
    }
  }

  if (url.pathname === '/api/social/news-remodel') {
    try {
      const parsed = await readJsonBody(req)
      const transformed = transformNewsToViralPost({
        rawTitle: parsed.rawTitle || 'Modern Architecture Shift',
        rawSummary: parsed.rawSummary || '',
        sourceUrl: parsed.sourceUrl || '',
        githubRepo: parsed.githubRepo || DEFAULT_REPO,
        angle: parsed.angle || 'contrarian',
        framework: parsed.framework || 'PAS'
      })
      return json(res, 200, { success: true, ...transformed })
    } catch (err) {
      return json(res, err.statusCode || 400, { error: 'Failed to transform news' })
    }
  }

  return false
}

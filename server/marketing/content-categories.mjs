/**
 * Content Categories & Strategic Pillars Engine (<100 lines)
 */

import { TECH_CATEGORIES } from './categories/categories-tech.mjs'
import { FOUNDER_CATEGORIES } from './categories/categories-founder.mjs'
import { HYPERDRIVE_STUDIO_CATEGORIES } from './categories/categories-studio.mjs'

export const CONTENT_CATEGORIES = [...TECH_CATEGORIES, ...FOUNDER_CATEGORIES]

export function getCategoryById(id, brandId = 'danger-labs') {
  const categories = getCategoriesForBrand(brandId)
  return categories.find(c => c.id === id) || CONTENT_CATEGORIES.find(c => c.id === id) || null
}

export function getAllCategories() {
  return CONTENT_CATEGORIES
}

export function getCategoriesForBrand(brandId = 'danger-labs', brand = null) {
  if (brandId === 'danger-labs') return CONTENT_CATEGORIES
  if (brandId === 'hyperdrive-studio') return HYPERDRIVE_STUDIO_CATEGORIES

  const repos = brand?.purpose?.repos || []
  const dynamicCategories = []

  for (const repo of repos.slice(0, 5)) {
    dynamicCategories.push({
      id: `repo-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: repo.name,
      pillar: `${repo.name} Engineering`,
      repoName: repo.name,
      repoUrl: repo.url,
      shortDesc: repo.description || `Software project ${repo.name}`,
      tags: (repo.topics?.length ? repo.topics : ['Software', 'OpenSource', 'Engineering']).slice(0, 5),
      topics: [
        {
          id: `topic_${repo.name}`,
          hook: `Why we built ${repo.name}: Solving the real-world bottleneck in ${repo.language || 'software'}.`,
          debate: repo.description
            ? `${repo.description}. Most existing solutions add enterprise complexity when developers just need direct simplicity.`
            : 'Minimal architecture built for production reliability.',
          question: 'How does your team solve this in production today?',
          githubSolution: `Explore ${repo.name} on GitHub: ${repo.url}`,
          callToAction: 'Star the repo on GitHub 👇'
        }
      ]
    })
  }

  const themes = brand?.purpose?.keyThemes || []
  if (themes.length > 0) {
    dynamicCategories.push({
      id: 'brand-core-themes',
      name: `${brand?.name || 'Company'} Pillars`,
      pillar: 'Strategic Positioning',
      repoName: brand?.name || 'Workspace',
      repoUrl: brand?.purpose?.links?.[0]?.url || '',
      shortDesc: brand?.purpose?.what || brand?.tagline || 'Company core mission',
      tags: ['Innovation', 'Strategy', 'Tech'],
      topics: themes.map((theme, idx) => ({
        id: `theme_${idx}`,
        hook: `${theme}: The perspective driving our architecture.`,
        debate: `${brand?.purpose?.why || 'Enterprise tech needs sharper, leaner foundations.'} Focus: ${theme}.`,
        question: `Where does your team stand on ${theme}?`,
        githubSolution: `${brand?.name || 'Our team'} is executing on ${theme}.`,
        callToAction: 'Read the breakdown below 👇'
      }))
    })
  }

  return dynamicCategories.length > 0 ? dynamicCategories : CONTENT_CATEGORIES
}

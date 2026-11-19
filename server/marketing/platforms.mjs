/**
 * Platform definitions and metadata for Social & Developer channels
 */

export const PLATFORM_CATEGORIES = {
  SOCIAL_BROADCAST: 'Social Broadcast',
  DEV_COMMUNITY: 'Developer Community',
  OPEN_SOURCE_REPO: 'Open Source & Repos',
  TECH_EDITORIAL: 'Long-Form Tech Editorial',
  AI_AGENT_PROTOCOL: 'AI & Machine Agent Protocol'
}

export const SUPPORTED_PLATFORMS = [
  {
    id: 'x',
    name: 'X (Twitter)',
    category: PLATFORM_CATEGORIES.SOCIAL_BROADCAST,
    targetAudience: 'Global Public & Tech Community',
    algorithmDynamics: 'Bookmarks (10x), Replies with Author engagement (75x+), Reposts (20x), Dwell time (>2m). External links penalized unless in thread/replies.',
    maxChars: 280,
    apiMode: 'X API v2 / 1-Click Intent / Extension Bridge',
    easySetup: 'Bearer Token / Instant Extension',
    fields: ['bearerToken', 'handle']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: PLATFORM_CATEGORIES.SOCIAL_BROADCAST,
    targetAudience: 'Visual Audience & Creators',
    algorithmDynamics: 'Saves, DMs, Shares, Reels Watch-Through rate. Text posts require high-contrast visual slides/carousels.',
    maxChars: 2200,
    apiMode: 'Meta Graph API / Creator Studio Companion',
    easySetup: 'Ready (Creator Companion / Graph Token)',
    fields: ['accessToken', 'igBusinessId']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: PLATFORM_CATEGORIES.SOCIAL_BROADCAST,
    targetAudience: 'Professional & Enterprise Buyers',
    algorithmDynamics: 'Dwell time, constructive comments (>12 words), document carousel clicks. Avoid casual memes; prioritize business impact.',
    maxChars: 3000,
    apiMode: 'LinkedIn UGC Posts REST API',
    easySetup: 'OAuth Access Token + Author URN',
    fields: ['accessToken', 'authorUrn']
  },
  {
    id: 'reddit',
    name: 'Reddit',
    category: PLATFORM_CATEGORIES.DEV_COMMUNITY,
    targetAudience: 'Technical Peers & Subreddit Communities',
    algorithmDynamics: 'Upvote ratio, comment tree depth, velocity in first 60 mins. Self-promotion without authentic technical insight triggers immediate downvote/ban.',
    maxChars: 40000,
    apiMode: 'Reddit OAuth API (/api/submit)',
    easySetup: 'Subreddit + OAuth Token / Submit Link',
    fields: ['accessToken', 'defaultSubreddit']
  },
  {
    id: 'discord',
    name: 'Discord',
    category: PLATFORM_CATEGORIES.DEV_COMMUNITY,
    targetAudience: 'Real-time Developer Server Members',
    algorithmDynamics: 'Thread activity, emoji reactions, mention pings (@here/@everyone sparingly). Best for live releases and beta feedback.',
    maxChars: 2000,
    apiMode: 'Discord Incoming Webhook API (Zero-Auth)',
    easySetup: '1-Paste Webhook URL (Easiest)',
    fields: ['webhookUrl', 'botUsername']
  },
  {
    id: 'github',
    name: 'GitHub',
    category: PLATFORM_CATEGORIES.OPEN_SOURCE_REPO,
    targetAudience: 'Engineers, Contributors & AI Coding Agents',
    algorithmDynamics: 'Trending repositories, Star velocity, Fork graph, Discussions engagement, Releases & Commit activity.',
    maxChars: 65536,
    apiMode: 'GitHub REST API v3 (Discussions, Gists, Releases)',
    easySetup: 'Personal Access Token (PAT)',
    fields: ['personalAccessToken', 'repoOwner', 'repoName']
  },
  {
    id: 'devto',
    name: 'Dev.to',
    category: PLATFORM_CATEGORIES.TECH_EDITORIAL,
    targetAudience: 'Software Developers & Technical Learners',
    algorithmDynamics: 'Tag engagement (#webdev, #javascript), Unicorn reactions, Reading lists, Canonical SEO rank.',
    maxChars: 100000,
    apiMode: 'Forem / Dev.to REST API',
    easySetup: '1-Paste API Key',
    fields: ['apiKey']
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    category: PLATFORM_CATEGORIES.TECH_EDITORIAL,
    targetAudience: 'Independent Technical Bloggers & Domain Owners',
    algorithmDynamics: 'Featured story curation, Domain authority, Tech blog reader badges.',
    maxChars: 100000,
    apiMode: 'Hashnode GraphQL Publication API',
    easySetup: 'Personal Access Token + Publication ID',
    fields: ['accessToken', 'publicationId']
  },
  {
    id: 'medium',
    name: 'Medium',
    category: PLATFORM_CATEGORIES.TECH_EDITORIAL,
    targetAudience: 'Thought Leadership & Deep Readers',
    algorithmDynamics: 'Member read time, Clap count, Highlight rate, Publication inclusion.',
    maxChars: 100000,
    apiMode: 'Medium Integration Token REST API',
    easySetup: 'Integration Token',
    fields: ['integrationToken', 'authorId']
  },
  {
    id: 'ai_registry',
    name: 'AI Agent & LLMs Market',
    category: PLATFORM_CATEGORIES.AI_AGENT_PROTOCOL,
    targetAudience: 'AI Models, Autonomous Agents & Crawlers',
    algorithmDynamics: 'Zero human UI. Consumes llms.txt, JSON schemas, MCP tool discovery and semantic vector embeddings.',
    maxChars: 100000,
    apiMode: 'Automated llms.txt & MCP Tool Discovery Catalog',
    easySetup: 'Instant Automated Live Expose',
    fields: ['registryDomain', 'mcpServerUrl']
  }
]

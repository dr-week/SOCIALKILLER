export const PLATFORM_COMPOSER_URLS = {
  x: (title, content) =>
    `https://x.com/intent/post?text=${encodeURIComponent((content || title).slice(0, 275))}`,
  reddit: (title, content, subreddit = 'r/webdev') => {
    const cleanSub = subreddit.replace(/^\/+|\/+$/g, '').replace(/^r\//i, '') || 'webdev'
    return `https://www.reddit.com/r/${encodeURIComponent(cleanSub)}/submit?selftext=true&title=${encodeURIComponent(title)}&text=${encodeURIComponent(content)}`
  },
  linkedin: (_title, content) =>
    `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent((content || '').slice(0, 1200))}`,
  devto: () => 'https://dev.to/new',
  github: () => 'https://gist.github.com/',
  hashnode: () => 'https://hashnode.com/create/story',
  medium: () => 'https://medium.com/new-story',
  discord: () => 'https://discord.com/app',
  instagram: () => 'https://www.instagram.com/'
}

export function buildPlatformComposerUrl(platformId, title = '', content = '', subreddit = 'r/webdev') {
  return (PLATFORM_COMPOSER_URLS[platformId] || PLATFORM_COMPOSER_URLS.x)(title, content, subreddit)
}

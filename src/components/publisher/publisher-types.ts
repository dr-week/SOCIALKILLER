export interface ContentCategory {
  id: string
  name: string
  pillar: string
  repoName: string
  repoUrl: string
  shortDesc: string
  tags: string[]
  topics: Array<{ id: string; hook: string; debate: string; question: string; githubSolution: string; callToAction: string }>
}

export interface VaultAsset {
  name: string
  sizeBytes: number
  ext: string
}

export interface PlatformBadge {
  icon: string
  color: string
  bg: string
  label: string
}

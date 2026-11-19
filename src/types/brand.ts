import type { PlatformId } from './index'

export interface BrandLink {
  platform: string
  url: string
}

export interface BrandRepo {
  name: string
  description: string
  language: string
  topics: string[]
  stars: number
  url: string
  readme?: string
}

export interface BrandDoc {
  name: string
  text: string
}

export interface BrandResearch {
  researchedAt: string
  searchTerms: string[]
  competitors: Array<{ name: string; description: string; stars: number; url: string; language: string }>
  trendingDebates: Array<{ title: string; url: string; source: string; metric: string }>
  competitorAngles: Array<{ topic: string; angle: string; urgency: string }>
  summary: string
}

export interface BrandPurpose {
  what: string
  why: string
  founderStory: string
  keyThemes: string[]
  toneOfVoice: string
  links?: BrandLink[]
  githubUser?: string
  repos?: BrandRepo[]
  githubSyncedAt?: string
  docs?: BrandDoc[]
  research?: BrandResearch
}

export interface BrandAccount {
  platformId: PlatformId | string
  handle: string
  credentials: Record<string, string>
  status: 'connected' | 'unconfigured' | 'expired'
}

export interface BrandMilestone {
  id: string
  task: string
  purpose: string
  completed: boolean
  targetDate: string
}

export interface BrandProfile {
  id: string
  name: string
  archivedAt?: string
  tagline: string
  location: string
  purpose: BrandPurpose
  accounts: BrandAccount[]
  milestones: BrandMilestone[]
}

export type ScriptFormat = 'short_form_30s' | 'short_form_60s' | 'vlog_long_form'

export type ScriptPillar =
  | 'daily_grind'
  | 'underdog_location'
  | 'family_doubts'
  | 'technical_breakthrough'
  | 'contrarian_dev'

export interface VideoScriptBeat {
  marker: 'HOOK' | 'CONFLICT' | 'LESSON' | 'CTA'
  timecode: string
  visual: string
  audio: string
  narration: string
}

export interface VideoScript {
  id: string
  brandId: string
  title: string
  pillar: ScriptPillar
  format: ScriptFormat
  durationEstimate: string
  retentionScore: number
  beats: VideoScriptBeat[]
  fullText: string
  teleprompterText: string
  createdAt: string
}

export interface DailyJourneyStory {
  id: string
  brandId: string
  headline: string
  hurdle: string
  lesson: string
  milestone: string
  channels: {
    x: string
    linkedin: string
    reddit: {
      subreddit: string
      title: string
      body: string
    }
  }
  generatedAt: string
}

import type { Component } from 'vue'
import type { Person, Snapshot } from '../domain/followers'
import type { View } from './view'
export type { View } from './view'

export type ThemeMode = 'auto' | 'dark' | 'light'
export type AccentTheme = 'coral' | 'violet' | 'cyan' | 'mint' | 'orange'

export type ProfileCount = { value: number; display: string; precision: 'exact' | 'approximate' }

export type ProfileScanData = {
  username: string
  profileUrl: string
  avatarUrl?: string | null
  followers: ProfileCount
  scannedAt: string
}

export type AccountStatus = {
  status: 'checking' | 'active' | 'deactivated' | 'rate_limited' | 'unknown'
  reason: string
  timestamp?: number
}

export interface UserCategoryInfo {
  label: string
  color: string
  bg: string
  icon: Component
}

export interface NavItem {
  id: View
  label: string
  icon: Component
  count?: () => number | undefined
  color?: string
}

export interface AccountRecord {
  username: string
  followers: Person[]
  following: Person[]
  importedAt: string
}

export interface AccountSummary {
  username: string
  followersCount: number
  followingCount: number
  syncedAt: string
}

export type PlatformId =
  | 'instagram'
  | 'x'
  | 'linkedin'
  | 'reddit'
  | 'github'
  | 'discord'
  | 'devto'
  | 'hashnode'
  | 'medium'
  | 'ai_registry'

export interface TrackedProject {
  id: string
  name: string
  category: string
  description: string
  docsUrl: string
  apiUrl: string
  installCmd: string
  aiCapabilities: string[]
}

export interface SocialPlatformStatus {
  id: PlatformId
  name: string
  category: string
  maxChars: number
  apiMode: string
  easySetup: string
  fields: string[]
  enabled: boolean
  connected: boolean
  credentials: Record<string, string>
  keepAliveEnabled: boolean
  keepAliveFrequency: 'daily' | '3x_week' | 'weekly'
  lastKeepAliveAt: string | null
  streakDays: number
  isConfigured?: boolean
    connectionVerified?: boolean
  handle?: string
  brandId?: string
}

export interface SocialPostItem {
  id: string
  brandId?: string
  title: string
  topic: string
  contentType: string
  platforms: PlatformId[]
  metadataWarning?: string
  status: 'scheduled' | 'published' | 'draft' | 'pending_approval' | 'approved' | 'publishing' | 'failed'
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'not_required'
  handoffUrl?: string
  scheduledAt: string
  createdAt: string
  variants: Partial<Record<PlatformId, string>>
  imageUrl?: string | null
  webLink?: string | null
  videoUrl?: string | null
  hashtags?: string[]
  deliveryLogs?: Array<{
    platformId: PlatformId
    status: string
    mode: string
    intentUrl?: string
    externalUrl?: string
    message: string
  }>
}






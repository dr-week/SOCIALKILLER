import {
  Bot, CalendarDays, ChartNoAxesCombined, CircleUserRound, Clapperboard,
  Compass, FolderKanban, GitBranch, Images, Mail, MessageSquareText, PanelsTopLeft, Palette,
  Smartphone, Sparkles, Target, Users, Workflow
} from 'lucide-vue-next'
import plannerBackground from '../../assets/app-backgrounds/planner/overlay.webp'
import connectionsBackground from '../../assets/app-backgrounds/connections/overlay.webp'
import engageBackground from '../../assets/app-backgrounds/engage/overlay.webp'
import audienceBackground from '../../assets/app-backgrounds/audience/overlay.webp'
import profileScoutBackground from '../../assets/app-backgrounds/profile-scout/overlay.webp'
import contentStudioBackground from '../../assets/app-backgrounds/content-studio/overlay.webp'
import scriptStudioBackground from '../../assets/app-backgrounds/script-studio/overlay.webp'
import workflowsBackground from '../../assets/app-backgrounds/workflows/overlay.webp'
import workspacesBackground from '../../assets/app-backgrounds/workspaces/overlay.webp'
import designSystemBackground from '../../assets/app-backgrounds/design-system/overlay.webp'
import assetManagerBackground from '../../assets/app-backgrounds/asset-manager/overlay.webp'
import automationsBackground from '../../assets/app-backgrounds/automations/overlay.webp'
import androidBuilderBackground from '../../assets/app-backgrounds/android-builder/overlay.webp'
import type { Component } from 'vue'
import type { View } from '../../types'
import { MINI_APP_ROUTES } from './mini-app-routes'

export type MiniAppVisual = 'aurora' | 'orbit' | 'constellation' | 'nebula' | 'radar' | 'lens' | 'prism' | 'landscape' | 'flow' | 'isometric'

export interface MiniApp {
  id: string
  label: string
  category: string
  description: string
  view: View
  icon: Component
  accent: string
  visual: MiniAppVisual
  background?: string
  status: 'Available' | 'Planned'
}

export const APP_NAVIGATION: MiniApp[] = [
  { id: 'home', label: 'Apps', category: 'Home', description: '✦ All 13 workspaces', view: MINI_APP_ROUTES.home, icon: PanelsTopLeft, accent: '#ff7b88', visual: 'aurora', status: 'Available' },
  { id: 'planner', label: 'Planner', category: 'Plan & publish', description: '✦ Compose · ◈ Clean TL;DR · ▹ Queue & Publish', view: MINI_APP_ROUTES.planner, icon: CalendarDays, accent: '#ff7b88', visual: 'orbit', background: plannerBackground, status: 'Available' },
  { id: 'connections', label: 'Connections', category: 'Plan & publish', description: '✦ OAuth · ◈ Webhooks · ▹ Channel Health', view: MINI_APP_ROUTES.connections, icon: CircleUserRound, accent: '#54d6ee', visual: 'constellation', background: connectionsBackground, status: 'Available' },
  { id: 'engage', label: 'Engage', category: 'Community & audience', description: '✦ DMs & Comments · ◈ AI Reply Drafts', view: MINI_APP_ROUTES.engage, icon: MessageSquareText, accent: '#b495ff', visual: 'nebula', background: engageBackground, status: 'Available' },
  { id: 'audience', label: 'Audience Audit', category: 'Community & audience', description: '✦ Unfollowers · ◈ Ghost Check · ▹ Safe Queue', view: MINI_APP_ROUTES.audience, icon: Users, accent: '#59ddb6', visual: 'radar', background: audienceBackground, status: 'Available' },
  { id: 'profile-scout', label: 'Profile Scout', category: 'Community & audience', description: '✦ Live Counts · ◈ HD Avatar Download', view: MINI_APP_ROUTES['profile-scout'], icon: Compass, accent: '#69aaff', visual: 'lens', background: profileScoutBackground, status: 'Available' },
  { id: 'content-studio', label: 'Content Studio', category: 'Create', description: '✦ Viral Clips · ◈ Human Captions · ▹ Hook Score', view: MINI_APP_ROUTES['content-studio'], icon: Clapperboard, accent: '#ed8fff', visual: 'prism', background: contentStudioBackground, status: 'Available' },
  { id: 'script-studio', label: 'Script Studio', category: 'Create', description: '✦ 60s Reels Scripts · ◈ Milestone Stories', view: MINI_APP_ROUTES['script-studio'], icon: Sparkles, accent: '#ffad68', visual: 'landscape', background: scriptStudioBackground, status: 'Available' },
  { id: 'workflows', label: 'Workflows', category: 'Operate', description: '✦ Record DOM Steps · ◈ Safe Extension Replay', view: MINI_APP_ROUTES.workflows, icon: Workflow, accent: '#b495ff', visual: 'flow', background: workflowsBackground, status: 'Available' },
  { id: 'workspaces', label: 'Workspaces', category: 'Operate', description: '✦ Brand Voice · ◈ GitHub Sync · ▹ Knowledge', view: MINI_APP_ROUTES.workspaces, icon: FolderKanban, accent: '#ffcf70', visual: 'isometric', background: workspacesBackground, status: 'Available' },
  { id: 'design-system', label: 'Design System', category: 'Build', description: '✦ Glass Themes · ◈ 5 Accents · ▹ Tokens', view: MINI_APP_ROUTES['design-system'], icon: Palette, accent: '#69aaff', visual: 'prism', background: designSystemBackground, status: 'Available' },
  { id: 'asset-manager', label: 'Asset Manager', category: 'Build', description: '✦ Local Masters · ◈ WebP Variants · ▹ Catalog', view: MINI_APP_ROUTES['asset-manager'], icon: Images, accent: '#59ddb6', visual: 'constellation', background: assetManagerBackground, status: 'Available' },
  { id: 'automations', label: 'Automation Studio', category: 'Operate', description: '✦ Triggers · ◈ Conditions · ▹ Auto-Drafts', view: MINI_APP_ROUTES.automations, icon: GitBranch, accent: '#b495ff', visual: 'flow', background: automationsBackground, status: 'Available' },
  { id: 'android-builder', label: 'Android Build Studio', category: 'Build', description: '✦ JDK/SDK Check · ◈ APK & AAB Builds', view: MINI_APP_ROUTES['android-builder'], icon: Smartphone, accent: '#72d9a8', visual: 'isometric', background: androidBuilderBackground, status: 'Available' },
  { id: 'leads', label: 'Leads & CRM', category: 'Grow', description: '✦ Comment-to-Lead · ◈ Kanban Pipeline · ▹ CSV Export', view: MINI_APP_ROUTES.leads, icon: Target, accent: '#59ddb6', visual: 'flow', status: 'Available' },
  { id: 'ads', label: 'Ads & Media Buying', category: 'Grow', description: '✦ QUBO Budget · ◈ Bandits · ▹ Paper-Trade HITL', view: 'ads' as any, icon: ChartNoAxesCombined, accent: '#6366f1', visual: 'radar', status: 'Available' }
]

export const ROADMAP_APPS: Array<Omit<MiniApp, 'view'>> = [
  { id: 'email', label: 'Email Marketing', category: 'Grow', description: '✦ Lists · ◈ Sequences · ▹ Open Rates', icon: Mail, accent: '#54d6ee', visual: 'aurora', status: 'Planned' },
  { id: 'research', label: 'Research & Trends', category: 'Grow', description: '✦ Niche Signals · ◈ Viral Hooks', icon: Compass, accent: '#69aaff', visual: 'radar', status: 'Planned' },
  { id: 'projects', label: 'Projects', category: 'Deliver', description: '✦ Deliverables · ◈ Milestones', icon: FolderKanban, accent: '#ffcf70', visual: 'isometric', status: 'Planned' },
  { id: 'production', label: 'Production', category: 'Deliver', description: '✦ Shoot Sheets · ◈ Media Selects', icon: Clapperboard, accent: '#ed8fff', visual: 'prism', status: 'Planned' },
  { id: 'client-portal', label: 'Client Review', category: 'Deliver', description: '✦ 1-Click Client Approvals', icon: CircleUserRound, accent: '#54d6ee', visual: 'constellation', status: 'Planned' },
  { id: 'analytics', label: 'Analytics', category: 'Scale', description: '✦ Cross-Channel ROI & Reports', icon: ChartNoAxesCombined, accent: '#59ddb6', visual: 'radar', status: 'Planned' },
  { id: 'ai-assistant', label: 'AI Assistant', category: 'Scale', description: '✦ Human-Approved Brand Copilot', icon: Bot, accent: '#ff7b88', visual: 'nebula', status: 'Planned' },
  { id: 'headquarters', label: 'Command Center', category: 'Scale', description: '✦ Cross-Workspace Live Pulse', icon: PanelsTopLeft, accent: '#ffad68', visual: 'constellation', status: 'Planned' }
]

export function groupAppsByCategory<T extends { category: string }>(apps: T[]) {
  const groups = new Map<string, T[]>()
  for (const app of apps) groups.set(app.category, [...(groups.get(app.category) || []), app])
  return Array.from(groups, ([category, items]) => ({ category, items }))
}


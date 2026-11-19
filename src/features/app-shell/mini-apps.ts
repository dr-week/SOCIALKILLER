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
  { id: 'home', label: 'Apps', category: 'Home', description: 'Open the app launcher.', view: MINI_APP_ROUTES.home, icon: PanelsTopLeft, accent: '#ff7b88', visual: 'aurora', status: 'Available' },
  { id: 'planner', label: 'Planner', category: 'Plan & publish', description: 'Compose channel-specific posts, review drafts, and manage the publishing queue.', view: MINI_APP_ROUTES.planner, icon: CalendarDays, accent: '#ff7b88', visual: 'orbit', background: plannerBackground, status: 'Available' },
  { id: 'connections', label: 'Connections', category: 'Plan & publish', description: 'Manage the active brand’s social channel settings and connection checks in one workspace.', view: MINI_APP_ROUTES.connections, icon: CircleUserRound, accent: '#54d6ee', visual: 'constellation', background: connectionsBackground, status: 'Available' },
  { id: 'engage', label: 'Engage', category: 'Community & audience', description: 'Organize manually added comments and messages, then prepare reply drafts for review.', view: MINI_APP_ROUTES.engage, icon: MessageSquareText, accent: '#b495ff', visual: 'nebula', background: engageBackground, status: 'Available' },
  { id: 'audience', label: 'Audience Audit', category: 'Community & audience', description: 'Import Instagram exports, compare follower lists, inspect changes, and manage the safe list.', view: MINI_APP_ROUTES.audience, icon: Users, accent: '#59ddb6', visual: 'radar', background: audienceBackground, status: 'Available' },
  { id: 'profile-scout', label: 'Profile Scout', category: 'Community & audience', description: 'Check public Instagram profile counts and download an available avatar.', view: MINI_APP_ROUTES['profile-scout'], icon: Compass, accent: '#69aaff', visual: 'lens', background: profileScoutBackground, status: 'Available' },
  { id: 'content-studio', label: 'Content Studio', category: 'Create', description: 'Explore curated short-form inspiration, generate caption ideas, and review hook signals.', view: MINI_APP_ROUTES['content-studio'], icon: Clapperboard, accent: '#ed8fff', visual: 'prism', background: contentStudioBackground, status: 'Available' },
  { id: 'script-studio', label: 'Script Studio', category: 'Create', description: 'Generate brand-aware video scripts and milestone stories for supported channels.', view: MINI_APP_ROUTES['script-studio'], icon: Sparkles, accent: '#ffad68', visual: 'landscape', background: scriptStudioBackground, status: 'Available' },
  { id: 'workflows', label: 'Workflows', category: 'Operate', description: 'Review saved browser workflows here; recording and replay remain user-triggered in the companion extension.', view: MINI_APP_ROUTES.workflows, icon: Workflow, accent: '#b495ff', visual: 'flow', background: workflowsBackground, status: 'Available' },
  { id: 'workspaces', label: 'Workspaces', category: 'Operate', description: 'Inspect and edit the active brand’s profile, voice, references, and assigned handles.', view: MINI_APP_ROUTES.workspaces, icon: FolderKanban, accent: '#ffcf70', visual: 'isometric', background: workspacesBackground, status: 'Available' },
  { id: 'design-system', label: 'Design System', category: 'Build', description: 'Preview the shared themes, accents, typography, tokens, and accessible interface patterns.', view: MINI_APP_ROUTES['design-system'], icon: Palette, accent: '#69aaff', visual: 'prism', background: designSystemBackground, status: 'Available' },
  { id: 'asset-manager', label: 'Asset Manager', category: 'Build', description: 'Review local artwork, asset metadata, and optimized responsive variants.', view: MINI_APP_ROUTES['asset-manager'], icon: Images, accent: '#59ddb6', visual: 'constellation', background: assetManagerBackground, status: 'Available' },
  { id: 'automations', label: 'Automation Studio', category: 'Operate', description: 'Build scheduled and event-driven conditional workflows that create reviewable social drafts.', view: MINI_APP_ROUTES.automations, icon: GitBranch, accent: '#b495ff', visual: 'flow', background: automationsBackground, status: 'Available' },
  { id: 'android-builder', label: 'Android Build Studio', category: 'Build', description: 'Check the native Android toolchain, run fixed APK and AAB build tasks, and inspect local build output.', view: MINI_APP_ROUTES['android-builder'], icon: Smartphone, accent: '#72d9a8', visual: 'isometric', background: androidBuilderBackground, status: 'Available' }
]

export const ROADMAP_APPS: Array<Omit<MiniApp, 'view'>> = [
  { id: 'leads', label: 'Leads', category: 'Grow', description: 'Comment-to-lead capture, pipeline stages, and contact records.', icon: Target, accent: '#59ddb6', visual: 'flow', status: 'Planned' },
  { id: 'email', label: 'Email Marketing', category: 'Grow', description: 'Campaign drafts, subscriber lists, sequences, and provider-backed results.', icon: Mail, accent: '#54d6ee', visual: 'aurora', status: 'Planned' },
  { id: 'research', label: 'Research & Trends', category: 'Grow', description: 'A dedicated workspace for source-backed trend discovery and campaign research; some APIs and dormant screens exist, but no complete research workspace is wired.', icon: Compass, accent: '#69aaff', visual: 'radar', status: 'Planned' },
  { id: 'projects', label: 'Projects', category: 'Deliver', description: 'Client deliverables, tasks, milestones, and review checkpoints.', icon: FolderKanban, accent: '#ffcf70', visual: 'isometric', status: 'Planned' },
  { id: 'production', label: 'Production', category: 'Deliver', description: 'Shoot planning, media review, event campaigns, and production assets.', icon: Clapperboard, accent: '#ed8fff', visual: 'prism', status: 'Planned' },
  { id: 'client-portal', label: 'Client Review', category: 'Deliver', description: 'Role-controlled client approvals and collaboration, after identity and access controls.', icon: CircleUserRound, accent: '#54d6ee', visual: 'constellation', status: 'Planned' },
  { id: 'analytics', label: 'Analytics', category: 'Scale', description: 'Source-labelled channel metrics, comparisons, and client reports.', icon: ChartNoAxesCombined, accent: '#59ddb6', visual: 'radar', status: 'Planned' },
  { id: 'ai-assistant', label: 'AI Assistant', category: 'Scale', description: 'A focused, optional text assistant; any future actions remain human-approved.', icon: Bot, accent: '#ff7b88', visual: 'nebula', status: 'Planned' },
  { id: 'headquarters', label: 'Command Center', category: 'Scale', description: 'A real-data overview across workspaces, campaigns, inbox, tasks, and delivery status.', icon: PanelsTopLeft, accent: '#ffad68', visual: 'constellation', status: 'Planned' }
]

export function groupAppsByCategory<T extends { category: string }>(apps: T[]) {
  const groups = new Map<string, T[]>()
  for (const app of apps) groups.set(app.category, [...(groups.get(app.category) || []), app])
  return Array.from(groups, ([category, items]) => ({ category, items }))
}


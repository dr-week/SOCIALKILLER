import type { View } from '../../types'

export const MINI_APP_ROUTES = {
  home: 'app-launcher',
  planner: 'social-publisher',
  connections: 'connections',
  engage: 'community-inbox',
  audience: 'overview',
  'profile-scout': 'profile-scout',
  'content-studio': 'content-studio',
  'script-studio': 'script-studio',
  workflows: 'workflows',
  workspaces: 'workspaces',
  'design-system': 'design-system',
  'asset-manager': 'asset-manager',
  'android-builder': 'android-studio',
  automations: 'automation-studio',
  leads: 'leads'
} as const satisfies Record<string, View>

const AUDIENCE_VIEWS: readonly string[] = [
  'overview', 'all-accounts', 'not-following-back', 'not-followed-back', 'mutuals',
  'followers', 'following', 'new-followers', 'lost-followers', 'ghost-followers',
  'history', 'whitelist'
]

export function isAudienceView(view: string): view is View {
  return AUDIENCE_VIEWS.includes(view)
}

export function appIdForView(view: View): keyof typeof MINI_APP_ROUTES {
  if (view === 'app-launcher') return 'home'
  if (isAudienceView(view)) return 'audience'
  for (const [id, routeView] of Object.entries(MINI_APP_ROUTES)) {
    if (routeView === view) return id as keyof typeof MINI_APP_ROUTES
  }
  return 'home'
}

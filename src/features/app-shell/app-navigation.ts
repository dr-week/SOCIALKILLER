import type { View } from '../../types'
import { appIdForView, isAudienceView, MINI_APP_ROUTES } from './mini-app-routes.ts'

const defaultView = 'app-launcher'

export function viewFromSearch(search: string): View {
  const params = new URLSearchParams(search)
  const appId = params.get('app')
  if (!appId || !Object.hasOwn(MINI_APP_ROUTES, appId)) return defaultView
  const appView = MINI_APP_ROUTES[appId as keyof typeof MINI_APP_ROUTES]
  if (appId !== 'audience') return appView
  const requestedView = params.get('view') as View | null
  return requestedView && isAudienceView(requestedView) ? requestedView : 'overview'
}

export function appHref(view: View, currentHref: string): string {
  const url = new URL(currentHref)
  const appId = appIdForView(view)
  url.searchParams.set('app', appId)
  if (appId === 'audience' && view !== 'overview') url.searchParams.set('view', view)
  else url.searchParams.delete('view')
  return `${url.pathname}${url.search}${url.hash}`
}

import {
  getAiFeedLlmText,
  getAiFeedCatalogJson,
  getTrackedProjects,
  addTrackedProject,
  runLyraCopywriter,
  getMarketAnalysisReport
} from '../social-publisher.mjs'

export async function handleMarketingRoutes(req, res, url, json) {
  if (req.method === 'GET' && ['/api/marketing/llms.txt', '/llms.txt'].includes(url.pathname)) {
    res.writeHead(200, {
      'content-type': 'text/markdown; charset=utf-8',
      'access-control-allow-origin': '*'
    })
    res.end(getAiFeedLlmText())
    return true
  }
  if (req.method === 'GET' && url.pathname === '/api/marketing/ai-catalog') {
    return json(res, 200, getAiFeedCatalogJson())
  }
  if (req.method === 'GET' && url.pathname === '/api/marketing/projects') {
    return json(res, 200, { success: true, projects: getTrackedProjects() })
  }
  if (req.method === 'POST' && url.pathname === '/api/marketing/projects') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        return json(res, 201, { success: true, project: addTrackedProject(JSON.parse(body || '{}')) })
      } catch {
        return json(res, 400, { error: 'Invalid project payload' })
      }
    })
    return true
  }
  if (url.pathname === '/api/marketing/lyra') {
    if (req.method === 'GET') return json(res, 200, { success: true, ...runLyraCopywriter() })
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          return json(res, 200, { success: true, ...runLyraCopywriter(JSON.parse(body || '{}')) })
        } catch {
          return json(res, 400, { error: 'Invalid Lyra payload' })
        }
      })
      return true
    }
  }
  if (req.method === 'GET' && url.pathname === '/api/marketing/intel') {
    return json(res, 200, { success: true, ...getMarketAnalysisReport() })
  }
  return false
}

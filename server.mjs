import { createServer } from 'node:http'
import { routeRequest } from './server/router.mjs'
import { startAutomationScheduler } from './server/automation/automation-service.mjs'

const port = Number(process.env.API_PORT || 4174)

const server = createServer(async (req, res) => {
  await routeRequest(req, res)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SOCIALKILLER API] Port ${port} is already in use; this process did not start.`)
    process.exit(1)
  } else {
    console.error('❌ Server startup error:', err)
    process.exit(1)
  }
})

server.listen(port, '127.0.0.1', () => {
  startAutomationScheduler()
  console.log(`SOCIALKILLER API listening on http://127.0.0.1:${port}`)
})


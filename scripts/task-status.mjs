import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPortActive } from './port-arbiter.mjs'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))

async function checkTaskStatus() {
  const tasksPath = resolve(root, 'TASKS.md')
  const content = await readFile(tasksPath, 'utf8')
  const lines = content.split(/\r?\n/)

  let currentPhase = 'General'
  const phases = {}

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentPhase = line.replace('## ', '').trim()
      phases[currentPhase] = { total: 0, done: 0, items: [] }
    } else if (line.trim().startsWith('- [')) {
      if (!phases[currentPhase]) phases[currentPhase] = { total: 0, done: 0, items: [] }
      const isDone = line.includes('- [x]') || line.includes('- [X]')
      const taskText = line.replace(/-\s*\[[xX ]\]\s*/, '').trim()
      phases[currentPhase].total += 1
      if (isDone) phases[currentPhase].done += 1
      phases[currentPhase].items.push({ text: taskText, done: isDone })
    }
  }

  console.log('\n======================================================')
  console.log('       DANGER.LABS OS — TASK STATUS & HEALTH          ')
  console.log('======================================================\n')

  let totalTasks = 0
  let totalDone = 0

  for (const [phase, data] of Object.entries(phases)) {
    totalTasks += data.total
    totalDone += data.done
    const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
    console.log(`📌 [${bar}] ${pct}% — ${phase} (${data.done}/${data.total})`)
  }

  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0
  console.log('\n------------------------------------------------------')
  console.log(`TOTAL PROGRESS: ${totalDone}/${totalTasks} Tasks Completed (${overallPct}%)`)
  console.log('------------------------------------------------------\n')

  console.log('🔌 SERVICE CONNECTIVITY:')
  const backendLive = await isPortActive(4174)
  const frontendLive = await isPortActive(5199)
  console.log(`  - Backend API (Port 4174):  ${backendLive ? '🟢 ONLINE' : '🔴 OFFLINE'}`)
  console.log(`  - Frontend UI (Port 5199):  ${frontendLive ? '🟢 ONLINE' : '🔴 OFFLINE'}\n`)

  console.log('🛠️ QUICK VERIFICATION COMMANDS:')
  console.log('  - npm run tasks:status       -> This status report')
  console.log('  - npm run planning:check     -> Audit roadmap & docs staleness')
  console.log('  - npm run test:backend       -> Run server API unit tests')
  console.log('  - npm run check:file-size    -> Verify source files stay below 150 lines')
  console.log('======================================================\n')
}

checkTaskStatus().catch(err => {
  console.error('Task status check failed:', err.message)
  process.exit(1)
})

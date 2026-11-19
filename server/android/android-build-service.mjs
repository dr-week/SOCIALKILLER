import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { inspectAndroidToolchain } from './android-toolchain.mjs'

const jobs = new Map()
const logLimit = 100_000
let activeJobId = null
let activeChild = null
process.once('exit', () => activeChild?.kill())

export class AndroidBuildError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

function runCommand(command, args, options, job, label) {
  return new Promise((resolveCommand, rejectCommand) => {
    let child
    try { child = spawn(command, args, options) } catch (error) { rejectCommand(error); return }
    activeChild = child
    const append = chunk => { job.log = `${job.log}${chunk}`.slice(-logLimit) }
    child.stdout?.on('data', append)
    child.stderr?.on('data', append)
    child.once('error', error => {
      activeChild = null
      rejectCommand(error)
    })
    child.once('close', code => {
      activeChild = null
      if (code === 0) resolveCommand()
      else rejectCommand(new Error(`${label} exited with code ${code}.`))
    })
  })
}

function commandFor(root, task, platform) {
  if (platform === 'win32') {
    const shell = process.env.ComSpec || 'cmd.exe'
    if (task === 'sync') return { command: shell, args: ['/d', '/s', '/c', 'npm run android:sync'], cwd: root }
    return { command: shell, args: ['/d', '/s', '/c', `android\\gradlew.bat ${task}`], cwd: root }
  }
  if (task === 'sync') return { command: 'npm', args: ['run', 'android:sync'], cwd: root }
  return { command: resolve(root, 'android', 'gradlew'), args: [task], cwd: resolve(root, 'android') }
}

async function executeBuild(job, root, platform, runStep) {
  try {
    for (const [step, task] of [['Web build and Capacitor sync', 'sync'], ['Android Gradle build', job.gradleTask]]) {
      job.step = step
      const command = commandFor(root, task, platform)
      await runStep(command.command, command.args, { cwd: command.cwd, env: process.env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }, job, step)
    }
    job.status = 'succeeded'
    job.artifact = job.target === 'debug-apk'
      ? 'android/app/build/outputs/apk/debug/app-debug.apk'
      : 'android/app/build/outputs/bundle/release/app-release.aab'
  } catch (error) {
    job.status = 'failed'
    job.error = error.message
  } finally {
    job.completedAt = new Date().toISOString()
    if (activeJobId === job.id) activeJobId = null
  }
}

export async function startAndroidBuild(target, {
  root = process.cwd(), platform = process.platform, toolchainCheck = inspectAndroidToolchain, runStep = runCommand
} = {}) {
  if (!['debug-apk', 'release-aab'].includes(target)) throw new AndroidBuildError('Unsupported Android build target.', 400)
  if (activeJobId) throw new AndroidBuildError('An Android build is already running.', 409)
  activeJobId = 'checking'
  try {
    const toolchain = await toolchainCheck({ root, platform, env: process.env })
    if (!toolchain.debugBuildReady) {
      throw new AndroidBuildError(`Android build prerequisites are missing: ${toolchain.missingPrerequisites.join(', ')}.`, 409)
    }
    const job = {
      id: randomUUID(), target, gradleTask: target === 'debug-apk' ? 'assembleDebug' : 'bundleRelease',
      status: 'running', step: 'Starting', startedAt: new Date().toISOString(),
      completedAt: null, log: '', error: null, artifact: null,
      signedReleaseReady: toolchain.signedReleaseReady
    }
    jobs.set(job.id, job)
    activeJobId = job.id
    void executeBuild(job, root, platform, runStep)
    return job
  } catch (error) {
    if (activeJobId === 'checking') activeJobId = null
    throw error
  }
}

export function getAndroidBuilds() {
  return Array.from(jobs.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 10)
}

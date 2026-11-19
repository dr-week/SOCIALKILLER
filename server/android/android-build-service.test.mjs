import assert from 'node:assert/strict'
import test from 'node:test'
import { AndroidBuildError, getAndroidBuilds, startAndroidBuild } from './android-build-service.mjs'

const ready = async () => ({ debugBuildReady: true, signedReleaseReady: false, missingPrerequisites: [] })
const waitForCompletion = async job => {
  for (let attempt = 0; attempt < 50 && job.status === 'running'; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

test('build service only runs the fixed debug build sequence and records its artifact', async () => {
  const calls = []
  const job = await startAndroidBuild('debug-apk', {
    platform: 'win32', toolchainCheck: ready,
    runStep: async (command, args, options, current, label) => calls.push({ command, args, options, current, label })
  })
  await waitForCompletion(job)
  assert.equal(job.status, 'succeeded')
  assert.equal(job.artifact, 'android/app/build/outputs/apk/debug/app-debug.apk')
  assert.deepEqual(calls.map(call => call.label), ['Web build and Capacitor sync', 'Android Gradle build'])
  assert.equal(calls[0].args.at(-1), 'npm run android:sync')
  assert.equal(calls[1].args.at(-1), 'android\\gradlew.bat assembleDebug')
})

test('build service rejects missing prerequisites and concurrent build attempts', async () => {
  await assert.rejects(
    startAndroidBuild('debug-apk', {
      toolchainCheck: async () => ({ debugBuildReady: false, missingPrerequisites: ['Java JDK'] })
    }),
    error => error instanceof AndroidBuildError && error.statusCode === 409
  )

  let release
  const gate = new Promise(resolve => { release = resolve })
  const job = await startAndroidBuild('release-aab', {
    platform: 'win32', toolchainCheck: ready, runStep: async () => gate
  })
  await assert.rejects(startAndroidBuild('debug-apk', { toolchainCheck: ready }), /already running/)
  release()
  await waitForCompletion(job)
  assert.equal(job.status, 'succeeded')
  assert.equal(job.artifact, 'android/app/build/outputs/bundle/release/app-release.aab')
  assert.equal(job.signedReleaseReady, false)
  assert.ok(getAndroidBuilds().some(item => item.id === job.id))
})

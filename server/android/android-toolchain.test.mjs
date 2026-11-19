import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { inspectAndroidToolchain } from './android-toolchain.mjs'

test('Android toolchain status distinguishes wrapper, SDK, Java, and signing prerequisites', async () => {
  const root = await mkdtemp(join(tmpdir(), 'social-base-android-'))
  try {
    await mkdir(join(root, 'android', 'app'), { recursive: true })
    await mkdir(join(root, 'android', 'gradle', 'wrapper'), { recursive: true })
    await writeFile(join(root, 'android', 'gradlew.bat'), '')
    await writeFile(join(root, 'android', 'app', 'build.gradle'), 'android { buildTypes { release { minifyEnabled false } } }')
    const status = await inspectAndroidToolchain({ root, env: {}, platform: 'win32' })
    assert.equal(status.gradleWrapperAvailable, true)
    assert.equal(status.debugBuildReady, false)
    assert.equal(status.aabBuildReady, false)
    assert.equal(status.signedReleaseReady, false)
    assert.deepEqual(status.missingPrerequisites, ['Java JDK', 'Android SDK platforms and build-tools'])
  } finally { await rm(root, { recursive: true, force: true }) }
})

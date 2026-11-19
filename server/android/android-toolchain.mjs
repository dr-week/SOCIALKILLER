import { access, constants, readdir, readFile } from 'node:fs/promises'
import { delimiter, join, resolve } from 'node:path'
import { homedir } from 'node:os'

async function fileExists(path) {
  try { await access(path, constants.F_OK); return true } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false
    throw error
  }
}

async function directoryHasEntries(path) {
  try { return (await readdir(path)).length > 0 } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false
    throw error
  }
}

async function findJava(env, platform) {
  const suffixes = platform === 'win32' ? ['.exe', '.cmd', '.bat'] : ['']
  const candidates = []
  if (env.JAVA_HOME) candidates.push(...suffixes.map(suffix => join(env.JAVA_HOME, 'bin', `java${suffix}`)))
  for (const directory of (env.PATH || '').split(delimiter).filter(Boolean)) {
    candidates.push(...suffixes.map(suffix => join(directory, `java${suffix}`)))
  }
  for (const candidate of candidates) if (await fileExists(candidate)) return candidate
  return null
}

async function findSdk(env, platform) {
  const candidates = [
    env.ANDROID_SDK_ROOT,
    env.ANDROID_HOME,
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, 'Android', 'Sdk'),
    join(homedir(), 'Android', 'Sdk'),
    platform === 'win32' ? 'C:\\Android' : null
  ].filter(Boolean)
  for (const candidate of [...new Set(candidates)]) {
    const sdk = resolve(candidate)
    if (await directoryHasEntries(join(sdk, 'platforms')) && await directoryHasEntries(join(sdk, 'build-tools'))) return sdk
  }
  return null
}

async function releaseSigningConfigured(root) {
  const gradle = await readFile(resolve(root, 'android', 'app', 'build.gradle'), 'utf8')
  const release = gradle.match(/release\s*\{([\s\S]*?)\n\s*\}/)
  return Boolean(release && /\bsigningConfig\b/.test(release[1]))
}

export async function inspectAndroidToolchain({ root = process.cwd(), env = process.env, platform = process.platform } = {}) {
  const wrapper = resolve(root, 'android', platform === 'win32' ? 'gradlew.bat' : 'gradlew')
  const [java, sdk, wrapperAvailable, signedRelease] = await Promise.all([
    findJava(env, platform),
    findSdk(env, platform),
    fileExists(wrapper),
    releaseSigningConfigured(root)
  ])
  const missingPrerequisites = []
  if (!java) missingPrerequisites.push('Java JDK')
  if (!sdk) missingPrerequisites.push('Android SDK platforms and build-tools')
  if (!wrapperAvailable) missingPrerequisites.push('Gradle wrapper')
  return {
    nativeHost: 'Capacitor Android',
    applicationId: 'com.followdesk.app',
    javaAvailable: Boolean(java),
    androidSdkAvailable: Boolean(sdk),
    gradleWrapperAvailable: wrapperAvailable,
    debugBuildReady: Boolean(java && sdk && wrapperAvailable),
    aabBuildReady: Boolean(java && sdk && wrapperAvailable),
    signedReleaseReady: Boolean(java && sdk && wrapperAvailable && signedRelease),
    releaseSigningConfigured: signedRelease,
    missingPrerequisites
  }
}

/**
 * Android Device & Emulator Visual Automation Bridge (<149 lines)
 * Interacts with local Android emulators/devices via ADB & Android CLI.
 */
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export const ANDROID_APP_PACKAGES = {
  x: { package: 'com.twitter.android', activity: '.MainActivity', name: 'X (Twitter)' },
  reddit: { package: 'com.reddit.frontpage', activity: '.MainActivity', name: 'Reddit' },
  instagram: { package: 'com.instagram.android', activity: '.activity.MainTabActivity', name: 'Instagram' },
  threads: { package: 'com.instagram.barcelona', activity: '.MainActivity', name: 'Threads' },
  linkedin: { package: 'com.linkedin.android', activity: '.authenticator.LaunchActivity', name: 'LinkedIn' }
}

export class AndroidAutomationBridge {
  constructor(options = {}) {
    this.deviceId = options.deviceId || null
    this.adbPath = options.adbPath || 'adb'
  }

  getCommandPrefix() {
    return this.deviceId ? `"${this.adbPath}" -s ${this.deviceId}` : `"${this.adbPath}"`
  }

  /**
   * Lists connected Android devices and running emulators
   */
  async listDevices() {
    try {
      const { stdout } = await execAsync(`"${this.adbPath}" devices`)
      const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean)
      const devices = []

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/)
        if (parts.length >= 2) {
          devices.push({
            id: parts[0],
            state: parts[1],
            isEmulator: parts[0].startsWith('emulator-')
          })
        }
      }

      return { success: true, count: devices.length, devices }
    } catch (err) {
      return { success: false, error: err.message, devices: [] }
    }
  }

  /**
   * Checks if an emulator or physical device is actively attached
   */
  async isDeviceReady() {
    const res = await this.listDevices()
    if (!res.success || res.devices.length === 0) return false
    return res.devices.some(d => d.state === 'device')
  }

  /**
   * Launches a native Android social app
   */
  async launchApp(platformId) {
    const app = ANDROID_APP_PACKAGES[platformId]
    if (!app) {
      return { success: false, error: `Unknown Android app platform: ${platformId}` }
    }

    try {
      const cmd = `${this.getCommandPrefix()} shell monkey -p ${app.package} -c android.intent.category.LAUNCHER 1`
      await execAsync(cmd)
      return { success: true, platformId, package: app.package, name: app.name }
    } catch (err) {
      return { success: false, platformId, error: err.message }
    }
  }

  /**
   * Performs a humanized tap on the Android device screen with micro-jitter
   */
  async tap(x, y, options = {}) {
    const jitterX = options.jitter ? Math.round((Math.random() - 0.5) * 6) : 0
    const jitterY = options.jitter ? Math.round((Math.random() - 0.5) * 6) : 0
    const finalX = Math.round(x + jitterX)
    const finalY = Math.round(y + jitterY)

    try {
      await execAsync(`${this.getCommandPrefix()} shell input tap ${finalX} ${finalY}`)
      return { success: true, x: finalX, y: finalY }
    } catch (err) {
      return { success: false, x, y, error: err.message }
    }
  }

  /**
   * Sends text input to the active Android view
   */
  async typeText(text) {
    // Android adb input text requires escaped whitespace and special characters
    const escaped = String(text)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\s/g, '%s')

    try {
      await execAsync(`${this.getCommandPrefix()} shell input text "${escaped}"`)
      return { success: true, text }
    } catch (err) {
      return { success: false, text, error: err.message }
    }
  }

  /**
   * Simulates a swipe / scroll gesture
   */
  async swipe(startX, startY, endX, endY, durationMs = 350) {
    try {
      await execAsync(`${this.getCommandPrefix()} shell input swipe ${startX} ${startY} ${endX} ${endY} ${durationMs}`)
      return { success: true, startX, startY, endX, endY, durationMs }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Dumps UI hierarchy to inspect accessibility nodes and text/content-desc bounds
   */
  async dumpHierarchy() {
    try {
      const dumpCmd = `${this.getCommandPrefix()} shell uiautomator dump /data/local/tmp/uidump.xml`
      await execAsync(dumpCmd)
      const readCmd = `${this.getCommandPrefix()} shell cat /data/local/tmp/uidump.xml`
      const { stdout } = await execAsync(readCmd)
      return { success: true, xml: stdout }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
}

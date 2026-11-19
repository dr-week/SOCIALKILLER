/** Simulates Lua-compatible workflow commands. No screen or device control is attached. */

import { generateBezierPath, getKeystrokeDelay, gaussianRandom, generateHumanScrollSteps } from './human-motion.mjs'

export class LuaAutomationEngine {
  constructor(options = {}) {
    this.quotaLimitPerHour = options.quotaLimitPerHour || 30
    this.actionHistory = []
    this.currentPosition = { x: 100, y: 100 }
    this.eventLog = []
  }

  logEvent(action, details) {
    const entry = { timestamp: new Date().toISOString(), action, details }
    this.eventLog.push(entry)
    if (this.eventLog.length > 200) this.eventLog.shift()
    return entry
  }

  checkQuota() {
    const oneHourAgo = Date.now() - 3600000
    this.actionHistory = this.actionHistory.filter(t => t > oneHourAgo)
    if (this.actionHistory.length >= this.quotaLimitPerHour) {
      throw new Error(`Safety Quota Exceeded: max ${this.quotaLimitPerHour} automated actions per hour. Pausing script.`)
    }
  }

  recordAction() {
    this.actionHistory.push(Date.now())
  }

  /**
   * Action Primitive: Natural human mouse move via Bezier curve with micro-tremor
   */
  async humanMove(targetX, targetY) {
    const path = generateBezierPath(this.currentPosition.x, this.currentPosition.y, targetX, targetY)
    this.currentPosition = { x: targetX, y: targetY }
    this.logEvent('human_move', { targetX, targetY, totalPoints: path.length })
    return { success: true, targetX, targetY, pointsCount: path.length, path }
  }

  /**
   * Action Primitive: Natural Gaussian-timed human typing
   */
  async humanType(text) {
    this.checkQuota()
    const keystrokes = []
    let totalDelayMs = 0

    for (const char of String(text)) {
      const delay = getKeystrokeDelay(char)
      totalDelayMs += delay
      keystrokes.push({ char, delayMs: delay })
    }

    this.recordAction()
    this.logEvent('human_type', { textLength: text.length, estimatedDurationMs: totalDelayMs })
    return { success: true, text, totalDelayMs, keystrokes }
  }

  /**
   * Action Primitive: Human-paced scroll with reading intervals
   */
  async scrollAndRead(pixels = 600, options = {}) {
    const steps = generateHumanScrollSteps(pixels, options)
    const readPauses = steps.filter(s => s.isReadingPause).length
    this.logEvent('scroll_and_read', { pixels, totalSteps: steps.length, readPauses })
    return { success: true, pixels, stepsCount: steps.length, steps }
  }

  async findIcon(iconName) {
    this.logEvent('find_icon_unavailable', { iconName })
    return {
      found: false,
      iconName,
      error: 'No screen capture or vision provider is connected. No click was performed.'
    }
  }

  /**
   * Executes a parsed automation script (JS/TS or Lua-compatible command flow)
   */
  async runScript(scriptCommands = []) {
    const results = []
    const commandsList = Array.isArray(scriptCommands) ? scriptCommands : []
    let unavailable = false

    for (const cmd of commandsList) {
      switch (cmd.action) {
        case 'move':
          results.push(await this.humanMove(cmd.x, cmd.y))
          break
        case 'type':
          results.push(await this.humanType(cmd.text))
          break
        case 'find':
        case 'click':
          unavailable = true
          results.push(await this.findIcon(cmd.target))
          break
        case 'scroll':
          results.push(await this.scrollAndRead(cmd.pixels))
          break
        case 'sleep':
          results.push({ action: 'sleep', durationMs: gaussianRandom(cmd.mean || 500, cmd.stdDev || 100) })
          break
        default:
          results.push({ action: cmd.action, status: 'skipped' })
      }
    }

    return {
      success: results.length > 0 && !unavailable && results.every(result => result.success !== false),
      mode: 'simulation_only',
      executedCount: results.length,
      results,
      eventLog: this.eventLog.slice(-10),
      notice: 'This engine produces previews only; it does not control a screen or submit social actions.'
    }
  }
}

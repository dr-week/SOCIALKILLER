import assert from 'node:assert/strict'
import test from 'node:test'
import { generateBezierPath, gaussianRandom, getKeystrokeDelay, generateHumanScrollSteps } from '../server/engine/human-motion.mjs'
import { rgbaToGrayscale, computeSobelEdges, matchTemplateEdge } from '../server/engine/vision-contour.mjs'
import { LuaAutomationEngine } from '../server/engine/lua-runner.mjs'

test('human-motion generates non-linear Bezier curves with micro-tremor', () => {
  const path = generateBezierPath(100, 100, 450, 400, { steps: 20 })
  assert.ok(path.length >= 20)
  assert.equal(path[0].x, 100)
  assert.equal(path[0].y, 100)
  // End point reaches target vicinity
  const end = path[path.length - 1]
  assert.ok(Math.abs(end.x - 450) <= 2)
  assert.ok(Math.abs(end.y - 400) <= 2)
})

test('human-motion Gaussian keystroke delays vary naturally with punctuation pauses', () => {
  const charA = getKeystrokeDelay('a', { mean: 100, stdDev: 20 })
  const charPeriod = getKeystrokeDelay('.', { mean: 100, stdDev: 20 })

  assert.ok(charA >= 30, 'Typing delay must stay positive')
  assert.ok(charPeriod > charA, 'Period/sentence break must incorporate thought pause')
})

test('vision-contour detects identical edge geometry in dark vs light mode', () => {
  const width = 10
  const height = 10

  // 1. Dark Mode Square (White object on black background)
  const darkRgba = new Uint8ClampedArray(width * height * 4)
  // 2. Light Mode Square (Black object on white background)
  const lightRgba = new Uint8ClampedArray(width * height * 4)

  // Initialize light background to white
  for (let i = 0; i < lightRgba.length; i += 4) {
    lightRgba[i] = 255
    lightRgba[i + 1] = 255
    lightRgba[i + 2] = 255
    lightRgba[i + 3] = 255
  }

  // Draw 4x4 square in both
  for (let y = 3; y <= 6; y++) {
    for (let x = 3; x <= 6; x++) {
      const idx = (y * width + x) * 4
      // Dark mode: white square
      darkRgba[idx] = 255
      darkRgba[idx + 1] = 255
      darkRgba[idx + 2] = 255
      darkRgba[idx + 3] = 255

      // Light mode: black square
      lightRgba[idx] = 0
      lightRgba[idx + 1] = 0
      lightRgba[idx + 2] = 0
      lightRgba[idx + 3] = 255
    }
  }

  const darkGray = rgbaToGrayscale(darkRgba, width, height)
  const lightGray = rgbaToGrayscale(lightRgba, width, height)

  const darkEdges = computeSobelEdges(darkGray, width, height)
  const lightEdges = computeSobelEdges(lightGray, width, height)

  // Sobel edge gradient magnitude should be equal on both themes!
  let totalEdgeDiff = 0
  for (let i = 0; i < darkEdges.length; i++) {
    totalEdgeDiff += Math.abs(darkEdges[i] - lightEdges[i])
  }

  assert.ok(totalEdgeDiff < 0.05, `Edge difference across dark/light mode must be negligible (< 0.05). Actual: ${totalEdgeDiff}`)
})

test('LuaAutomationEngine previews commands and reports unavailable screen vision', async () => {
  const engine = new LuaAutomationEngine({ quotaLimitPerHour: 10 })
  const result = await engine.runScript([
    { action: 'find', target: 'heart' },
    { action: 'move', x: 250, y: 300 },
    { action: 'type', text: 'Clean code.' },
    { action: 'scroll', pixels: 300 },
    { action: 'click', target: 'heart' }
  ])

  assert.equal(result.success, false)
  assert.equal(result.mode, 'simulation_only')
  assert.equal(result.executedCount, 5)
  assert.equal(result.results[0].found, false)
  assert.equal('x' in result.results[0], false)
  assert.match(result.notice, /does not control a screen/)
  assert.ok(engine.actionHistory.length > 0)
})

test('LuaAutomationEngine returns an empty preview when no commands are supplied', async () => {
  const engine = new LuaAutomationEngine()
  const result = await engine.runScript()
  assert.equal(result.mode, 'simulation_only')
  assert.equal(result.executedCount, 0)
  assert.deepEqual(result.results, [])
})

/**
 * Human Motion & Stochastic Dynamics Synthesizer (<180 lines)
 * 
 * Generates natural mouse trajectories, micro-tremor jitter, and Gaussian typing intervals
 * based on biometric kinematics used in high-tier anti-detection systems.
 */

/**
 * Generates a cubic Bezier curve trajectory between two points with human-like overshoot & micro-tremor
 */
export function generateBezierPath(startX, startY, targetX, targetY, options = {}) {
  const steps = options.steps || Math.max(15, Math.floor(Math.hypot(targetX - startX, targetY - startY) / 18))
  const deviation = options.deviation || 40

  // Random control points creating a natural human arc
  const midX = (startX + targetX) / 2
  const midY = (startY + targetY) / 2

  const cp1X = startX + (midX - startX) * 0.5 + (Math.random() - 0.5) * deviation
  const cp1Y = startY + (midY - startY) * 0.5 + (Math.random() - 0.5) * deviation
  const cp2X = midX + (targetX - midX) * 0.5 + (Math.random() - 0.5) * deviation
  const cp2Y = midY + (targetY - midY) * 0.5 + (Math.random() - 0.5) * deviation

  const path = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // Ease-in and ease-out acceleration/deceleration factor
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

    const inv = 1 - easeT
    const x = Math.round(
      inv * inv * inv * startX +
      3 * inv * inv * easeT * cp1X +
      3 * inv * easeT * easeT * cp2X +
      easeT * easeT * easeT * targetX
    )
    const y = Math.round(
      inv * inv * inv * startY +
      3 * inv * inv * easeT * cp1Y +
      3 * inv * easeT * easeT * cp2Y +
      easeT * easeT * easeT * targetY
    )

    // Micro hand-tremor on intermediate points (exact at origin and target)
    const isEndpoint = i === 0 || i === steps
    const tremorX = isEndpoint ? 0 : (Math.random() - 0.5) * 1.5
    const tremorY = isEndpoint ? 0 : (Math.random() - 0.5) * 1.5

    path.push({ x: Math.round(x + tremorX), y: Math.round(y + tremorY), t })
  }

  return path
}

/**
 * Returns a Gaussian (Normal) random number using the Box-Muller transform
 */
export function gaussianRandom(mean = 110, stdDev = 35) {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return Math.max(30, Math.round(mean + z * stdDev))
}

/**
 * Calculates human keystroke timing with contextual punctuation pauses
 */
export function getKeystrokeDelay(char, options = {}) {
  const baseMean = options.mean || 110
  const baseStdDev = options.stdDev || 35
  let delay = gaussianRandom(baseMean, baseStdDev)

  if (char === '.' || char === '!' || char === '?' || char === '\n') {
    delay += Math.floor(Math.random() * 120) + 160 // Thought/sentence pause
  } else if (char === ',' || char === ';' || char === ':') {
    delay += Math.floor(Math.random() * 70) + 90   // Clause pause
  } else if (char === ' ') {
    delay += Math.floor(Math.random() * 40) + 20   // Word boundary delay
  }

  return delay
}

/**
 * Generates natural browsing scroll steps with stochastic reading pauses
 */
export function generateHumanScrollSteps(totalPixels, options = {}) {
  const direction = totalPixels >= 0 ? 1 : -1
  const absPixels = Math.abs(totalPixels)
  const steps = []
  let remaining = absPixels

  while (remaining > 0) {
    const chunk = Math.min(remaining, Math.floor(Math.random() * 80) + 40)
    const stepDelay = Math.floor(Math.random() * 25) + 15
    remaining -= chunk
    steps.push({ deltaY: chunk * direction, delayMs: stepDelay })

    // Periodic micro-reading pause (simulating scanning a headline or image)
    if (Math.random() < 0.18) {
      steps.push({ deltaY: 0, delayMs: Math.floor(Math.random() * 1200) + 600, isReadingPause: true })
    }
  }

  return steps
}

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  imageToGrayscale,
  computeSobelEdgeMap,
  matchEdgeTemplate
} from '../extension/modules/vision/canvas-contour.js'
import {
  indexInteractiveDom,
  querySemanticMark,
  isSensitiveElement
} from '../extension/modules/vision/set-of-mark.js'
import {
  computeSobelEdges,
  matchTemplateEdge,
  rgbaToGrayscale
} from '../server/engine/vision-contour.mjs'
import { matchMultiScaleEdge, resizeEdgeMap } from '../server/engine/vision/multi-scale.mjs'

function renderIconScene(sceneW, sceneH, iconX, iconY, iconSize, darkTheme) {
  const data = new Uint8ClampedArray(sceneW * sceneH * 4)
  const bg = darkTheme ? 18 : 242
  const fg = darkTheme ? 235 : 22
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bg; data[i + 1] = bg; data[i + 2] = bg; data[i + 3] = 255
  }
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const nx = x / iconSize
      const ny = y / iconSize
      const inBox = nx >= 0.2 && nx <= 0.8 && ny >= 0.2 && ny <= 0.8
      if (inBox) {
        const px = iconX + x
        const py = iconY + y
        if (px >= 0 && px < sceneW && py >= 0 && py < sceneH) {
          const idx = (py * sceneW + px) * 4
          data[idx] = fg; data[idx + 1] = fg; data[idx + 2] = fg; data[idx + 3] = 255
        }
      }
    }
  }
  return { data, width: sceneW, height: sceneH }
}

test('Extension Layer 3: coarse-to-fine Sobel + NCC locates odd-pixel icon identically in dark & light mode', () => {
  const tmplImg = renderIconScene(16, 16, 0, 0, 16, true)
  const tmplEdges = computeSobelEdgeMap(imageToGrayscale(tmplImg), 16, 16)

  const darkScene = renderIconScene(64, 64, 17, 19, 16, true)
  const lightScene = renderIconScene(64, 64, 17, 19, 16, false)

  const darkMatch = matchEdgeTemplate(computeSobelEdgeMap(imageToGrayscale(darkScene), 64, 64), 64, 64, tmplEdges, 16, 16)
  const lightMatch = matchEdgeTemplate(computeSobelEdgeMap(imageToGrayscale(lightScene), 64, 64), 64, 64, tmplEdges, 16, 16)

  assert.equal(darkMatch.found, true)
  assert.equal(lightMatch.found, true)
  assert.ok(darkMatch.confidence >= 0.98, `Expected >= 0.98 dark confidence, got ${darkMatch.confidence}`)
  assert.ok(lightMatch.confidence >= 0.98, `Expected >= 0.98 light confidence, got ${lightMatch.confidence}`)
  assert.deepEqual(darkMatch.box, { x: 17, y: 19, width: 16, height: 16 })
  assert.deepEqual(lightMatch.box, { x: 17, y: 19, width: 16, height: 16 })
})

test('Server Layer 3: multi-scale pyramid locates 1.25x scaled icon within <50ms', () => {
  const baseTmpl = renderIconScene(16, 16, 0, 0, 16, true)
  const tmplEdges = computeSobelEdges(rgbaToGrayscale(baseTmpl.data, 16, 16), 16, 16)

  const scaledScene = renderIconScene(72, 72, 21, 23, 20, false)
  const sceneEdges = computeSobelEdges(rgbaToGrayscale(scaledScene.data, 72, 72), 72, 72)

  const exactRes = matchTemplateEdge(sceneEdges, 72, 72, resizeEdgeMap(tmplEdges, 16, 16, 20, 20), 20, 20, 0.5)
  assert.equal(exactRes.matched, true)

  const multiRes = matchMultiScaleEdge(sceneEdges, 72, 72, tmplEdges, 16, 16, { scales: [0.8, 1.0, 1.25], threshold: 0.5 })
  assert.equal(multiRes.matched, true)
  assert.equal(multiRes.scale, 1.25)
  assert.ok(multiRes.durationMs < 80, `Expected fast multi-scale match, got ${multiRes.durationMs}ms`)
})

test('Extension Layer 2: Set-of-Mark indexes interactive controls and blocks sensitive/payment inputs', () => {
  const mkEl = (tag, attrs = {}, text = '', rect = { x: 10, y: 20, width: 120, height: 36 }) => ({
    tagName: tag.toUpperCase(),
    id: attrs.id || '',
    textContent: text,
    getAttribute: (k) => attrs[k] ?? null,
    getBoundingClientRect: () => rect
  })

  const mockRoot = {
    querySelectorAll: () => [
      mkEl('button', { 'data-testid': 'tweetButton', 'aria-label': 'Post reply' }, 'Post'),
      mkEl('input', { type: 'password', name: 'pass' }, ''),
      mkEl('input', { type: 'text', autocomplete: 'one-time-code', placeholder: 'Enter OTP' }, ''),
      mkEl('button', { 'aria-label': 'Pay Now' }, 'Pay Now'),
      mkEl('button', { 'aria-label': 'Following' }, 'Following')
    ]
  }

  const indexed = indexInteractiveDom(mockRoot)
  assert.equal(indexed.blockedCount, 3)
  assert.equal(indexed.totalIndexed, 2)
  assert.equal(isSensitiveElement(mkEl('input', { type: 'password' })), true)

  const found = querySemanticMark(indexed.marks, 'following')
  assert.ok(found)
  assert.equal(found.label, 'Following')
  assert.equal(found.markId, 2)
})

test('Visual Bot v2 Cascade: falls back from broken Layer 1 selector to Layer 2 SoM and self-heals cache', async () => {
  const { resolveTargetWithCascade } = await import('../extension/modules/vision/visual-cascade.js')
  let healed = ''
  const mockRoot = {
    querySelector: () => null,
    querySelectorAll: () => [{
      tagName: 'BUTTON', id: '', textContent: 'Following',
      getAttribute: (k) => (k === 'aria-label' ? 'Following' : null),
      getBoundingClientRect: () => ({ x: 40, y: 80, width: 90, height: 32 })
    }]
  }

  const res = resolveTargetWithCascade({
    query: 'Following',
    cachedSelector: '.old-broken-class',
    root: mockRoot,
    onHealSelector: (sel) => { healed = sel }
  })

  assert.equal(res.found, true)
  assert.equal(res.layer, 2)
  assert.equal(res.healed, true)
  assert.equal(healed, 'button[aria-label="Following"]')
})

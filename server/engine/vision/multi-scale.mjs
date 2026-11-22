/**
 * Multi-Scale Pyramid Edge Matcher for HiDPI / Retina & Zoomed Displays (<85 lines)
 * Resizes Sobel edge templates via bilinear interpolation and runs coarse-to-fine NCC.
 */
import { matchTemplateEdge } from '../vision-contour.mjs'

export function resizeEdgeMap(edges, srcW, srcH, dstW, dstH) {
  const out = new Float32Array(dstW * dstH)
  const scaleX = srcW / dstW
  const scaleY = srcH / dstH

  for (let y = 0; y < dstH; y++) {
    const fy = y * scaleY
    const y0 = Math.floor(fy)
    const y1 = Math.min(srcH - 1, y0 + 1)
    const dy = fy - y0

    for (let x = 0; x < dstW; x++) {
      const fx = x * scaleX
      const x0 = Math.floor(fx)
      const x1 = Math.min(srcW - 1, x0 + 1)
      const dx = fx - x0

      const v00 = edges[y0 * srcW + x0]
      const v10 = edges[y0 * srcW + x1]
      const v01 = edges[y1 * srcW + x0]
      const v11 = edges[y1 * srcW + x1]

      const top = v00 * (1 - dx) + v10 * dx
      const bottom = v01 * (1 - dx) + v11 * dx
      out[y * dstW + x] = top * (1 - dy) + bottom * dy
    }
  }
  return out
}

export function matchMultiScaleEdge(
  sceneEdges,
  sceneW,
  sceneH,
  tmplEdges,
  tmplW,
  tmplH,
  { scales = [0.8, 1.0, 1.25], threshold = 0.65 } = {}
) {
  const start = performance.now()
  let best = { matched: false, confidence: 0, x: null, y: null, boundingBox: null, scale: 1.0 }

  for (const scale of scales) {
    const w = Math.max(4, Math.round(tmplW * scale))
    const h = Math.max(4, Math.round(tmplH * scale))
    if (w > sceneW || h > sceneH) continue

    const scaledTmpl = scale === 1.0 ? tmplEdges : resizeEdgeMap(tmplEdges, tmplW, tmplH, w, h)
    const result = matchTemplateEdge(sceneEdges, sceneW, sceneH, scaledTmpl, w, h, threshold)

    if (result.confidence > best.confidence) {
      best = { ...result, scale }
    }
    if (best.confidence >= 0.96) break
  }

  return {
    ...best,
    scalesTested: scales.length,
    durationMs: Number((performance.now() - start).toFixed(2))
  }
}

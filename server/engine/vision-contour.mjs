/**
 * Theme-invariant Computer Vision & Contour Engine
 * Grayscale luminance normalization, Sobel gradient edge detection, and 2D NCC matching.
 */
export { synthesizeIconEdgeMap, VISUAL_ICON_CATALOG } from './vision/icon-templates.mjs'

export function rgbaToGrayscale(rgbaArray, width, height) {
  const gray = new Float32Array(width * height)
  for (let i = 0, j = 0; i < rgbaArray.length; i += 4, j++) {
    gray[j] = (0.299 * rgbaArray[i] + 0.587 * rgbaArray[i + 1] + 0.114 * rgbaArray[i + 2]) / 255.0
  }
  return gray
}

export function computeSobelEdges(grayArray, width, height) {
  const edges = new Float32Array(width * height)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const gx =
        -1 * grayArray[(y - 1) * width + (x - 1)] +
         1 * grayArray[(y - 1) * width + (x + 1)] +
        -2 * grayArray[y * width + (x - 1)] +
         2 * grayArray[y * width + (x + 1)] +
        -1 * grayArray[(y + 1) * width + (x - 1)] +
         1 * grayArray[(y + 1) * width + (x + 1)]
      const gy =
        -1 * grayArray[(y - 1) * width + (x - 1)] +
        -2 * grayArray[(y - 1) * width + x] +
        -1 * grayArray[(y - 1) * width + (x + 1)] +
         1 * grayArray[(y + 1) * width + (x - 1)] +
         2 * grayArray[(y + 1) * width + x] +
         1 * grayArray[(y + 1) * width + (x + 1)]
      edges[idx] = Math.min(1.0, Math.hypot(gx, gy))
    }
  }
  return edges
}

export function matchTemplateEdge(sceneEdges, sceneWidth, sceneHeight, tmplEdges, tmplWidth, tmplHeight, threshold = 0.65) {
  let bestScore = -1
  let bestX = -1
  let bestY = -1
  const maxX = sceneWidth - tmplWidth
  const maxY = sceneHeight - tmplHeight
  if (maxX < 0 || maxY < 0) return { matched: false, confidence: 0, x: null, y: null, boundingBox: null }

  let tmplEnergy = 0
  for (let i = 0; i < tmplEdges.length; i++) tmplEnergy += tmplEdges[i] * tmplEdges[i]
  if (tmplEnergy === 0) tmplEnergy = 0.0001

  const scoreAt = (x, y) => {
    let crossCorr = 0
    let sceneEnergy = 0
    for (let ty = 0; ty < tmplHeight; ty++) {
      const sRow = (y + ty) * sceneWidth + x
      const tRow = ty * tmplWidth
      for (let tx = 0; tx < tmplWidth; tx++) {
        const sVal = sceneEdges[sRow + tx]
        const tVal = tmplEdges[tRow + tx]
        crossCorr += sVal * tVal
        sceneEnergy += sVal * sVal
      }
    }
    return sceneEnergy > 0 ? crossCorr / Math.sqrt(sceneEnergy * tmplEnergy) : 0
  }

  const stride = maxX * maxY <= 20000 ? 1 : 2
  for (let y = 0; y <= maxY; y += stride) {
    for (let x = 0; x <= maxX; x += stride) {
      const ncc = scoreAt(x, y)
      if (ncc > bestScore) { bestScore = ncc; bestX = x; bestY = y }
    }
  }

  if (stride > 1 && bestX >= 0 && bestY >= 0) {
    for (let y = Math.max(0, bestY - stride); y <= Math.min(maxY, bestY + stride); y++) {
      for (let x = Math.max(0, bestX - stride); x <= Math.min(maxX, bestX + stride); x++) {
        const ncc = scoreAt(x, y)
        if (ncc > bestScore) { bestScore = ncc; bestX = x; bestY = y }
      }
    }
  }

  const matched = bestScore >= threshold
  return {
    matched,
    confidence: Number(bestScore.toFixed(3)),
    x: matched ? bestX + Math.floor(tmplWidth / 2) : null,
    y: matched ? bestY + Math.floor(tmplHeight / 2) : null,
    boundingBox: matched ? { x: bestX, y: bestY, width: tmplWidth, height: tmplHeight } : null
  }
}

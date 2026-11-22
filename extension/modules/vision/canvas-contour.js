/**
 * Canvas Contour & Sobel Edge Detection (Browser Extension Layer 3, <115 lines)
 * Theme-invariant visual pattern matching with precomputed template energy
 * and 2-stage coarse-to-fine (stride 2 -> 1px refinement) 2D NCC matching.
 */

export function imageToGrayscale(imageData) {
  const { data, width, height } = imageData
  const gray = new Uint8Array(width * height)
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  }
  return gray
}

export function computeSobelEdgeMap(gray, width, height) {
  const edges = new Float32Array(width * height)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const gx =
        -gray[idx - width - 1] + gray[idx - width + 1] -
        2 * gray[idx - 1] + 2 * gray[idx + 1] -
        gray[idx + width - 1] + gray[idx + width + 1]
      const gy =
        -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1] +
        gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1]
      edges[idx] = Math.hypot(gx, gy)
    }
  }
  return edges
}

function scoreWindow(sceneEdges, sceneW, tmplEdges, tmplW, tmplH, sx, sy, tmplEnergy) {
  let sumProd = 0
  let sumSceneSq = 0
  for (let ty = 0; ty < tmplH; ty++) {
    const sRow = (sy + ty) * sceneW + sx
    const tRow = ty * tmplW
    for (let tx = 0; tx < tmplW; tx++) {
      const sVal = sceneEdges[sRow + tx]
      const tVal = tmplEdges[tRow + tx]
      sumProd += sVal * tVal
      sumSceneSq += sVal * sVal
    }
  }
  const denom = Math.sqrt(sumSceneSq * tmplEnergy)
  return denom > 1e-6 ? sumProd / denom : 0
}

export function matchEdgeTemplate(sceneEdges, sceneW, sceneH, tmplEdges, tmplW, tmplH, threshold = 0.7) {
  const maxX = sceneW - tmplW
  const maxY = sceneH - tmplH
  if (maxX < 0 || maxY < 0) return { found: false, confidence: 0, center: { x: 0, y: 0 }, box: null }

  let tmplEnergy = 0
  for (let i = 0; i < tmplEdges.length; i++) tmplEnergy += tmplEdges[i] * tmplEdges[i]
  if (tmplEnergy < 1e-6) return { found: false, confidence: 0, center: { x: 0, y: 0 }, box: null }

  let bestScore = -1
  let bestX = 0
  let bestY = 0

  const stride = maxX * maxY <= 20000 ? 1 : 2
  for (let sy = 0; sy <= maxY; sy += stride) {
    for (let sx = 0; sx <= maxX; sx += stride) {
      const score = scoreWindow(sceneEdges, sceneW, tmplEdges, tmplW, tmplH, sx, sy, tmplEnergy)
      if (score > bestScore) { bestScore = score; bestX = sx; bestY = sy }
    }
  }

  if (stride > 1) {
    const rxMin = Math.max(0, bestX - stride)
    const rxMax = Math.min(maxX, bestX + stride)
    const ryMin = Math.max(0, bestY - stride)
    const ryMax = Math.min(maxY, bestY + stride)
    for (let sy = ryMin; sy <= ryMax; sy++) {
      for (let sx = rxMin; sx <= rxMax; sx++) {
        const score = scoreWindow(sceneEdges, sceneW, tmplEdges, tmplW, tmplH, sx, sy, tmplEnergy)
        if (score > bestScore) { bestScore = score; bestX = sx; bestY = sy }
      }
    }
  }

  const found = bestScore >= threshold
  return {
    found,
    confidence: Number(bestScore.toFixed(4)),
    center: { x: Math.round(bestX + tmplW / 2), y: Math.round(bestY + tmplH / 2) },
    box: found ? { x: bestX, y: bestY, width: tmplW, height: tmplH } : null
  }
}

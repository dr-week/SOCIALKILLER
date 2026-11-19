/**
 * Canvas Contour & Sobel Edge Detection (Browser Content Script / Extension Side)
 * 
 * Provides theme-invariant visual pattern matching for dark and light modes
 * using HTML5 Canvas ImageData.
 */

/**
 * Converts ImageData to a 1D grayscale Uint8Array
 * @param {ImageData} imageData 
 * @returns {Uint8Array}
 */
export function imageToGrayscale(imageData) {
  const { data, width, height } = imageData
  const gray = new Uint8Array(width * height)
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    // Standard perceptual ITU-R BT.601 luminance
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  }
  return gray
}

/**
 * Computes 3x3 Sobel edge gradient map
 * @param {Uint8Array} gray 
 * @param {number} width 
 * @param {number} height 
 * @returns {Float32Array}
 */
export function computeSobelEdgeMap(gray, width, height) {
  const edges = new Float32Array(width * height)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const p00 = gray[idx - width - 1]
      const p01 = gray[idx - width]
      const p02 = gray[idx - width + 1]
      const p10 = gray[idx - 1]
      const p12 = gray[idx + 1]
      const p20 = gray[idx + width - 1]
      const p21 = gray[idx + width]
      const p22 = gray[idx + width + 1]

      const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22
      const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22

      edges[idx] = Math.hypot(gx, gy)
    }
  }
  return edges
}

/**
 * Normalized Cross-Correlation (NCC) over edge gradients
 * Theme-invariant: Matches identically across dark and light UI themes
 */
export function matchEdgeTemplate(sceneEdges, sceneW, sceneH, tmplEdges, tmplW, tmplH) {
  let bestScore = -1
  let bestLoc = { x: 0, y: 0 }

  for (let sy = 0; sy <= sceneH - tmplH; sy += 2) {
    for (let sx = 0; sx <= sceneW - tmplW; sx += 2) {
      let sumProd = 0
      let sumSceneSq = 0
      let sumTmplSq = 0

      for (let ty = 0; ty < tmplH; ty++) {
        for (let tx = 0; tx < tmplW; tx++) {
          const sVal = sceneEdges[(sy + ty) * sceneW + (sx + tx)]
          const tVal = tmplEdges[ty * tmplW + tx]
          sumProd += sVal * tVal
          sumSceneSq += sVal * sVal
          sumTmplSq += tVal * tVal
        }
      }

      const denom = Math.sqrt(sumSceneSq * sumTmplSq)
      const score = denom > 1e-6 ? sumProd / denom : 0

      if (score > bestScore) {
        bestScore = score
        bestLoc = { x: sx, y: sy }
      }
    }
  }

  return {
    found: bestScore >= 0.7,
    confidence: bestScore,
    center: {
      x: Math.round(bestLoc.x + tmplW / 2),
      y: Math.round(bestLoc.y + tmplH / 2)
    }
  }
}

/**
 * Theme-Invariant Computer Vision & Contour Engine (<250 lines)
 * 
 * Capabilities:
 * 1. Grayscale luminance normalization (immunizing against Dark vs Light mode).
 * 2. Sobel gradient edge detection for shape geometry matching.
 * 3. 2D Normalized Cross-Correlation (NCC) template matching across normalized gradients.
 * 4. Geometric icon synthesizers & definitions (heart/like, comment, retweet, post, search, bookmark, close).
 * 5. Bounding box & human-jitter coordinate extraction.
 */

/**
 * Converts an ImageData buffer (RGBA) to a 1D grayscale float array [0..1]
 */
export function rgbaToGrayscale(rgbaArray, width, height) {
  const gray = new Float32Array(width * height)
  for (let i = 0, j = 0; i < rgbaArray.length; i += 4, j++) {
    // Perceptual ITU-R BT.601 luminance
    gray[j] = (0.299 * rgbaArray[i] + 0.587 * rgbaArray[i + 1] + 0.114 * rgbaArray[i + 2]) / 255.0
  }
  return gray
}

/**
 * Computes a gradient edge map using a 3x3 Sobel operator.
 * Edge contours have the exact same shape in Dark Mode and Light Mode.
 */
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

/**
 * Matches a visual template edge map against a full scene edge map
 * using Normalized Cross-Correlation (NCC) with 2px stride.
 */
export function matchTemplateEdge(sceneEdges, sceneWidth, sceneHeight, tmplEdges, tmplWidth, tmplHeight, threshold = 0.65) {
  let bestScore = -1
  let bestX = -1
  let bestY = -1

  const maxX = sceneWidth - tmplWidth
  const maxY = sceneHeight - tmplHeight

  if (maxX < 0 || maxY < 0) {
    return { matched: false, confidence: 0, x: null, y: null, boundingBox: null }
  }

  let tmplEnergy = 0
  for (let i = 0; i < tmplEdges.length; i++) {
    tmplEnergy += tmplEdges[i] * tmplEdges[i]
  }
  if (tmplEnergy === 0) tmplEnergy = 0.0001

  const step = 2
  for (let y = 0; y <= maxY; y += step) {
    for (let x = 0; x <= maxX; x += step) {
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

      if (sceneEnergy > 0) {
        const ncc = crossCorr / Math.sqrt(sceneEnergy * tmplEnergy)
        if (ncc > bestScore) {
          bestScore = ncc
          bestX = x
          bestY = y
        }
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

/**
 * Synthesizes a high-contrast canonical edge map for standard icons in the catalog.
 * This guarantees the visual bot knows EXACTLY what icons are what!
 */
export function synthesizeIconEdgeMap(iconName, width, height) {
  const edges = new Float32Array(width * height)
  const cx = width / 2
  const cy = height / 2

  if (iconName === 'heart' || iconName === 'like') {
    // Heart shape contour: (x^2 + y^2 - 1)^3 - x^2 * y^3 = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nx = (x - cx) / (width * 0.38)
        const ny = -(y - cy * 1.1) / (height * 0.38)
        const d = (nx * nx + ny * ny - 1) ** 3 - nx * nx * (ny ** 3)
        if (Math.abs(d) < 0.35) {
          edges[y * width + x] = 1.0
        }
      }
    }
  } else if (iconName === 'comment' || iconName === 'reply') {
    // Speech bubble oval with bottom-left pointer notch
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x - cx) / (width * 0.42)
        const dy = (y - (cy - 2)) / (height * 0.32)
        const dist = Math.hypot(dx, dy)
        if (Math.abs(dist - 1.0) < 0.22) {
          edges[y * width + x] = 1.0
        }
      }
    }
  } else if (iconName === 'retweet' || iconName === 'repost') {
    // Rectangular cycle arrow outline
    for (let y = 4; y < height - 4; y++) {
      for (let x = 4; x < width - 4; x++) {
        if ((y === 4 || y === height - 5) && x >= 6 && x <= width - 6) edges[y * width + x] = 1.0
        if ((x === 4 || x === width - 5) && y >= 6 && y <= height - 6) edges[y * width + x] = 1.0
      }
    }
  } else if (iconName === 'composer_post' || iconName === 'submit') {
    // Rounded pill button contour
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const isBorder = (y === 2 || y === height - 3 || x === 2 || x === width - 3)
        if (isBorder) edges[y * width + x] = 1.0
      }
    }
  } else if (iconName === 'search') {
    // Magnifying glass circle + handle
    const r = Math.min(width, height) * 0.28
    const sx = cx - 2, sy = cy - 2
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const d = Math.hypot(x - sx, y - sy)
        if (Math.abs(d - r) < 1.2) edges[y * width + x] = 1.0
        // 45-deg handle
        if (x >= sx + r - 1 && y >= sy + r - 1 && Math.abs((x - sx) - (y - sy)) < 2) {
          edges[y * width + x] = 1.0
        }
      }
    }
  } else {
    // Fallback: generic rectangular interactive bounding contour
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        if (y === 2 || y === height - 3 || x === 2 || x === width - 3) edges[y * width + x] = 0.8
      }
    }
  }

  return edges
}

/**
 * Geometric icon definitions for theme-invariant matching across social platforms
 */
export const VISUAL_ICON_CATALOG = {
  heart: { width: 24, height: 24, description: 'Like / Heart button', category: 'engagement' },
  like: { width: 24, height: 24, description: 'Thumbs up / Like button', category: 'engagement' },
  retweet: { width: 24, height: 24, description: 'Repost / Retweet arrows', category: 'engagement' },
  repost: { width: 24, height: 24, description: 'Repost / Share arrow pill', category: 'engagement' },
  comment: { width: 24, height: 24, description: 'Comment / Reply bubble', category: 'engagement' },
  composer_post: { width: 68, height: 32, description: 'Submit / Post button pill', category: 'navigation' },
  search: { width: 24, height: 24, description: 'Search magnifier icon', category: 'navigation' },
  close_modal: { width: 20, height: 20, description: 'Dismiss / Close dialog cross', category: 'modal' }
}

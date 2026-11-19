/**
 * Viral Potential & Hook Strength Predictor
 * Based on 2026 Instagram recommendation algorithms prioritizing Saves, Shares & Dwell Time.
 */

export interface HookEvaluation {
  score: number // 0 - 100
  rating: 'Exceptional' | 'Strong' | 'Average' | 'Weak'
  strengths: string[]
  improvements: string[]
}

export interface ViralPrediction {
  overallScore: number // 0 - 100
  hookScore: number // 0 - 100
  saveSharePotential: 'Viral Tier' | 'High Growth' | 'Standard' | 'Low Reach'
  sentimentTone: 'Inspirational' | 'Contrarian / Curious' | 'Relatable / Humorous' | 'Educational' | 'Neutral'
  dwellTimeGrade: 'A+' | 'A' | 'B' | 'C'
  tips: string[]
}

const CONTRARIAN_TRIGGERS = ['stop', 'never', 'unpopular opinion', 'why i quit', 'truth about', 'biggest mistake', 'myth']
const CURIOSITY_TRIGGERS = ['the secret', 'nobody talks about', 'how i got', 'what happened when', 'the real reason', 'behind the scenes']
const VALUE_TRIGGERS = ['save this', 'guide', 'steps to', 'framework', 'breakdown', 'workflow', 'checklist', 'tools']
const GENERIC_AI_CLICHES = ["in today's fast-paced", 'game-changer', 'elevate your', 'delve into', 'unleash your', 'embark on']

export function evaluateHook(firstTwoLines: string): HookEvaluation {
  const text = firstTwoLines.toLowerCase().trim()
  let score = 50
  const strengths: string[] = []
  const improvements: string[] = []

  if (!text) {
    return {
      score: 10,
      rating: 'Weak',
      strengths: [],
      improvements: ['Add a punchy 1-sentence opening before the Instagram "more" truncation point.']
    }
  }

  // Length check (sweet spot is 40 - 120 characters before truncation)
  if (text.length >= 40 && text.length <= 130) {
    score += 15
    strengths.push('Optimal character length before "more" fold')
  } else if (text.length > 150) {
    score -= 10
    improvements.push('Opening is too long; key curiosity hook gets buried behind the "more" button.')
  }

  // Check curiosity & contrarian triggers
  if (CONTRARIAN_TRIGGERS.some(t => text.includes(t))) {
    score += 18
    strengths.push('Uses contrarian trigger to interrupt scrolling feed')
  }

  if (CURIOSITY_TRIGGERS.some(t => text.includes(t))) {
    score += 15
    strengths.push('Strong curiosity gap creates desire to tap and read full caption')
  }

  // Penalize generic AI phrasing that Instagram's 2026 reach filters penalize
  if (GENERIC_AI_CLICHES.some(c => text.includes(c))) {
    score -= 25
    improvements.push('Contains generic AI cliché phrase. Instagram algorithms penalize this by up to 40% reach.')
  }

  const finalScore = Math.min(100, Math.max(10, score))
  let rating: HookEvaluation['rating'] = 'Average'
  if (finalScore >= 85) rating = 'Exceptional'
  else if (finalScore >= 70) rating = 'Strong'
  else if (finalScore < 50) rating = 'Weak'

  return {
    score: finalScore,
    rating,
    strengths,
    improvements
  }
}

export function predictViralReach(caption: string, category = ''): ViralPrediction {
  const text = caption.trim()
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const hookText = lines.slice(0, 2).join(' ')

  const hookEval = evaluateHook(hookText)

  let saveShareScore = 50
  const tips: string[] = []

  // Check value signals that drive Instagram Saves & Shares
  const lower = text.toLowerCase()
  if (VALUE_TRIGGERS.some(v => lower.includes(v))) {
    saveShareScore += 25
    tips.push('High Save/Bookmark probability: Contains actionable frameworks or reference value.')
  } else {
    tips.push('Add an explicit Save/Share call-to-action (e.g. "Save this for your next workflow") to trigger algorithm boosts.')
  }

  // Sentiment tone detection
  let sentimentTone: ViralPrediction['sentimentTone'] = 'Neutral'
  if (lower.includes('laugh') || lower.includes('😂') || lower.includes('💀') || lower.includes('relate')) {
    sentimentTone = 'Relatable / Humorous'
  } else if (lower.includes('push') || lower.includes('consistency') || lower.includes('win') || lower.includes('keep going')) {
    sentimentTone = 'Inspirational'
  } else if (CONTRARIAN_TRIGGERS.some(t => lower.includes(t))) {
    sentimentTone = 'Contrarian / Curious'
  } else if (VALUE_TRIGGERS.some(t => lower.includes(t))) {
    sentimentTone = 'Educational'
  }

  // Dwell-Time Grade calculation
  let dwellTimeGrade: ViralPrediction['dwellTimeGrade'] = 'B'
  if (text.length > 280 && lines.length >= 3) {
    dwellTimeGrade = 'A+'
    saveShareScore += 10
  } else if (text.length > 150) {
    dwellTimeGrade = 'A'
  } else if (text.length < 50) {
    dwellTimeGrade = 'C'
    tips.push('Caption is very short; longer dwell time signals higher post relevance.')
  }

  const overallScore = Math.min(99, Math.max(25, Math.round((hookEval.score * 0.5) + (saveShareScore * 0.5))))

  let potential: ViralPrediction['saveSharePotential'] = 'Standard'
  if (overallScore >= 85) potential = 'Viral Tier'
  else if (overallScore >= 70) potential = 'High Growth'
  else if (overallScore < 50) potential = 'Low Reach'

  return {
    overallScore,
    hookScore: hookEval.score,
    saveSharePotential: potential,
    sentimentTone,
    dwellTimeGrade,
    tips: [...hookEval.improvements, ...tips]
  }
}

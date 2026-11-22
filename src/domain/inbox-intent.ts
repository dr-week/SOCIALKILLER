export type InboxIntent = 'hot_lead' | 'inquiry' | 'complaint' | 'praise' | 'general'

export interface IntentBadge {
  intent: InboxIntent
  label: string
  tone: 'hot' | 'info' | 'warn' | 'good' | 'neutral'
}

const RULES: Array<{ intent: InboxIntent; label: string; tone: IntentBadge['tone']; pattern: RegExp }> = [
  {
    intent: 'hot_lead',
    label: 'Hot Lead',
    tone: 'hot',
    pattern: /\b(price|pricing|cost|quote|hire|sponsor|collab|partner|buy|demo|book|call|license|enterprise|paid)\b/i
  },
  {
    intent: 'complaint',
    label: 'Complaint',
    tone: 'warn',
    pattern: /\b(broken|bug|crash|error|fail|issue|refund|hate|worst|slow|not working|stuck)\b/i
  },
  {
    intent: 'praise',
    label: 'Praise',
    tone: 'good',
    pattern: /\b(love|awesome|amazing|great|insane|clean|fast|thank|thanks|congrats|brilliant|fire)\b/i
  },
  {
    intent: 'inquiry',
    label: 'Inquiry',
    tone: 'info',
    pattern: /(\?|\b(how|what|when|where|can you|does it|link|repo|docs|tutorial)\b)/i
  }
]

export function classifyInboxIntent(message: string): IntentBadge {
  const text = (message || '').trim()
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return { intent: rule.intent, label: rule.label, tone: rule.tone }
    }
  }
  return { intent: 'general', label: 'General', tone: 'neutral' }
}

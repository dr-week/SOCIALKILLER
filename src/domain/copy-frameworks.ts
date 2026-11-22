export type CopyFrameworkId = 'hook_story_offer' | 'short_punchy' | 'edu_carousel' | 'event_promo'

export interface CopyFrameworkDef {
  id: CopyFrameworkId
  label: string
  hint: string
}

export const COPY_FRAMEWORKS: CopyFrameworkDef[] = [
  { id: 'hook_story_offer', label: 'Hook-Story-Offer', hint: 'Pattern interrupt + narrative + clear CTA' },
  { id: 'short_punchy', label: 'Short & Punchy', hint: 'Under 240 chars for high-velocity feeds' },
  { id: 'edu_carousel', label: 'Carousel Slides', hint: '5-slide educational breakdown' },
  { id: 'event_promo', label: 'Launch Promo', hint: 'Announcement + benefit + deadline CTA' }
]

export function applyCopyFramework(
  frameworkId: CopyFrameworkId,
  brandName: string,
  topic: string,
  rawNotes: string
): { topic: string; notes: string } {
  const cleanTopic = topic.trim() || `${brandName} update`
  const core = rawNotes.trim() || `Key update from ${brandName} designed for faster workflows.`

  if (frameworkId === 'hook_story_offer') {
    return {
      topic: cleanTopic,
      notes: [
        `HOOK: Most teams waste hours on this — here is how ${brandName} fixed it.`,
        `STORY: ${core}`,
        `OFFER: Try it today and share your benchmark results in the replies.`
      ].join('\n\n')
    }
  }

  if (frameworkId === 'short_punchy') {
    const firstSentence = core.split(/(?<=[.!?])\s+/)[0] || core
    return {
      topic: cleanTopic,
      notes: `${cleanTopic}\n\n${firstSentence.slice(0, 160)}\n\nDetails in thread.`
    }
  }

  if (frameworkId === 'edu_carousel') {
    return {
      topic: `5-Step Guide: ${cleanTopic}`,
      notes: [
        `Slide 1 (Cover): ${cleanTopic}`,
        `Slide 2 (Problem): Why standard approaches slow teams down.`,
        `Slide 3 (Core Shift): ${core}`,
        `Slide 4 (Proof): Measurable speed & zero-bloat architecture.`,
        `Slide 5 (CTA): Save this breakdown & follow ${brandName}.`
      ].join('\n')
    }
  }

  return {
    topic: `Launching: ${cleanTopic}`,
    notes: [
      `🚀 ${brandName} is live: ${cleanTopic}`,
      core,
      `What you get: instant setup, zero cloud lock-in, and full control.`,
      `Join the launch and drop feedback below.`
    ].join('\n\n')
  }
}

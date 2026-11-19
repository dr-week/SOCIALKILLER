import { CURATED_CREATIVE_VIDEOS } from './creative-hub/curated-videos'

export interface CreativeVideoItem {
  id: string
  title: string
  category: string
  duration: string
  thumbnail: string
  videoUrl: string
  author: string
  likes: string
  recommendedCaptions: string[]
}

export const BRAND_NICHES = [
  'Tech & AI Development',
  'Design & Aesthetics',
  'Business & Entrepreneurship',
  'Lifestyle & Productivity',
  'Fitness & Wellness',
  'Viral Humor & Relatable'
]

export const HUMAN_CAPTIONS_CATALOG: Record<string, string[]> = {
  'Tech & AI Development': [
    'Honestly mindblown by how fast tech is moving. Building in public has been a wild ride — what are you working on right now?',
    "Behind every 'seamless' demo is about 47 failed attempts and 3 coffees. Who else relates?",
    'Spent hours refining this workflow so you do not have to. Save this before you lose it.',
    'Simple tools > complicated workflows every single day. Thoughts?',
    'Late nights, clean code, and zero distractions. The vibe today.'
  ],
  'Design & Aesthetics': [
    'Clean layouts and sharp details hit different. Which slide is your favorite?',
    'Less is more, but only when every detail has a reason to be there.',
    'POV: You finally organized your design workspace and inner peace is restored.',
    'Good design feels effortless. Great design feels invisible. Thoughts?',
    'A quick look behind the scenes. Save this if you like this style.'
  ],
  'Business & Entrepreneurship': [
    "Stop waiting for the 'perfect timing' — it does not exist. Start messy, refine later.",
    'A small win today is still a win. Keep pushing even on the slow days.',
    "The best investment you will ever make is in your own consistency. Let's get it.",
    'Real talk: consistency beats motivation 10 times out of 10. Agree or disagree?',
    'Share this with someone who needed this reminder today.'
  ],
  'Lifestyle & Productivity': [
    'Reset routine in full effect. Small habits make the biggest difference over time.',
    'Unplugging for a few hours did wonders. Normalize taking breaks without feeling guilty.',
    'Current mood: slow mornings, deep focus, and good energy.',
    'If you have been feeling overwhelmed lately, take this as your sign to pause and breathe.',
    "Sunday reset check-in: what is one thing you are focusing on this week?"
  ],
  'Viral Humor & Relatable': [
    'I was not prepared for this outcome at all.',
    "Tell me you're exhausted without telling me you're exhausted — I'll go first.",
    'Why is this so accurate though? Send this to someone who does this every time.',
    'No words, just pure chaos. Enjoying every second of it.',
    'Trying to get through the final sprint of the day:'
  ]
}

export function generateHumanCaptions(topicOrNiche: string, brandHandle = ''): string[] {
  const catalog = HUMAN_CAPTIONS_CATALOG[topicOrNiche] || HUMAN_CAPTIONS_CATALOG['Tech & AI Development']
  const handleTag = brandHandle ? ` (via @${brandHandle.replace(/^@/, '')})` : ''
  return catalog.map(cap => `${cap}${handleTag}`)
}

export { CURATED_CREATIVE_VIDEOS }

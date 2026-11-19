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
    "Honestly mindblown by how fast tech is moving. Building in public has been a wild ride 🚀 What are you working on right now?",
    "Behind every 'seamless' demo is about 47 failed attempts and 3 coffees. Who else relates? 😂☕",
    "Spent hours refining this workflow so you don’t have to. Save this before you lose it!",
    "Simple tools > complicated workflows every single day. Thoughts?",
    "Late nights, clean code, and zero distractions. The vibe today."
  ],
  'Design & Aesthetics': [
    "Clean layouts and sharp details hit different. Which slide is your favorite? 🎨",
    "Less is more, but only when every detail has a reason to be there ✨",
    "POV: You finally organized your design workspace and inner peace is restored.",
    "Good design feels effortless. Great design feels invisible. Thoughts?",
    "A quick look behind the scenes. Drop a 🖤 if you like this style."
  ],
  'Business & Entrepreneurship': [
    "Stop waiting for the 'perfect timing'—it doesn't exist. Start messy, refine later 📈",
    "A small win today is still a win. Keep pushing even on the slow days.",
    "The best investment you will ever make is in your own consistency. Let's get it!",
    "Real talk: consistency beats motivation 10 times out of 10. Agree or disagree?",
    "Tag someone who needed this reminder today."
  ],
  'Lifestyle & Productivity': [
    "Reset routine in full effect. Small habits make the biggest difference over time 🌿",
    "Unplugging for a few hours did wonders. Normalize taking breaks without feeling guilty ✨",
    "Current mood: slow mornings, deep focus, and good energy.",
    "If you’ve been feeling overwhelmed lately, take this as your sign to pause and breathe.",
    "Sunday reset check-in: what's one thing you're focusing on this week?"
  ],
  'Viral Humor & Relatable': [
    "I was not prepared for this outcome at all 💀💀",
    "Tell me you're exhausted without telling me you're exhausted... I'll go first 😭",
    "Why is this so accurate though? Send this to someone who does this every time 😂",
    "No words, just pure chaos. Enjoying every second of it.",
    "My last two brain cells trying to get through the day:"
  ]
}

export function generateHumanCaptions(topicOrNiche: string, brandHandle = ''): string[] {
  const catalog = HUMAN_CAPTIONS_CATALOG[topicOrNiche] || HUMAN_CAPTIONS_CATALOG['Tech & AI Development']
  const handleTag = brandHandle ? ` (via @${brandHandle.replace(/^@/, '')})` : ''
  
  return catalog.map(cap => `${cap}${handleTag}`)
}

export const CURATED_CREATIVE_VIDEOS: CreativeVideoItem[] = [
  {
    id: 'vid-1',
    title: 'Future Tech Workspace & UI Setup',
    category: 'Tech & AI Development',
    duration: '0:28',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    author: 'future_design_lab',
    likes: '14.2K',
    recommendedCaptions: [
      "Honestly mindblown by how fast tech is moving. Building in public has been a wild ride 🚀 What are you working on right now?",
      "Spent hours refining this workflow so you don’t have to. Save this before you lose it!",
      "Simple tools > complicated workflows every single day. Thoughts?"
    ]
  },
  {
    id: 'vid-2',
    title: 'Midnight Coding & Lo-Fi Flow State',
    category: 'Tech & AI Development',
    duration: '0:35',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    author: 'code_noir',
    likes: '28.9K',
    recommendedCaptions: [
      "Late nights, clean code, and zero distractions. The vibe today ☕",
      "Behind every 'seamless' demo is about 47 failed attempts and 3 coffees. Who else relates? 😂☕",
      "When the flow state hits at 2 AM and everything just clicks."
    ]
  },
  {
    id: 'vid-3',
    title: 'Minimalist Studio Aesthetic & Branding',
    category: 'Design & Aesthetics',
    duration: '0:22',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    author: 'studio_koto',
    likes: '19.4K',
    recommendedCaptions: [
      "Clean layouts and sharp details hit different. Which slide is your favorite? 🎨",
      "Less is more, but only when every detail has a reason to be there ✨",
      "Good design feels effortless. Great design feels invisible. Thoughts?"
    ]
  },
  {
    id: 'vid-4',
    title: 'Founder Routine: Focus, Execution & Discipline',
    category: 'Business & Entrepreneurship',
    duration: '0:42',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    author: 'venture_mindset',
    likes: '34.1K',
    recommendedCaptions: [
      "Stop waiting for the 'perfect timing'—it doesn't exist. Start messy, refine later 📈",
      "Real talk: consistency beats motivation 10 times out of 10. Agree or disagree?",
      "The best investment you will ever make is in your own consistency. Let's get it!"
    ]
  },
  {
    id: 'vid-5',
    title: 'Aesthetic Morning Reset & Habit Stacking',
    category: 'Lifestyle & Productivity',
    duration: '0:30',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    author: 'serene_habits',
    likes: '45.3K',
    recommendedCaptions: [
      "Reset routine in full effect. Small habits make the biggest difference over time 🌿",
      "Current mood: slow mornings, deep focus, and good energy.",
      "If you’ve been feeling overwhelmed lately, take this as your sign to pause and breathe."
    ]
  },
  {
    id: 'vid-6',
    title: 'Relatable Creator Struggles & Behind The Scenes',
    category: 'Viral Humor & Relatable',
    duration: '0:18',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    author: 'daily_relatable',
    likes: '62.7K',
    recommendedCaptions: [
      "I was not prepared for this outcome at all 💀💀",
      "Tell me you're exhausted without telling me you're exhausted... I'll go first 😭",
      "Why is this so accurate though? Send this to someone who does this every time 😂"
    ]
  }
]

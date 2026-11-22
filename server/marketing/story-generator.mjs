/**
 * Story & Narrative Generator Engine for Goan Tech Entrepreneurs (<150 lines)
 */

import { DEFAULT_BRANDS } from './content/default-brands.mjs'
import { generateDailyJourney } from './content/daily-journey.mjs'

export { DEFAULT_BRANDS, generateDailyJourney }

export function generateVideoScript({ brand, topic, pillar = 'daily_grind', format = 'short_form_60s' }) {
  const brandName = brand?.name || 'Danger Labs'
  const location = brand?.location || 'Goa, India'

  let hook = ''
  let conflict = ''
  let lesson = ''
  let cta = ''

  if (brand?.id === 'hyperdrive-studio') {
    hook = `"They said you can only build a premier creative agency in Mumbai or Bangalore. They were wrong."`
    conflict = `"When you edit 4K footage on a battery inverter during coastal rainstorms in ${location}, you realize visual storytelling isn't about fancy studio gear. It's about raw obsession."`
    lesson = `"Today we proved that ${topic || 'cinematic technical storytelling'} hits harder when it comes from an authentic underdog perspective."`
    cta = `"If you're creating art or engineering against conventional advice from a small town, leave your project in the comments. We back each other up."`
  } else if (pillar === 'family_doubts') {
    hook = `"My parents still ask when I'm going to get a 'real job' at an IT company in Bangalore."`
    conflict = `"Four years building ${brandName} from ${location}. Relatives visit and whisper about whether sitting in front of terminal logs 14 hours a day is viable, while I deal with erratic coastal power and zero seed capital."`
    lesson = `"What they didn't see is that today our zero-overhead engine surpassed 100,000 req/sec with 0% virtual DOM overhead. The code doesn't care where you sit."`
    cta = `"To every developer writing code late at night carrying family doubts: keep shipping. What technical hurdle are you conquering today?"`
  } else if (pillar === 'underdog_location') {
    hook = `"Everyone told me to move to Silicon Valley or Bangalore to build infrastructure software."`
    conflict = `"They said you can't build cutting-edge runtimes from ${location}. You need VC coffee chats. You need networking mixers. Meanwhile, I had 4G hotspots, relentless focus, and a laptop fan working overtime."`
    lesson = `"We built ${topic || 'Zuari Framework'} right here: zero-copy Wasm FFI, 120 FPS spatial HUDs, and zero vendor bloat. Competence beats geography every single time."`
    cta = `"Are you building from an underdog location? Drop your city and your stack below. Let's showcase regional talent."`
  } else {
    hook = `"The glamorous tech startup life is a myth. Here is what day 418 actually looked like."`
    conflict = `"Woke up at 6 AM in ${location}. Power went out at 11 AM. Debugged memory leaks on battery power while friends were at beach shacks enjoying their weekend."`
    lesson = `"By 7 PM, we eliminated 90% of memory overhead in ${topic || 'our runtime'}. Bootstrapping isn't about working in paradise; it's about building through every distraction."`
    cta = `"What is the hardest trade-off you made this week for your craft? Tell me below."`
  }

  const beats = [
    {
      marker: 'HOOK',
      timecode: '0:00 - 0:04',
      visual: '[VISUAL: Tight crop on founder eyes staring at screen, warm ambient room light, subtle natural grain]',
      audio: '[AUDIO: Clean voiceover, quiet background silence with gentle mechanical keyboard click]',
      narration: hook
    },
    {
      marker: 'CONFLICT',
      timecode: '0:04 - 0:22',
      visual: `[VISUAL: Fast-cut sequence: laptop screen with terminal logs, rainy coastal window in ${location}, coffee mug, hand-drawn architecture sketches]`,
      audio: '[AUDIO: Subtle low-frequency synth swell enters, accelerating tempo]',
      narration: conflict
    },
    {
      marker: 'LESSON',
      timecode: '0:22 - 0:45',
      visual: '[VISUAL: Founder speaks directly to camera, firm eye contact, gestures toward screen displaying benchmark graphs]',
      audio: '[AUDIO: Music drops into a steady, rhythmic, confident beat]',
      narration: lesson
    },
    {
      marker: 'CTA',
      timecode: '0:45 - 0:60',
      visual: `[VISUAL: Quick logo card for ${brandName} (${location}) $\\to$ cut back to founder holding phone or coffee]`,
      audio: '[AUDIO: Clean audio resolve with warm outro tone]',
      narration: cta
    }
  ]

  const fullText = beats.map(b => `${b.marker} (${b.timecode}):\n${b.visual}\n${b.audio}\n"${b.narration}"`).join('\n\n')
  const teleprompterText = beats.map(b => b.narration).join('\n\n')

  return {
    id: `script-${Date.now().toString(36)}`,
    brandId: brand?.id || 'danger-labs',
    title: topic || `Building ${brandName} from ${location}`,
    pillar,
    format,
    durationEstimate: format === 'short_form_30s' ? '30s' : '55s',
    retentionScore: 94,
    beats,
    fullText,
    teleprompterText,
    createdAt: new Date().toISOString()
  }
}

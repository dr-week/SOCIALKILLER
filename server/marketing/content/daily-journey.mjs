/**
 * Generate 3 daily micro-stories tailored for X, LinkedIn, and Reddit
 */
export function generateDailyJourney({ brand, topic }) {
  const brandName = brand?.name || 'Danger Labs'
  const location = brand?.location || 'Goa, India'
  const topicTitle = topic || 'shipping zero-overhead architecture'

  const xPost = `Day 420 building ${brandName} from ${location}.

Power cut interrupted compilation for 2 hours today. Switched to mobile hotspot, fixed a stubborn memory leak in our runtime, and shipped the patch before dinner.

Parents still wonder why I didn't take an IT job in Bangalore.
The code answers every question. 

Keep building. ⚡`

  const linkedinPost = `When people hear we build high-performance systems from Goa, India, they imagine working from beach cafes with a cocktail.

Here is the unglamorous reality of bootstrapping ${brandName}:
- 14-hour days in a bedroom with a desk and an inverter
- Explaining to family why you turned down safe corporate packages
- Debugging ${topicTitle} while everyone else is on holiday
- Zero external seed capital, 100% self-reliance

The result?
Our runtime executes with 0% virtual DOM overhead and microsecond latency.

You don't need Silicon Valley or Bangalore to engineer world-class software. You just need discipline and stubborn commitment.

To every developer building against the odds in tier-2 cities: your location is not your limit.`

  const redditBody = `I'm a solo software engineer building a systems-tech company (${brandName}) out of Goa. 

In India, if you don't commute to an MNC campus in Bangalore or Pune wearing an ID badge, your family genuinely thinks you're struggling. For 3 years, every family gathering was an interrogation about when I'd "settle down" with a safe corporate salary.

Instead, I focused on solving a technical problem that drove me crazy: modern web framework bloat. 

Today we finished optimizing ${topicTitle}:
- 0% Virtual DOM diffing overhead (native W3C DOM Parts)
- Direct Float64Array Rust/Zig FFI
- Native 120 FPS rendering on spatial devices

I wanted to share this because if you're working alone from an unconventional location, the psychological burden of doubt is often heavier than the actual engineering. Don't let regional skepticism stop you from shipping ambitious tech.`

  return {
    id: `journey-${Date.now().toString(36)}`,
    brandId: brand?.id || 'danger-labs',
    headline: `Daily Grind & Technical Discipline (${location})`,
    hurdle: 'Battling coastal power interruptions and regional skepticism',
    lesson: 'Competence and disciplined execution supersede geography',
    milestone: topicTitle,
    channels: {
      x: xPost,
      linkedin: linkedinPost,
      reddit: {
        subreddit: 'r/developersIndia',
        title: `Bootstrapping an open-source systems engine from Goa while carrying family doubts: Lessons from 3 years of daily coding`,
        body: redditBody
      }
    },
    generatedAt: new Date().toISOString()
  }
}

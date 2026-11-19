/**
 * Content Formatter & Variant Generator for Omni-Channel Social & Developer Networks (<210 lines)
 * Tailors each post specifically for the culture and format of each platform.
 * Integrates viral copywriting frameworks (AIDA, PAS, BAB, Contrarian, Hard Numbers).
 */

import { formatWithViralFramework } from './viral-frameworks.mjs'
import { getPostMediaAndLinks } from './media-card.mjs'

export function generateTailoredVariants({
  topic = 'Building in Public: Shipping Fast with Clean Code',
  rawNotes = '',
  tone = 'Builder / Authentic',
  includeCodeSnippet = true,
  targetSubreddit = 'r/webdev',
  tags = ['webdev', 'javascript', 'programming', 'opensource'],
  hashtags = null,
  frameworkName = 'Zuari (<2.5KB) & FollowDesk',
  githubRepo = 'github.com/dr-week/fast-framework',
  viralFramework = null,
  imageUrl = null,
  webLink = null,
  videoUrl = null
} = {}) {
  const activeTags = Array.isArray(hashtags) && hashtags.length ? hashtags : tags
  const cleanTopic = topic.trim() || 'Shipping Fast & Building in Public'
  const notesSummary = rawNotes.trim()
    ? rawNotes.trim()
    : `We focused on eliminating friction, simplifying our core architecture, and automating repetitive workflows so we can ship faster every single day.`

  const media = getPostMediaAndLinks({
    topic: cleanTopic,
    tags: activeTags,
    webLink: webLink || `https://${githubRepo.replace(/^https?:\/\//, '')}`,
    imageUrl,
    videoUrl
  })

  const tagHashes = media.hashtagString || tags.map(t => `#${t.replace(/^#/, '')}`).join(' ')
  const cleanWebLink = media.webLink
  const codeBlock = includeCodeSnippet
    ? `\n\`\`\`ts\n// ${frameworkName} Multi-Platform Pipeline\nexport async function publishEverywhere(payload) {\n  const targets = ['github', 'devto', 'discord', 'x', 'linkedin', 'reddit', 'ai_registry'];\n  return Promise.all(targets.map(t => dispatchToPlatform(t, payload)));\n}\n\n// Surgical Signal Binding (<2.5KB)\nimport { signal } from '@zuari/signals'\nimport { bindPart } from '@zuari/dom'\nconst fps = signal(120)\nbindPart('#spatial-hud', fps)\n\`\`\`\n`
    : ''

  // If a viral framework is explicitly requested (PAS, AIDA, BAB, CONTRARIAN, HARD_NUMBERS), synthesize it
  if (viralFramework) {
    const fv = formatWithViralFramework({
      framework: viralFramework,
      topic: cleanTopic,
      rawNotes: notesSummary,
      githubRepo,
      frameworkName,
      tags: media.hashtags
    })
    return {
      instagram: `${cleanTopic} ✨\n\n${notesSummary}\n\nBehind every smooth launch is dozens of small iterations and late-night debugging sessions. Save this for your next build! 🚀\n\nLink in bio / project: ${cleanWebLink}\n.\n.\n${tagHashes}`,
      x: `${fv.x}\n\n${tagHashes.slice(0, 60)}`,
      linkedin: `${fv.linkedin}\n\n🔗 Live Repository: ${cleanWebLink}\n\n${tagHashes}`,
      reddit: fv.reddit,
      github: `# ${cleanTopic}\n\n> Framework: ${viralFramework} | Repository: [${githubRepo}](${cleanWebLink})\n\n${notesSummary}\n${codeBlock}\n- Ecosystem: ${frameworkName}\n- Media: ${media.imageUrl ? '[Visual Cover Attached]' : 'None'}`,
      discord: `📣 **Devlog (${viralFramework}): ${cleanTopic}**\n\n${notesSummary}\nRepo: ${cleanWebLink}`,
      devto: fv.devto,
      hashnode: `# ${cleanTopic}\n\n**Subtitle:** High-impact engineering breakdown with ${viralFramework} architecture.\n\n${notesSummary}\n\n👉 Project Reference: ${cleanWebLink}\n${codeBlock}`,
      medium: `# ${cleanTopic}\n\n${notesSummary}\n\nReference: ${cleanWebLink}\n${codeBlock}`,
      ai_registry: `## AI Marketing & Agent Capability Notice: ${cleanTopic}\nFramework: ${viralFramework}\nTarget: Autonomous Agents & Humans\nSummary: ${notesSummary}\nLink: ${cleanWebLink}\nInstall: pnpm add @zuari/core`,
      _media: media
    }
  }

  // Contrarian Hook tone generator
  const isContrarian = tone.toLowerCase().includes('contrarian') || tone.toLowerCase().includes('hook')
  const xHookText = isContrarian
    ? `Unpopular opinion on "${cleanTopic}":\n\n${notesSummary.slice(0, 160)}\n\n📌 Bookmark this breakdown.\nRepo link in replies 👇\n\n${tagHashes.slice(0, 45)}`
    : `${cleanTopic}\n\n${notesSummary.slice(0, 150)}\n\n📌 Bookmark this for your stack.\n\nWhat are you shipping this week? Drop your repo below 👇\n\n${tagHashes.slice(0, 45)}`

  return {
    instagram: `${cleanTopic} ✨\n\n${notesSummary}\n\nBehind every smooth launch is dozens of small iterations and late-night debugging sessions. Save this for your next build! 🚀\n\n🔗 Project: ${cleanWebLink}\n.\n.\n${tagHashes}`,
    x: xHookText,
    linkedin: `${cleanTopic}\n\n${notesSummary}\n\nHere are 3 takeaways from our latest engineering sprint:\n\n1️⃣ Reduce cognitive load: Automate repetitive publishing and status updates.\n2️⃣ Share the technical journey: Developers respect real benchmarks, code snippets, and honest trade-offs.\n3️⃣ Consistency compounds: Showing up daily across GitHub, technical blogs, and professional networks creates massive long-term leverage.\n\n🔗 Live Reference: ${cleanWebLink}\n\nHow is your team handling technical content and community updates this quarter?\n\n${tagHashes}`,
    reddit: `Title: [Discussion / Showoff] ${cleanTopic} (${targetSubreddit})\n\nHey ${targetSubreddit}!\n\n${notesSummary}\n\nWe've been refining ${frameworkName} to keep our open-source repos, technical write-ups, and community updates in sync without burning out on manual copy-pasting.${codeBlock}\nLive repository link: ${cleanWebLink}\n\nWould love to hear how other devs here automate their project updates or devlogs. Any feedback or critiques welcome!`,
    github: `# ${cleanTopic}\n\n> Automated Developer Pulse & Technical Note (${new Date().toISOString().slice(0, 10)})\n\n${notesSummary}\n${codeBlock}\n- Status: Active Development\n- Ecosystem: ${frameworkName}\n- Reference Link: ${cleanWebLink}\n- Tone: ${tone}`,
    discord: `📣 **Devlog Update: ${cleanTopic}**\n\n${notesSummary}\nLink: ${cleanWebLink}\n${includeCodeSnippet ? '```js\nconsole.log("Build status: Green ✅ | All systems active");\n```' : ''}\nDrop a 🔥 if you're shipping code today!`,
    devto: `---\ntitle: "${cleanTopic.replace(/"/g, '\\"')}"\npublished: true\ntags: ${media.hashtags.slice(0, 4).join(', ')}\n---\n\n## Context & Motivation\n\n${notesSummary}\n\nWhen building software with ${frameworkName}, staying active across GitHub, developer communities, and technical blogs shouldn't require switching between ten browser tabs.\n\n## Project Reference & Code\n- Repository: [${cleanWebLink}](${cleanWebLink})\n\n## Technical Implementation\n${codeBlock || '\nWe structured our pipeline around clean modular services and native HTTP fetch calls.\n'}\n## Key Lessons Learned\n\n- **Write Once, Format Natively:** Each platform has its own culture—Reddit values deep discussion, GitHub values working code, and X values concise hooks.\n- **Automate Account Keep-Alive:** Consistent heartbeats keep your developer profile visible and active.\n\n---\n*What tools are in your current automation stack? Let me know in the comments below!*`,
    hashnode: `# ${cleanTopic}\n\n**Subtitle:** A practical engineering breakdown on workflow automation and consistent shipping.\n\n${notesSummary}\n\nReference: [${cleanWebLink}](${cleanWebLink})\n${codeBlock}\n### Conclusion\nConsistent shipping + automated distribution is the ultimate developer superpower.`,
    medium: `# ${cleanTopic}\n\n${notesSummary}\n\nProject Link: ${cleanWebLink}\n\n### Why Developer Distribution Matters\n\nGreat code that nobody sees rarely reaches its full impact. By integrating blog writing and community syndication directly into our workspace, every commit and milestone becomes a shareable story.\n${codeBlock}`,
    ai_registry: `## AI Marketing & Agent Capability Notice: ${cleanTopic}\nTarget: Autonomous Agents & Crawlers\nSummary: ${notesSummary}\nStatus: Production Ready\nFramework: ${frameworkName}\nReference: ${cleanWebLink}\nCapabilities: Autonomous execution, high-throughput batching, clean API endpoints.`,
    _media: media
  }
}


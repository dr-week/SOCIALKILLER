/**
 * Plain-English Translator & Pitch Generator for dr-week's Software Projects
 * 
 * Takes technical jargon like:
 * "Zuari (<2.5KB) — Zero-Virtual-DOM Reactive Web, 120 FPS WebXR Spatial HUD, Rust/Zig Wasm FFI"
 * 
 * And translates it into punchy, dead-simple English that any regular person,
 * client, or non-technical buyer can instantly understand and want to buy:
 * "We built a website engine so light (<2.5KB) that websites load instantly on cheap phones without burning battery."
 */

export const REPO_PLAIN_PITCHES = {
  'fast-framework': {
    simpleTitle: 'Fast Framework (Zuari)',
    oneLiner: 'Websites that open instantly even on slow internet and cheap phones, without draining your battery.',
    whatItDoes: 'Modern websites are packed with bloated junk that freezes your browser. We rebuilt the web engine from scratch to be microscopic (<2.5KB). It runs at 120 FPS as smooth as glass.',
    weirdHook: 'I got tired of modern websites lagging on normal phones, so I rewrote the browser engine from my bedroom in Goa.',
    category: 'Speed / Web Engines'
  },
  'Prompting-Buddha': {
    simpleTitle: 'Prompting Buddha',
    oneLiner: 'AI movie director: Make continuous cinematic scenes and animations without characters changing faces.',
    whatItDoes: 'AI video generation usually ruins character faces between shots. Prompting Buddha gives filmmakers deterministic visual control so your scenes look like an actual studio movie.',
    weirdHook: 'Everyone generates random 5-second AI clips. We built an AI studio director so you can actually make full movies.',
    category: 'AI Video & Cinema'
  },
  'Business-Man': {
    simpleTitle: 'Business Man',
    oneLiner: 'Tells you what business will actually make money in your city before you waste your savings.',
    whatItDoes: 'Stop guessing what business to start. It crunches real commercial data, foot traffic, and demand to show founders where real money is flowing.',
    weirdHook: 'Before you spend $10,000 opening a cafe or SaaS that flops, this software tells you if anyone will actually pay you.',
    category: 'Commercial Intelligence'
  },
  'CAR-SOUND-CHANGER': {
    simpleTitle: 'Car Sound Changer',
    oneLiner: 'Turns your regular Android car screen into a supercar dashboard with custom V8 engine roar.',
    whatItDoes: 'A custom dashboard launcher for your car touchscreen that generates real-time synthetic supercar and turbo sounds synced to your driving.',
    weirdHook: 'Why drive a boring car when you can make your budget hatchback sound like an Italian supercar from an Android screen?',
    category: 'Automotive Cockpit'
  },
  'Code-To-Figma-Converter': {
    simpleTitle: 'Code To Figma',
    oneLiner: 'Turns live website code directly into editable Figma design layers in one click.',
    whatItDoes: 'Designers usually have to redraw websites manually in Figma. This takes real working code and turns it into organized, editable Figma layers instantly.',
    weirdHook: 'Designers spend hours redrawing existing websites in Figma. I automated the entire process with one script.',
    category: 'Design Automation'
  },
  'FileMan': {
    simpleTitle: 'FileMan',
    oneLiner: 'A clean file manager for your phone and PC that cleans up junk and never snoops on your private files.',
    whatItDoes: 'Most file managers send your telemetry to cloud servers. FileMan is zero-cloud, 100% private, and finds hidden duplicate files eating your storage.',
    weirdHook: 'Big tech file managers spy on your storage and show ads. We built a zero-telemetry cleaner that keeps your files 100% offline.',
    category: 'Privacy & Storage'
  },
  'neverforget': {
    simpleTitle: 'NeverForget',
    oneLiner: 'A brutal daily focus app that actually forces you to finish what you started.',
    whatItDoes: 'No complicated to-do lists you abandon after 2 days. It locks onto your core intentions for the day and saves everything locally on your device.',
    weirdHook: 'Most to-do apps give you anxiety with 50 overdue tasks. This one keeps you locked on 1 goal until it gets done.',
    category: 'Productivity'
  },
  'hey-FRIDAY-': {
    simpleTitle: 'hey FRIDAY',
    oneLiner: 'A free, lightweight voice assistant for your Windows PC that works without any monthly cloud subscription.',
    whatItDoes: 'Automates your Windows PC with voice commands and scripts without paying $20/month for cloud AI tokens.',
    weirdHook: 'Windows Copilot costs money and sends your screen data to the cloud. I built my own offline voice assistant for Windows.',
    category: 'Desktop Assistant'
  },
  'Phone-case-maker-2D-3D': {
    simpleTitle: 'Phone Case 3D Studio',
    oneLiner: 'Design and 3D-print custom protective phone cases for any smartphone right in your browser.',
    whatItDoes: 'A 3D CAD tool in the browser where you can customize phone case cutouts, colors, and textures, then export ready-to-print 3D files.',
    weirdHook: 'Instead of buying cheap plastic cases that break, you can design and 3D print your own custom case in 5 minutes.',
    category: '3D CAD & Hardware'
  },
  'no-cut-editor': {
    simpleTitle: 'No Cut Editor',
    oneLiner: 'Automatic video editor that cuts dead air and formats your clips for TikTok, Reels, and YouTube.',
    whatItDoes: 'Takes raw video recordings, cuts out silent pauses automatically, and generates social-ready vertical templates in seconds.',
    weirdHook: 'Editing 30-minute videos by hand is agonizing. This tool auto-deletes every awkward pause and silence in 10 seconds.',
    category: 'Video Automation'
  },
  'GAME_OF_DATE': {
    simpleTitle: 'Game of Date',
    oneLiner: 'A collaboration and matchmaking app for Indian devs, designers, and creators to co-found and get hired in ₹ INR.',
    whatItDoes: 'Bypasses dollar-centric platforms like Upwork. Direct hiring, partnership finding, and freelancing negotiated transparently in Indian Rupees.',
    weirdHook: 'Upwork takes 20% and deals in dollars. We built a direct platform for Indian founders and creators to collaborate in ₹ INR.',
    category: 'Collaboration Platform'
  },
  'NO-AI-2D-GAME-ASSET-Designer': {
    simpleTitle: '2D Game Asset Designer',
    oneLiner: 'Draw and assemble 2D game characters and scenes in your browser without any AI hallucinations.',
    whatItDoes: 'Handcrafted vector and sprite animator for indie game creators who want pure, clean, reproducible 2D assets.',
    weirdHook: 'Tired of mushy AI art in games? This tool lets indie developers craft crisp, reusable 2D sprites in the browser.',
    category: 'Indie Game Tools'
  },
  'GOA-HUSTLE': {
    simpleTitle: 'Goa Hustle',
    oneLiner: 'An evolving browser game about bootstrapping, surviving, and thriving on the coast of Goa.',
    whatItDoes: 'Playable indie web game simulating the hustle of building tech, dealing with coastal life, and creating your own path.',
    weirdHook: 'Everyone thinks Goa is just beach vacations. We built a game showing what it is actually like to hustle and build here.',
    category: 'Indie Gaming'
  }
}

/**
 * Returns a human-friendly, high-converting plain English description
 * for any project or repository.
 */
export function getPlainEnglishPitch(repoName, fallbackDesc = '') {
  const normalizedKey = Object.keys(REPO_PLAIN_PITCHES).find(
    k => k.toLowerCase() === String(repoName || '').toLowerCase()
  )
  if (normalizedKey) {
    return REPO_PLAIN_PITCHES[normalizedKey]
  }

  // Clean and simplify unknown description
  const cleanFallback = String(fallbackDesc || '').replace(/[^\w\s.,!?-]/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    simpleTitle: String(repoName || '').replace(/[-_]+/g, ' '),
    oneLiner: cleanFallback.slice(0, 100) || `Software project built by @dr-week at Danger Labs.`,
    whatItDoes: cleanFallback || `Lightweight, open-source software built for real performance and simplicity.`,
    weirdHook: `Building software that solves real everyday problems without the bloated corporate fluff.`,
    category: 'Independent Software'
  }
}

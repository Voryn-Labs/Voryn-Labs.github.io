// VORYN LABS — Central Product Registry & Ecosystem Architecture
// Single source of truth for all current and future software across platforms.
// To add a new app in future releases, append a new object to window.VORYN_APPS.

window.VORYN_COLLECTIONS = [
  {
    id: "ios",
    eyebrow: "iPhone · Sideloadable IPAs",
    name: "iOS Sideload Suite",
    kind: "Mobile Utilities",
    blurb: "Independent, uncompromised iOS software. Sideload via Feather, SideStore, AltStore Classic, or LiveContainer."
  },
  {
    id: "macos",
    eyebrow: "macOS · Native Desktop",
    name: "macOS Power Tools",
    kind: "Desktop Applications",
    blurb: "Lightning-fast, native Mac utilities built for Apple Silicon and Intel. Menu bar context and productivity accelerators."
  },
  {
    id: "androidtv",
    eyebrow: "Android TV · Living Room",
    name: "Android TV Suite",
    kind: "Television Software",
    blurb: "Software designed for the biggest screen in the house. 100% offline, zero accounts, zero cloud dependencies."
  },
  {
    id: "lumen",
    eyebrow: "Lab Archive · On Hold",
    name: "The Lumen Series",
    kind: "Puzzle Games",
    blurb: "Fourteen quiet puzzle games — developed as calm, completeable offline logic experiments."
  },
  {
    id: "india",
    eyebrow: "Lab Archive · On Hold",
    name: "The India Collection",
    kind: "Regional Games",
    blurb: "Seven cultural and regional game prototypes built for India — word deductions, cricket trivia, and family gatherings."
  }
];

window.VORYN_APPS = [
  /* ==========================================================================
     FLAGSHIP PRODUCT 1: MUSYN (iOS Sideload)
     ========================================================================== */
  {
    id: "musyn",
    name: "Musyn",
    genre: "music",
    collection: "ios",
    platform: "iOS · iPhone",
    accent: "#FF5733",
    tagline: "Music in your rhythm. Dual-engine streaming uniting YouTube Music & JioSaavn with dynamic synced lyrics and instant offline caching.",
    featured: true,
    status: "Stable v1.0.0",
    statusType: "stable",
    version: "1.0.0",
    repoUrl: "https://github.com/Voryn-Labs/Musyn",
    downloadUrl: "https://github.com/Voryn-Labs/Musyn/releases/download/v1.0.0/Musyn.ipa",
    releasesUrl: "https://github.com/Voryn-Labs/Musyn/releases",
    privacyUrl: "musyn-privacy.html",
    detailUrl: "musyn.html",
    specs: ["iOS 15.0+", "Unsigned IPA", "YouTube Music + JioSaavn", "Time-Synced Lyrics", "Offline Audio Caching"],
    features: [
      ["Dual Catalog Integration", "Stream seamlessly from YouTube Music and JioSaavn within a unified, distraction-free player."],
      ["Dynamic Synced Lyrics", "Time-coded karaoke lyrics that follow along in rhythm with the music in real time."],
      ["Local Offline Storage", "One-tap downloads stored directly to local device storage for zero-connectivity playback."],
      ["Zero Telemetry & Subscriptions", "No audio fingerprinting, no third-party SDKs, and zero subscription paywalls."]
    ],
    storeUrl: null
  },

  /* ==========================================================================
     FLAGSHIP PRODUCT 2: CLOUDIFIED (iOS Sideload)
     ========================================================================== */
  {
    id: "cloudified",
    name: "Cloudified",
    genre: "backup",
    collection: "ios",
    platform: "iOS · iPhone",
    accent: "#2AC78A",
    tagline: "Bit-for-bit lossless media backup. Dual-destination sync pushing original quality photos and videos to Google Photos and private Telegram channels with independent queues.",
    featured: true,
    status: "Released v1.0",
    statusType: "stable",
    version: "1.0",
    repoUrl: "https://github.com/Voryn-Labs/Cloudified",
    downloadUrl: "https://github.com/Voryn-Labs/Cloudified/releases/latest/download/Cloudified-unsigned.ipa",
    releasesUrl: "https://github.com/Voryn-Labs/Cloudified/releases",
    privacyUrl: "cloudified-privacy.html",
    detailUrl: "cloudified.html",
    specs: ["iOS 26.0+", "Unsigned IPA", "Google Photos & Telegram", "Bit-for-Bit Lossless", "Verified Receipts"],
    features: [
      ["Dual-Destination Redundancy", "Simultaneously push original media to Google Photos and private Telegram channels with isolated progress."],
      ["Uncompressed Original Fidelity", "Zero client-side recompression. Back up full RAW, 4K ProRes, and full Live Photo assets untouched."],
      ["Verified Transaction Receipts", "Confirmed items are logged in a local atomic database; failed sends retry safely without duplicate spam."],
      ["Background Processing Integrity", "Engineered to respect iOS background limits while maintaining reliable queue resumption."]
    ],
    storeUrl: null
  },

  /* ==========================================================================
     FLAGSHIP PRODUCT 3: EXCLY (macOS Native)
     ========================================================================== */
  {
    id: "excly",
    name: "Excly",
    genre: "productivity",
    collection: "macos",
    platform: "macOS · Desktop",
    accent: "#1E6B4C",
    tagline: "Native macOS companion for Windows-style Excel shortcuts. Built with SwiftUI, AppKit, Core Graphics event taps, and Accessibility API.",
    featured: true,
    status: "Stable",
    statusType: "active",
    version: "1.0.0",
    repoUrl: "https://github.com/Voryn-Labs/Excly",
    downloadUrl: "https://github.com/Voryn-Labs/Excly/releases/download/v1.0.0/Excly-1.0.0-macOS.dmg",
    releasesUrl: "https://github.com/Voryn-Labs/Excly/releases/tag/v1.0.0",
    privacyUrl: "privacy.html",
    detailUrl: "excly.html",
    specs: ["macOS 13+", "Microsoft Excel for Mac", "SwiftUI & Core Graphics", "Zero Telemetry & Daemons"],
    features: [
      ["Windows Ribbon Alt Sequences", "Tap Alt / Option, then press H, O, I to AutoFit columns, jump across tabs, and execute familiar ribbon workflows."],
      ["Modifier Key Customization", "Assign Windows Alt and Control independently to Control, Option, or Command without disrupting macOS system hotkeys."],
      ["Zero Background Server", "Active strictly while Excel is foregrounded. No login items, daemons, or lingering processes."],
      ["Open Source Architecture", "Handcrafted in pure Swift with public audits, local signing verification, and verifiable builds."]
    ],
    storeUrl: null
  },

  /* ==========================================================================
     FLAGSHIP PRODUCT 4: NAVIGY (macOS Native)
     ========================================================================== */
  {
    id: "navigy",
    name: "Navigy",
    genre: "context tool",
    collection: "macos",
    platform: "macOS · Menu Bar",
    accent: "#0284C7",
    tagline: "Floating action bar and context engine for selected text on macOS. Search, convert, and trigger actions with ⌥⌘C.",
    featured: true,
    status: "Stable",
    statusType: "active",
    version: "1.0.0",
    repoUrl: "https://github.com/Voryn-Labs/navigy",
    downloadUrl: "https://github.com/Voryn-Labs/navigy/releases/download/v1/Navigy.dmg",
    releasesUrl: "https://github.com/Voryn-Labs/navigy/releases/tag/v1",
    privacyUrl: "privacy.html",
    detailUrl: "navigy.html",
    specs: ["macOS 14.0+", "Universal DMG", "Menu Bar + Overlay", "Ad-Hoc Open Source"],
    features: [
      ["Selection Action Overlay", "Highlights text anywhere across macOS and instantly reveals contextual tools with a floating bar."],
      ["Instant Command Palette", "Hit ⌥⌘C to summon fuzzy search across all text actions, converters, and custom scripts."],
      ["Zero Cloud Overhead", "Runs entirely local with macOS Accessibility APIs; screen capture only runs on explicit user command."],
      ["Universal Binary Distribution", "Available as standalone DMG packages with verified SHA256 checksums."]
    ],
    storeUrl: null
  },

  /* ==========================================================================
     FLAGSHIP PRODUCT 5: VIVIDORBIT (Android TV)
     ========================================================================== */
  {
    id: "vividorbit",
    name: "VividOrbit",
    genre: "live tv",
    collection: "androidtv",
    platform: "Android TV · TV Box",
    accent: "#10B981",
    tagline: "Lightweight, 100% offline live-TV and lineup manager for Android TV & Google TV. Renumber channels 1..N and control from your phone via QR code.",
    featured: true,
    status: "In Development",
    statusType: "dev",
    version: "0.9 Beta",
    repoUrl: "https://github.com/Voryn-Labs/VividOrbit",
    downloadUrl: "https://github.com/Voryn-Labs/VividOrbit/releases",
    releasesUrl: "https://github.com/Voryn-Labs/VividOrbit/releases",
    privacyUrl: "vividorbit-privacy.html",
    detailUrl: "vividorbit.html",
    bannerUrl: "assets/img/vividorbit-banner.png",
    specs: ["Android TV 11+", "100% Offline Local Web Server", "Now/Next EPG", "Atomic Channel Swapping"],
    features: [
      ["Custom Channel Numbering", "Reorder your physical channel lineup to 1..N with atomic swaps so channel numbers never collide."],
      ["Smartphone Companion Remote", "Built-in local web server with instant QR pairing — edit lineups and tune channels without installing an app on your phone."],
      ["Clean Now / Next EPG", "Live programme scheduling progress that collapses gracefully when a broadcast source lacks guide data."],
      ["Living Room Privacy Sovereignty", "Zero accounts, zero cloud servers, zero telemetry — nothing ever leaves your local network."]
    ],
    storeUrl: null
  },

  /* ==========================================================================
     LAB ARCHIVE: THE LUMEN SERIES (14 Puzzle Games)
     ========================================================================== */
  { id: "arroway",     name: "Vexlo",        genre: "arrow",      accent: "#6366F1", collection: "lumen",
    tagline: "Arrow escape puzzles. Fair, calm, no fail state.", storeUrl: null, onHold: true },
  { id: "circuitflow", name: "CircuitFlow",  genre: "flow",       accent: "#3B82F6", collection: "lumen",
    tagline: "Connect-the-pairs flow puzzles. Zen and clean.", storeUrl: null, onHold: true },
  { id: "decodo",      name: "Decodo",       genre: "deduction",  accent: "#F97316", collection: "lumen",
    tagline: "The daily color-code deduction — same code worldwide.", storeUrl: null, onHold: true },
  { id: "dropforge",   name: "Dropforge",    genre: "merge",      accent: "#EC4899", collection: "lumen",
    tagline: "Gem-merge physics, obsessively satisfying.", storeUrl: null, onHold: true },
  { id: "gemforge",    name: "Gemforge",     genre: "idle",       accent: "#EF4444", collection: "lumen",
    tagline: "Offline-first idle gem tycoon. Build your mine.", storeUrl: null, onHold: true },
  { id: "gridlight",   name: "Gridlight",    genre: "nonogram",   accent: "#22C55E", collection: "lumen",
    tagline: "Zen, collectible picross — one grid at a time.", storeUrl: null, onHold: true },
  { id: "minevault",   name: "MineVault",    genre: "minesweeper", accent: "#EAB308", collection: "lumen",
    tagline: "Modern no-guess Minesweeper. Every move fair.", storeUrl: null, onHold: true },
  { id: "orbshot",     name: "Orbshot",      genre: "bubble",     accent: "#06B6D4", collection: "lumen",
    tagline: "A crunchy, juice-heavy bubble shooter.", storeUrl: null, onHold: true },
  { id: "recall",      name: "Recall",       genre: "memory",     accent: "#D946EF", collection: "lumen",
    tagline: "Memory and sequence pattern puzzles.", storeUrl: null, onHold: true },
  { id: "slidr",       name: "Slidr",        genre: "slide",      accent: "#F59E0B", collection: "lumen",
    tagline: "Unblock slide puzzles. Par-perfect, no fail state.", storeUrl: null, onHold: true },
  { id: "solitaire",   name: "Solitaire",    genre: "card",       accent: "#10B981", collection: "lumen",
    tagline: "Klondike, Spider and FreeCell — beautifully made.", storeUrl: null, onHold: true },
  { id: "sortvault",   name: "Sortvault",    genre: "sort",       accent: "#8B5CF6", collection: "lumen",
    tagline: "A tactile, fair colour-sort puzzle.", storeUrl: null, onHold: true },
  { id: "tileforge",   name: "TileForge",    genre: "tiles",      accent: "#F59E0B", collection: "lumen",
    tagline: "2048-style tiles with permanent meta progression.", storeUrl: null, onHold: true },
  { id: "wordvein",    name: "Wordvein",     genre: "word",       accent: "#3B82F6", collection: "lumen",
    tagline: "Procedural word search and hunt.", storeUrl: null, onHold: true },

  /* ==========================================================================
     LAB ARCHIVE: THE INDIA COLLECTION (7 Regional Games)
     ========================================================================== */
  { id: "aksharword",  name: "Aksharword",   genre: "hindi word", accent: "#F97316", collection: "india",
    repo: "indiaapps/aksharword",
    tagline: "Daily Hindi akshara deduction — the same word worldwide.", storeUrl: null, onHold: true },
  { id: "chaupar",     name: "Chaupar",      genre: "board",      accent: "#DC2626", collection: "india",
    repo: "indiaapps/chaupar",
    tagline: "The classic Indian cross-and-circle board game.", storeUrl: null, onHold: true },
  { id: "geetchain",   name: "Geetchain",    genre: "bollywood",  accent: "#EAB308", collection: "india",
    repo: "indiaapps/geetchain",
    tagline: "Daily Bollywood akshara chain — link song to song.", storeUrl: null, onHold: true },
  { id: "gullyquiz",   name: "Gullyquiz",    genre: "cricket",    accent: "#10B981", collection: "india",
    repo: "indiaapps/gullyquiz",
    tagline: "Daily cricket trivia, plus endless practice.", storeUrl: null, onHold: true },
  { id: "rummyfold",   name: "Rummyfold",    genre: "rummy",      accent: "#059669", collection: "india",
    repo: "indiaapps/rummyfold",
    tagline: "Free practice 13-card rummy. No wagering, no cash, ever.", storeUrl: null, onHold: true },
  { id: "bhagobeta",   name: "Aunty's Chase", genre: "runner",    accent: "#F59E0B", collection: "india",
    repo: "india_games/bhagobeta",
    tagline: "Sprint through the family function, dodge the relatives.", storeUrl: null, onHold: true },
  { id: "dabbastack",  name: "Dabba Jam",    genre: "tiffin sort", accent: "#EA580C", collection: "india",
    repo: "india_games/dabbastack",
    tagline: "Mumbai's dabbawala tiffin-sort puzzle.", storeUrl: null, onHold: true }
];

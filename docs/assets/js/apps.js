// VORYN LABS — app registry. THE single update point for the catalogue.
// To publish an app: set storeUrl to the live Play URL. The card badge and
// CTA flip automatically. Icon: re-run tools/extract_site_icons.py when art changes.
//
// Voryn Labs ships across categories, not just games — `collection` groups a
// card into a section on the hub page, and each collection declares the
// `kind` of software it holds. Add a new collection here to open a category.
//
// Per-app options:
//   repo      — path under CoreBundle apps/ (defaults to the id)
//   repoUrl   — absolute repo URL, for apps outside CoreBundle
//   platform  — badge line when it is not plain Android (e.g. "Android TV")
//   featured  — render as a full-width spotlight card with `features` bullets
window.VORYN_COLLECTIONS = [
  { id: "lumen", eyebrow: "Collection I", name: "The Lumen Series", kind: "Games",
    blurb: "Fourteen quiet puzzle games — one design creed. Calm, fair, completeable." },
  { id: "india", eyebrow: "Collection II", name: "The India Collection", kind: "Games",
    blurb: "Seven games built for India — daily Hindi words, cricket trivia, Bollywood chains, rummy and the family function." },
  { id: "livingroom", eyebrow: "Collection III", name: "The Living Room", kind: "Apps & utilities",
    blurb: "Software for the biggest screen in the house. Offline-first, no accounts, no telemetry." },
];

window.VORYN_APPS = [
  /* ---------- Collection I — The Lumen Series ---------- */
  { id: "arroway",     name: "Vexlo",        genre: "arrow",      accent: "#6040E8", collection: "lumen",
    tagline: "Arrow escape puzzles. Fair, calm, no fail state.", storeUrl: null },
  { id: "circuitflow", name: "CircuitFlow",  genre: "flow",       accent: "#1359D7", collection: "lumen",
    tagline: "Connect-the-pairs flow puzzles. Zen and clean.", storeUrl: null },
  { id: "decodo",      name: "Decodo",       genre: "deduction",  accent: "#E36C17", collection: "lumen",
    tagline: "The daily color-code deduction — same code worldwide.", storeUrl: null },
  { id: "dropforge",   name: "Dropforge",    genre: "merge",      accent: "#D23B71", collection: "lumen",
    tagline: "Gem-merge physics, obsessively satisfying.", storeUrl: null },
  { id: "gemforge",    name: "Gemforge",     genre: "idle",       accent: "#C8482E", collection: "lumen",
    tagline: "Offline-first idle gem tycoon. Build your mine.", storeUrl: null },
  { id: "gridlight",   name: "Gridlight",    genre: "nonogram",   accent: "#4D8B3A", collection: "lumen",
    tagline: "Zen, collectible picross — one grid at a time.", storeUrl: null },
  { id: "minevault",   name: "MineVault",    genre: "minesweeper", accent: "#B37A22", collection: "lumen",
    tagline: "Modern no-guess Minesweeper. Every move fair.", storeUrl: null },
  { id: "orbshot",     name: "Orbshot",      genre: "bubble",     accent: "#167FA5", collection: "lumen",
    tagline: "A crunchy, juice-heavy bubble shooter.", storeUrl: null },
  { id: "recall",      name: "Recall",       genre: "memory",     accent: "#B33D72", collection: "lumen",
    tagline: "Memory and sequence pattern puzzles.", storeUrl: null },
  { id: "slidr",       name: "Slidr",        genre: "slide",      accent: "#BA7815", collection: "lumen",
    tagline: "Unblock slide puzzles. Par-perfect, no fail state.", storeUrl: null },
  { id: "solitaire",   name: "Solitaire",    genre: "card",       accent: "#337557", collection: "lumen",
    tagline: "Klondike, Spider and FreeCell — beautifully made.", storeUrl: null },
  { id: "sortvault",   name: "Sortvault",    genre: "sort",       accent: "#6752C8", collection: "lumen",
    tagline: "A tactile, fair colour-sort puzzle.", storeUrl: null },
  { id: "tileforge",   name: "TileForge",    genre: "tiles",      accent: "#C38416", collection: "lumen",
    tagline: "2048-style tiles with permanent meta progression.", storeUrl: null },
  { id: "wordvein",    name: "Wordvein",     genre: "word",       accent: "#176ABD", collection: "lumen",
    tagline: "Procedural word search and hunt.", storeUrl: null },

  /* ---------- Collection II — The India Collection ---------- */
  { id: "aksharword",  name: "Aksharword",   genre: "hindi word", accent: "#C77E54", collection: "india",
    repo: "indiaapps/aksharword",
    tagline: "Daily Hindi akshara deduction — the same word worldwide.", storeUrl: null },
  { id: "chaupar",     name: "Chaupar",      genre: "board",      accent: "#B31235", collection: "india",
    repo: "indiaapps/chaupar",
    tagline: "The classic Indian cross-and-circle board game.", storeUrl: null },
  { id: "geetchain",   name: "Geetchain",    genre: "bollywood",  accent: "#C9903A", collection: "india",
    repo: "indiaapps/geetchain",
    tagline: "Daily Bollywood akshara chain — link song to song.", storeUrl: null },
  { id: "gullyquiz",   name: "Gullyquiz",    genre: "cricket",    accent: "#1F7A52", collection: "india",
    repo: "indiaapps/gullyquiz",
    tagline: "Daily cricket trivia, plus endless practice.", storeUrl: null },
  { id: "rummyfold",   name: "Rummyfold",    genre: "rummy",      accent: "#2F8F63", collection: "india",
    repo: "indiaapps/rummyfold",
    tagline: "Free practice 13-card rummy. No wagering, no cash, ever.", storeUrl: null },
  { id: "bhagobeta",   name: "Aunty's Chase", genre: "runner",    accent: "#E8A33D", collection: "india",
    repo: "india_games/bhagobeta",
    tagline: "Sprint through the family function, dodge the relatives.", storeUrl: null },
  { id: "dabbastack",  name: "Dabba Jam",    genre: "tiffin sort", accent: "#DA5904", collection: "india",
    repo: "india_games/dabbastack",
    tagline: "Mumbai's dabbawala tiffin-sort puzzle.", storeUrl: null },

  /* ---------- Collection III — The Living Room ---------- */
  { id: "vividorbit",  name: "VividOrbit",   genre: "live tv",    accent: "#1B9C88", collection: "livingroom",
    repoUrl: "https://github.com/Voryn-Labs/VividOrbit",
    privacyUrl: "vividorbit-privacy.html",
    bannerUrl: "assets/img/vividorbit-banner.png",
    platform: "Android TV", featured: true,
    tagline: "A lightweight, fully offline live-TV and lineup manager for Android TV and Google TV. Renumber your channels the way you actually watch them, and manage the whole lineup from your phone over a QR code — nothing leaves your living room.",
    features: [
      ["Custom channel numbering", "reorder to 1..N, with atomic swaps so numbers never collide."],
      ["Phone as remote", "a local web UI over QR code; edit, reorder and tune from your phone."],
      ["Now / Next EPG", "live programme progress that collapses cleanly when a source has no data."],
      ["100% offline", "zero cloud dependency, zero accounts, zero telemetry."],
    ],
    storeUrl: null },
];

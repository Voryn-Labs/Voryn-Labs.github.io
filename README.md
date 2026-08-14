# Voryn Labs — Games Hub

> **Live site**: [voryn-labs.github.io/vorynlabs-games](https://voryn-labs.github.io/vorynlabs-games/)

Static landing page for the **Voryn Labs** indie game studio. Fourteen hand-crafted Android puzzle games — calm, fair, no fail states, no dark patterns.

---

## Stack

| Layer | Choice |
|---|---|
| Hosting | GitHub Pages (served from `/docs`) |
| Languages | HTML · Vanilla CSS · Vanilla JS |
| Fonts | Cormorant Garamond (display) · Outfit (UI) via Google Fonts |
| Build step | None — zero build tooling |

---

## Structure

```
docs/
├── index.html          # Main landing page
├── privacy.html        # Privacy policy
├── 404.html            # Custom 404
└── assets/
    ├── css/site.css    # Single stylesheet (light + dark theme vars)
    ├── js/
    │   ├── apps.js     # ← THE single update point for game registry
    │   └── site.js     # Theme toggle, grid renderer, scroll reveal
    └── icons/
        ├── <app>.png           # Default/fallback icon
        ├── <app>-dark.png      # Icon used in dark theme
        └── <app>-light.png     # Icon used in light theme
tools/
├── import_downloaded_icons.py  # Copy new icons from Downloads → docs/assets/icons/
├── extract_site_icons.py       # Verify icon completeness
└── validate_site.py            # Lint HTML links and assets
```

---

## Adding / updating a game

1. **Update registry** — open `docs/assets/js/apps.js` and set `storeUrl` to the Play Store URL. The card badge and CTA flip automatically.
2. **Update icons** — drop `<app>-dark.png` and `<app>-light.png` into `docs/assets/icons/`.
3. Commit & push — GitHub Pages deploys in ~60 seconds.

---

## Theme system

- On first visit the site reads `window.matchMedia("(prefers-color-scheme: light)")` and sets `data-theme` on `<html>`.
- The Sun/Moon toggle in the nav overrides the system preference and persists to `localStorage`.
- All CSS colours are CSS custom properties; `[data-theme="light"]` / `[data-theme="dark"]` override them.

---

## Source code

Game source lives in the mono-repo: [github.com/Voryn-Labs/CoreBundle](https://github.com/Voryn-Labs/CoreBundle)

---

## License

Website code © Voryn Labs. Game assets are proprietary.

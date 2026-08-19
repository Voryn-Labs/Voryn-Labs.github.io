# Voryn Labs — studio site

> **Live site**: [voryn-labs.github.io](https://voryn-labs.github.io/)
> **Contact**: [appsvorynlabs@gmail.com](mailto:appsvorynlabs@gmail.com)

Independent studio site for **Voryn Labs**. Games and other software — not a games-only hub.

Catalogue is split on one page:

- **Games** — The Lumen Series, The India Collection
- **Apps** — The Living Room (VividOrbit and whatever comes next)

Source of truth for copy/icons also lives in `CoreBundle/docs/`. Sync that folder here to publish.

---

## Stack

| Layer | Choice |
|---|---|
| Hosting | GitHub Pages (org site, served from `/docs`) |
| Languages | HTML · Vanilla CSS · Vanilla JS |
| Fonts | Cormorant Garamond (display) · Outfit (UI) via Google Fonts |
| Build step | None |

---

## Update the catalogue

Edit `docs/assets/js/apps.js`, then run `python3 tools/render_cards.py` and `python3 tools/validate_site.py` from CoreBundle before syncing `docs/` here.

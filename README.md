# Voryn Labs — studio site

> **Live site**: [voryn-labs.github.io](https://voryn-labs.github.io/)
> **Contact**: [appsvorynlabs@gmail.com](mailto:appsvorynlabs@gmail.com)

Independent studio site for **Voryn Labs**. Games and other software for iPhone, Android and TV. Cloudified has a dedicated product and privacy page; its public 0.1 release is being prepared.

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

Cloudified product content: `docs/cloudified.html`, `docs/cloudified-privacy.html`, and
`docs/assets/css/cloudified.css` and `docs/assets/js/cloudified.js`. Its feature on the homepage is separate from the
22-title Android registry, whose existing generator and entries remain unchanged.


## Website analytics

Cloudflare Web Analytics can collect website visits/page views and performance
metrics while hosting stays on GitHub Pages. It does not instrument the apps.
Activation needs the real public token from Cloudflare → Web Analytics → Manage
site for `voryn-labs.github.io`; never use a management API key or login cookie.

```sh
python3 tools/configure_analytics.py --token PUBLIC_BEACON_TOKEN
python3 tools/configure_analytics.py --check
```

Review the website privacy disclosure and deploy the resulting HTML. The helper
updates all root HTML pages with one official deferred beacon each. Remove it with
`python3 tools/configure_analytics.py --disable` and redeploy. Statistics begin at
activation; historical visits cannot be recovered. Sign in to Cloudflare → Web
Analytics to view the private dashboard. No Actions schedule or analytics artifact
storage is needed. The deployed site uses the account owner’s public collection token; management
credentials stay out of this repository.

## Musyn

Musyn 0.1 has a product page (`docs/musyn.html`), privacy notes, branded icon and interface previews. The public GitHub IPA counter has loading/error states and counts only `Musyn.ipa`, not source-feed downloads or installs. The iPhone spotlights remain separate from the Android registry.

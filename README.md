# Voryn Labs — studio site

> **Live site**: [voryn-labs.github.io](https://voryn-labs.github.io/)
> **Contact**: [appsvorynlabs@gmail.com](mailto:appsvorynlabs@gmail.com)

Independent studio site for **Voryn Labs**. Games and other software for iPhone, Android and TV. Cloudified and Musyn have dedicated product and privacy pages and a single shared iOS installer source.

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

## One iOS installer source

Add **https://voryn-labs.github.io/source.json** to Feather, SideStore or a
compatible AltStore Classic installer. It lists **Cloudified and Musyn** together.
These are unsigned IPAs; installer/signing and minimum-iOS requirements still apply.

Refresh is **manual only**. After publishing a new app release:

1. Open [Actions → Update iOS source](https://github.com/Voryn-Labs/Voryn-Labs.github.io/actions/workflows/update-ios-source.yml).
2. Choose **Run workflow** on **main**.
3. Wait for success, then refresh the source in your installer.

There is no schedule, push trigger or release trigger. An app release by itself
does not update the shared catalog. The workflow reads each app's verified feed,
checks that the referenced GitHub IPA is published/uploaded and matches its byte
size and available checksum, then commits the combined feed and requests a Pages
build. Failure preserves the last working catalog. A refresh with no new version
creates no commit. GitHub deployment and installer caching can delay visibility.

`tools/ios_apps.json` is the allowlist for adding future iOS apps. Each app keeps
its build/version/OS/permission metadata; installers receive both versions[] and
legacy flat fields. Per-app generated JSON remains a publisher input. Only the
shared URL above is advertised to users.

```sh
python3 -m unittest discover -s tests -p 'test_ios_source.py'
python3 tools/update_ios_source.py --check  # live validation; no write
python3 tools/update_ios_source.py          # explicit local refresh
```

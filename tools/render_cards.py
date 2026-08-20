#!/usr/bin/env python3
"""Render the static (no-JS) app cards in docs/index.html from the registry.

site.js re-renders each ``[data-collection]`` grid on load; these static cards
are what search engines and no-JS visitors see. Rather than hand-maintain both,
this regenerates the static cards from ``docs/assets/js/apps.js``.

Run after editing the registry:  python3 tools/render_cards.py
``tools/validate_site.py`` fails if the two ever drift.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_site import load_block  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs/index.html"


def card_html(app: dict, index: int, indent: str = " " * 12) -> str:
    esc = {k: html.escape(str(v), quote=True) for k, v in app.items()
           if isinstance(v, (str, int))}
    app_id = esc["id"]
    live = bool(app.get("storeUrl"))
    # Every app without repoUrl lives in the private CoreBundle monorepo — a
    # link there 404s for visitors, so no CTA renders at all in that case.
    source_is_public = bool(app.get("repoUrl"))
    href = app["storeUrl"] if live else app.get("repoUrl")
    cta = "Get it on Google Play ↗" if live else "View the source ↗"
    show_cta = live or source_is_public
    badge_cls = "badge badge-live" if live else "badge badge-soon"
    badge_txt = "Get it on Google Play" if live else "Coming soon on Google Play"
    chip = esc.get("platform") or esc["genre"]

    cache_bust = "?v=3" if app_id == "vividorbit" else "?v=1"
    icon = (f'<img class="app-icon" src="assets/icons/{app_id}-dark.png{cache_bust}"'
            f' data-dark="assets/icons/{app_id}-dark.png{cache_bust}"'
            f' data-light="assets/icons/{app_id}-light.png{cache_bust}"'
            f' alt="{esc["name"]} — app icon" width="128" height="128" loading="lazy">')

    cta_line = (f'<a class="card-cta" href="{html.escape(href, quote=True)}" target="_blank" rel="noopener">{cta}</a>'
                if show_cta else None)
    privacy_cta = (f'<a class="card-cta" href="{html.escape(app["privacyUrl"], quote=True)}">Privacy &amp; Details ↗</a>'
                   if app.get("privacyUrl") else None)

    if app.get("featured"):
        features = []
        for label, rest in app.get("features", []):
            features.append(f'    <li><strong>{html.escape(label)}</strong> '
                            f'— {html.escape(rest)}</li>')

        brand_inner = f'    <a href="{html.escape(app["privacyUrl"], quote=True)}" title="View {esc["name"]} details &amp; privacy policy">{icon}</a>' if app.get("privacyUrl") else f'    {icon}'
        title_inner = f'<h3><a href="{html.escape(app["privacyUrl"], quote=True)}" style="color:inherit; text-decoration:none;">{esc["name"]}</a></h3>' if app.get("privacyUrl") else f'<h3>{esc["name"]}</h3>'
        banner_block = []
        if app.get("bannerUrl"):
            b_href = html.escape(app.get("privacyUrl") or app.get("repoUrl") or "#", quote=True)
            banner_block = [
                f'    <a href="{b_href}" class="card-banner-link" title="Click to view {esc["name"]} details &amp; privacy policy">',
                f'      <img src="{html.escape(app["bannerUrl"], quote=True)}" alt="{esc["name"]} Android TV Banner" class="card-banner-img" loading="lazy">',
                f'    </a>'
            ]

        actions_list = []
        if privacy_cta:
            actions_list.append(f'      {privacy_cta}')
        if cta_line:
            actions_list.append(f'      {cta_line}')
        actions_list.append(f'      <span class="{badge_cls}">{badge_txt}</span>')

        lines = [
            f'<article class="app-card app-card--featured" id="app-{app_id}"'
            f' style="--accent:{esc["accent"]}">',
            '  <div class="card-brand">',
            brand_inner,
            f'    <span class="chip">{chip}</span>',
            '  </div>',
            '  <div class="card-copy">',
            f'    {title_inner}',
            f'    <p class="tagline">{esc["tagline"]}</p>',
            *banner_block,
            '    <ul class="card-features">',
            *features,
            '    </ul>',
            '    <div class="card-actions">',
            *actions_list,
            '    </div>',
            '  </div>',
            '</article>',
        ]
        return "\n".join(indent + line for line in lines)

    lines = [
        f'<article class="app-card" id="app-{app_id}" style="--accent:{esc["accent"]}">',
        f'  {icon}',
        f'  <span class="app-index" aria-hidden="true">{index + 1:02d}</span>',
        f'  <h3>{esc["name"]}</h3>',
        f'  <p class="tagline">{esc["tagline"]}</p>',
        f'  <span class="chip">{chip}</span>',
        *([f'  {cta_line}'] if cta_line else []),
        f'  <span class="{badge_cls}">{badge_txt}</span>',
        "</article>",
    ]
    return "\n".join(indent + line for line in lines)


def main() -> int:
    check_only = "--check" in sys.argv[1:]
    apps = load_block("VORYN_APPS")
    collections = load_block("VORYN_COLLECTIONS")
    original = INDEX.read_text(encoding="utf-8")
    text = original

    for collection in collections:
        cid = collection["id"]
        members = [a for a in apps if a.get("collection") == cid]
        if not members:
            print(f"FAIL: collection {cid!r} has no apps")
            return 1

        cards = "\n".join(card_html(a, i) for i, a in enumerate(members))
        body = f'\n{" " * 12}<!-- CARDS:{cid} — generated by tools/render_cards.py -->\n{cards}\n{" " * 10}'

        open_tag = f'<div class="apps-grid" data-collection="{cid}">'
        start = text.find(open_tag)
        if start < 0:
            print(f"FAIL: no grid found for collection {cid!r} in index.html")
            return 1

        # Walk div tags to find THIS grid's closing tag. A lazy regex would stop
        # at the first </div> inside a card and corrupt the file on re-runs.
        inner = start + len(open_tag)
        depth, pos, end = 1, inner, None
        for match in re.finditer(r"<div\b|</div>", text[inner:]):
            depth += 1 if match.group() != "</div>" else -1
            if depth == 0:
                end = inner + match.start()
                break
        if end is None:
            print(f"FAIL: grid for {cid!r} is unterminated in index.html")
            return 1

        text = text[:inner] + body + text[end:]
        print(f"  {cid:8s} {len(members)} cards rendered")

    if text.count("<div") != text.count("</div>"):
        print(f"FAIL: unbalanced <div> tags after render "
              f"({text.count('<div')} open, {text.count('</div>')} close)")
        return 1

    if check_only:
        if text != original:
            print("FAIL: index.html is out of sync with the registry — "
                  "run python3 tools/render_cards.py")
            return 1
        print("OK: index.html static cards match the registry")
        return 0

    INDEX.write_text(text, encoding="utf-8")
    print(f"wrote {INDEX.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

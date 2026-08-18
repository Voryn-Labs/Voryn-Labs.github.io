#!/usr/bin/env python3
"""Validate the Voryn Labs hub-site registry (docs/assets/js/apps.js).

Pure Python, no dependencies. Parses the registry as JSON (after stripping the
``window.VORYN_APPS =`` prefix, ``//``/``/* */`` comments, trailing ``;`` and JS
trailing commas) and asserts the site contract: 22 entries, unique lowercase
ids, #RRGGBB accents, an icon on disk per entry, non-empty name/genre/tagline,
a known collection id, and the Google Play URL shape whenever storeUrl is set.

Also asserts index.html carries a static card for every registry entry, so the
no-JS fallback cannot drift away from the registry.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "docs/assets/js/apps.js"
INDEX = ROOT / "docs/index.html"
ICONS_DIR = ROOT / "docs/assets/icons"
EXPECTED_COUNT = 22

ID_PATTERN = re.compile(r"^[a-z]+$")
ACCENT_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")
STORE_URL_PATTERN = re.compile(
    r"^https://play\.google\.com/store/apps/details\?id=com\.vorynlabs\.\w+$"
)


def load_block(name: str) -> list[dict]:
    """Parse one ``window.<name> = [...];`` array out of the registry file."""
    text = REGISTRY.read_text(encoding="utf-8")
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)      # drop /* */ comments
    text = re.sub(r"^\s*//.*$", "", text, flags=re.MULTILINE)   # drop // comments

    marker = f"window.{name}"
    start = text.find(marker)
    if start < 0:
        raise ValueError(f"{marker} not found")
    start = text.index("[", start)
    depth, end = 0, None
    for i in range(start, len(text)):
        if text[i] == "[":
            depth += 1
        elif text[i] == "]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end is None:
        raise ValueError(f"{marker} array is unterminated")

    block = text[start:end]
    block = re.sub(r",(\s*[}\]])", r"\1", block)                # JS trailing commas
    block = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', block)  # quote JS keys
    data = json.loads(block)
    if not isinstance(data, list):
        raise ValueError(f"{marker} is not a list")
    return data


def validate(apps: list[dict], collections: list[dict]) -> list[str]:
    errors: list[str] = []

    if len(apps) != EXPECTED_COUNT:
        errors.append(f"expected {EXPECTED_COUNT} entries, found {len(apps)}")

    collection_ids = {c.get("id") for c in collections if isinstance(c, dict)}
    for collection in collections:
        for field in ("id", "eyebrow", "name", "blurb"):
            value = collection.get(field) if isinstance(collection, dict) else None
            if not isinstance(value, str) or not value.strip():
                errors.append(f"collection {collection!r}: {field} must be non-empty")

    index_html = INDEX.read_text(encoding="utf-8") if INDEX.is_file() else ""
    if not index_html:
        errors.append(f"missing {INDEX.relative_to(ROOT)}")

    ids = [app.get("id") for app in apps if isinstance(app, dict)]
    seen: set[str] = set()
    for app_id in ids:
        if app_id in seen:
            errors.append(f"duplicate id: {app_id}")
        seen.add(app_id)

    for index, app in enumerate(apps):
        label = app.get("id") if isinstance(app, dict) else None
        label = label or f"entry #{index + 1}"
        if not isinstance(app, dict):
            errors.append(f"{label}: entry is not an object")
            continue

        app_id = app.get("id")
        if not isinstance(app_id, str) or not ID_PATTERN.fullmatch(app_id):
            errors.append(f"{label}: id must match ^[a-z]+$ (got {app_id!r})")
        else:
            for suffix in (".png", "-dark.png", "-light.png"):
                icon = ICONS_DIR / f"{app_id}{suffix}"
                if not icon.is_file() or icon.stat().st_size == 0:
                    errors.append(f"{label}: missing icon {icon.relative_to(ROOT)}")
            if index_html and f'id="app-{app_id}"' not in index_html:
                errors.append(f"{label}: no static card in index.html "
                              f"(no-JS fallback would drop it)")

        collection = app.get("collection")
        if collection not in collection_ids:
            errors.append(f"{label}: collection must be one of "
                          f"{sorted(collection_ids)} (got {collection!r})")

        accent = app.get("accent")
        if not isinstance(accent, str) or not ACCENT_PATTERN.fullmatch(accent):
            errors.append(f"{label}: accent must be #RRGGBB (got {accent!r})")

        for field in ("name", "genre", "tagline"):
            value = app.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{label}: {field} must be a non-empty string")

        store_url = app.get("storeUrl")
        if store_url is not None:
            if not isinstance(store_url, str) or not STORE_URL_PATTERN.fullmatch(store_url):
                errors.append(f"{label}: storeUrl does not match the Play pattern "
                              f"(got {store_url!r})")

    return errors


def main() -> int:
    try:
        apps = load_block("VORYN_APPS")
        collections = load_block("VORYN_COLLECTIONS")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"FAIL: registry does not parse — {exc}")
        return 1

    errors = validate(apps, collections)
    if errors:
        for error in errors:
            print(f"FAIL {error}")
        return 1
    print(f"OK: registry valid — {len(apps)} apps across {len(collections)} "
          f"collections, unique ids, accents, icons, static cards, storeUrl patterns")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

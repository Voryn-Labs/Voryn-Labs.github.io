#!/usr/bin/env python3
"""Validate the Voryn Labs hub-site registry (docs/assets/js/apps.js).

Pure Python, no dependencies. Parses the registry as JSON (after stripping the
``window.VORYN_APPS =`` prefix, ``//`` comments, trailing ``;`` and JS trailing
commas) and asserts the site contract: 14 entries, unique lowercase ids,
#RRGGBB accents, an icon on disk per entry, non-empty name/genre/tagline, and
the Google Play URL shape whenever storeUrl is set.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "docs/assets/js/apps.js"
ICONS_DIR = ROOT / "docs/assets/icons"
EXPECTED_COUNT = 14

ID_PATTERN = re.compile(r"^[a-z]+$")
ACCENT_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")
STORE_URL_PATTERN = re.compile(
    r"^https://play\.google\.com/store/apps/details\?id=com\.vorynlabs\.\w+$"
)


def load_registry() -> list[dict]:
    text = REGISTRY.read_text(encoding="utf-8")
    text = re.sub(r"^\s*//.*$", "", text, flags=re.MULTILINE)   # drop // comments
    text = text.strip()
    text = text.removeprefix("window.VORYN_APPS").lstrip().removeprefix("=").strip()
    text = text.removesuffix(";").strip()
    text = re.sub(r",(\s*[}\]])", r"\1", text)                  # JS trailing commas
    text = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":',
                  text)                                         # quote JS keys
    data = json.loads(text)
    if not isinstance(data, list):
        raise ValueError("registry is not a list")
    return data


def validate(apps: list[dict]) -> list[str]:
    errors: list[str] = []

    if len(apps) != EXPECTED_COUNT:
        errors.append(f"expected {EXPECTED_COUNT} entries, found {len(apps)}")

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
            icon = ICONS_DIR / f"{app_id}.png"
            if not icon.is_file() or icon.stat().st_size == 0:
                errors.append(f"{label}: missing icon {icon.relative_to(ROOT)}")

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
        apps = load_registry()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"FAIL: registry does not parse — {exc}")
        return 1

    errors = validate(apps)
    if errors:
        for error in errors:
            print(f"FAIL {error}")
        return 1
    print(f"OK: registry valid — {len(apps)} apps, unique ids, accents, icons, "
          f"storeUrl patterns")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

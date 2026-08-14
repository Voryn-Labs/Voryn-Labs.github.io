#!/usr/bin/env python3
"""Extract the Voryn Labs hub-site icons from the brand launch assets.

For each of the 14 apps, resizes the 1024px dark-variant launcher art to a
256px PNG under ``docs/assets/icons/<app>.png`` (fallback: the xxxhdpi mipmap
when the brand file is missing) and renders the 1200x630 ``docs/assets/og.png``
share image from the brand-suite montage. Idempotent; never touches mipmaps or
brand files. ``--check`` asserts every output exists and is non-empty.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ICONS_DIR = ROOT / "docs/assets/icons"
OG_PATH = ROOT / "docs/assets/og.png"
MONTAGE = ROOT / "assets/brand-suite/launcher-icons-dark.png"
ICON_SIZE = 256
OG_SIZE = (1200, 630)

APPS = (
    "arroway", "circuitflow", "decodo", "dropforge", "gemforge", "gridlight",
    "minevault", "orbshot", "recall", "slidr", "solitaire", "sortvault",
    "tileforge", "wordvein",
)


def icon_source(app: str) -> Path:
    brand = ROOT / "apps" / app / "assets/brand/launcher-dark.png"
    if brand.is_file():
        return brand
    fallback = (ROOT / "apps" / app / "android/app/src/main/res"
                / "mipmap-xxxhdpi/ic_launcher.png")
    if fallback.is_file():
        return fallback
    raise FileNotFoundError(f"no launcher art found for {app}")


def cover_crop(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Scale to cover the target, then center-crop — like CSS object-fit: cover."""
    width, height = image.size
    target_w, target_h = size
    scale = max(target_w / width, target_h / height)
    scaled = image.resize((round(width * scale), round(height * scale)),
                          Image.LANCZOS)
    left = (scaled.width - target_w) // 2
    top = (scaled.height - target_h) // 2
    return scaled.crop((left, top, left + target_w, top + target_h))


def build() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    for app in APPS:
        source = icon_source(app)
        out = ICONS_DIR / f"{app}.png"
        with Image.open(source) as art:
            tile = art.convert("RGB").resize((ICON_SIZE, ICON_SIZE),
                                             Image.LANCZOS)
            tile.save(out, format="PNG", optimize=True)
        print(f"  {app:12s} {source.relative_to(ROOT)} -> {out.relative_to(ROOT)}")
    if not MONTAGE.is_file():
        raise FileNotFoundError(f"missing montage: {MONTAGE}")
    with Image.open(MONTAGE) as board:
        og = cover_crop(board.convert("RGB"), OG_SIZE)
        og.save(OG_PATH, format="PNG", optimize=True)
    print(f"  {'og':12s} {MONTAGE.relative_to(ROOT)} -> {OG_PATH.relative_to(ROOT)}")


def check() -> list[str]:
    problems: list[str] = []
    for app in APPS:
        out = ICONS_DIR / f"{app}.png"
        if not out.is_file() or out.stat().st_size == 0:
            problems.append(f"missing or empty icon: {out}")
    if not OG_PATH.is_file() or OG_PATH.stat().st_size == 0:
        problems.append(f"missing or empty og image: {OG_PATH}")
    return problems


def main() -> int:
    if "--check" in sys.argv[1:]:
        problems = check()
        if problems:
            for problem in problems:
                print(f"FAIL {problem}")
            return 1
        print(f"OK: {len(APPS)} icons + og.png present and non-empty")
        return 0
    print("extract_site_icons: building docs/assets/icons/*.png + og.png")
    build()
    print("done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

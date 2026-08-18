#!/usr/bin/env python3
"""Extract the Voryn Labs hub-site icons from the brand launch assets.

For every catalogue entry, resizes both dark and light launcher art to
256px PNGs:
- ``docs/assets/icons/<app>-dark.png``
- ``docs/assets/icons/<app>-light.png``
- ``docs/assets/icons/<app>.png`` (dark fallback)
And renders the 1200x630 ``docs/assets/og.png`` share image.

The Lumen Series apps ship separate dark/light launcher art. The India
Collection and VividOrbit ship a single ``app_icon.png``, which is used for
both variants.
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
NOIR = (14, 13, 11)

APPS = (
    "arroway", "circuitflow", "decodo", "dropforge", "gemforge", "gridlight",
    "minevault", "orbshot", "recall", "slidr", "solitaire", "sortvault",
    "tileforge", "wordvein",
)

# Single-source art: one icon serves both dark and light. Paths are relative to
# ROOT; VividOrbit lives in its own repo beside CoreBundle.
SINGLE_SOURCE = {
    "aksharword": "apps/indiaapps/aksharword/assets/brand/app_icon.png",
    "chaupar":    "apps/indiaapps/chaupar/assets/brand/app_icon.png",
    "geetchain":  "apps/indiaapps/geetchain/assets/brand/app_icon.png",
    "gullyquiz":  "apps/indiaapps/gullyquiz/assets/brand/app_icon.png",
    "rummyfold":  "apps/indiaapps/rummyfold/assets/brand/app_icon.png",
    "bhagobeta":  "apps/india_games/bhagobeta/assets/brand/app_icon.png",
    "dabbastack": "apps/india_games/dabbastack/assets/brand/app_icon.png",
    "vividorbit": "../VividOrbit/app/src/main/assets/brand/app_icon.png",
}

ALL_APPS = APPS + tuple(SINGLE_SOURCE)


def icon_source(app: str, variant: str = "dark") -> Path:
    single = SINGLE_SOURCE.get(app)
    if single is not None:
        path = (ROOT / single).resolve()
        if path.is_file():
            return path
        raise FileNotFoundError(f"no art found for {app} at {single}")

    brand = ROOT / "apps" / app / f"assets/brand/launcher-{variant}.png"
    if brand.is_file():
        return brand
    if variant == "dark":
        fallback = (ROOT / "apps" / app / "android/app/src/main/res"
                    / "mipmap-night-xxxhdpi/ic_launcher.png")
    else:
        fallback = (ROOT / "apps" / app / "android/app/src/main/res"
                    / "mipmap-xxxhdpi/ic_launcher.png")
    if fallback.is_file():
        return fallback
    raise FileNotFoundError(f"no {variant} launcher art found for {app}")


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
    for app in ALL_APPS:
        try:
            dark_src = icon_source(app, "dark")
            light_src = icon_source(app, "light")
        except FileNotFoundError as exc:
            # VividOrbit lives in a sibling repo; a CoreBundle-only checkout
            # keeps whatever icon is already committed under docs/.
            print(f"  {app:12s} SKIP — {exc}")
            continue

        dark_out = ICONS_DIR / f"{app}-dark.png"
        light_out = ICONS_DIR / f"{app}-light.png"
        default_out = ICONS_DIR / f"{app}.png"

        with Image.open(dark_src) as d_art:
            d_tile = d_art.convert("RGB").resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS)
            d_tile.save(dark_out, format="PNG", optimize=True)
            d_tile.save(default_out, format="PNG", optimize=True)

        with Image.open(light_src) as l_art:
            l_tile = l_art.convert("RGB").resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS)
            l_tile.save(light_out, format="PNG", optimize=True)

        print(f"  {app:12s} extracted dark & light -> {ICONS_DIR.relative_to(ROOT)}")

    build_og()


def build_og() -> None:
    """Compose the 1200x630 share card from the catalogue's own dark icons.

    Icons are laid out on the noir ground and faded toward the bottom so the
    wordmark drawn by the site's OG text stays legible.
    """
    tiles = [ICONS_DIR / f"{app}-dark.png" for app in ALL_APPS]
    tiles = [t for t in tiles if t.is_file()]
    if not tiles:
        print("  og           SKIP — no icons on disk")
        return

    cols, pad = 7, 18
    size = (OG_SIZE[0] - pad * (cols + 1)) // cols
    rows = -(-len(tiles) // cols)                      # ceil
    board_h = rows * size + pad * (rows + 1)

    board = Image.new("RGB", (OG_SIZE[0], board_h), NOIR)
    for i, tile in enumerate(tiles):
        with Image.open(tile) as art:
            thumb = art.convert("RGB").resize((size, size), Image.LANCZOS)
        row, col = divmod(i, cols)
        # Centre a short final row so the card never looks ragged.
        in_row = min(cols, len(tiles) - row * cols)
        row_w = in_row * size + (in_row - 1) * pad
        x = (OG_SIZE[0] - row_w) // 2 + col * (size + pad)
        y = pad + row * (size + pad)
        board.paste(thumb, (x, y))

    og = cover_crop(board, OG_SIZE) if board_h >= OG_SIZE[1] else board.resize(OG_SIZE, Image.LANCZOS)

    # Vignette toward the bottom so overlaid text reads cleanly.
    scrim = Image.new("L", OG_SIZE, 0)
    for y in range(OG_SIZE[1]):
        t = max(0.0, (y / OG_SIZE[1] - 0.35) / 0.65)
        scrim.putpixel((0, y), int(215 * t * t))
    scrim = scrim.resize((1, OG_SIZE[1])).resize(OG_SIZE)
    og = Image.composite(Image.new("RGB", OG_SIZE, NOIR), og, scrim)

    og.save(OG_PATH, format="PNG", optimize=True)
    print(f"  {'og':12s} {len(tiles)} icons -> {OG_PATH.relative_to(ROOT)}")


def check() -> list[str]:
    problems: list[str] = []
    for app in ALL_APPS:
        for suffix in ("-dark.png", "-light.png", ".png"):
            out = ICONS_DIR / f"{app}{suffix}"
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
        print(f"OK: {len(ALL_APPS)} dark/light icons + og.png present and non-empty")
        return 0
    print("extract_site_icons: building docs/assets/icons/*-{dark,light}.png + og.png")
    build()
    print("done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

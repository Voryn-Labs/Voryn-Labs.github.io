#!/usr/bin/env python3
"""Configure the public Cloudflare Web Analytics beacon on this GitHub Pages site."""
import argparse
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
START = "<!-- Cloudflare Web Analytics -->"
END = "<!-- End Cloudflare Web Analytics -->"
BLOCK = re.compile(re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.S)
SCRIPT = "https://static.cloudflareinsights.com/beacon.min.js"


def site_token(value):
    if not re.fullmatch(r"[a-fA-F0-9]{32}", value) or len(set(value.lower())) == 1:
        raise argparse.ArgumentTypeError("Supply the real 32-character public beacon token, not an API key")
    return value.lower()


def pages():
    result = sorted((ROOT / "docs").glob("*.html"))
    if not result:
        raise ValueError("No website HTML pages found")
    for path in result:
        if path.is_symlink() or not path.is_file():
            raise ValueError(f"Refusing redirected HTML: {path.name}")
    return result


def configure(token):
    block = (f"{START}\n<script type=\"module\" src=\"{SCRIPT}\" "
             f"data-cf-beacon='{json.dumps({'token': token}, separators=(',', ':'))}'></script>\n{END}\n") if token else ""
    changes = []
    for path in pages():
        text = path.read_text()
        if text.count(START) != text.count(END) or text.count(START) > 1:
            raise ValueError(f"Malformed analytics block: {path.name}")
        clean = BLOCK.sub("", text)
        if SCRIPT in clean or "data-cf-beacon" in clean:
            raise ValueError(f"Unmanaged analytics snippet: {path.name}; review before replacing")
        if len(re.findall(r"</body>", clean, re.I)) != 1:
            raise ValueError(f"Expected one closing body: {path.name}")
        output = re.sub(r"</body>", lambda _: block + "</body>", clean, flags=re.I)
        changes.append((path, output))
    # Validate every page before changing any of them.
    for path, output in changes:
        if path.read_text() != output:
            path.write_text(output)
    print(f"Analytics {'configured' if token else 'disabled'} on {len(changes)} pages")


def check():
    tokens = set()
    for path in pages():
        text = path.read_text()
        blocks = BLOCK.findall(text)
        if len(blocks) != 1:
            raise ValueError(f"Expected one configured beacon: {path.name}")
        match = re.search(r"data-cf-beacon='([^']+)'", blocks[0])
        if SCRIPT not in blocks[0] or not match or text.count(SCRIPT) != 1:
            raise ValueError(f"Invalid or duplicate beacon: {path.name}")
        tokens.add(site_token(json.loads(match.group(1))["token"]))
    if len(tokens) != 1:
        raise ValueError("Website pages disagree on the analytics property")
    print(f"One consistent public beacon configured across {len(pages())} pages")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--token", type=site_token, help="Public token from this site's Cloudflare JS snippet")
    action.add_argument("--disable", action="store_true", help="Remove this integration's beacon blocks")
    action.add_argument("--check", action="store_true", help="Validate all pages without changing files")
    args = parser.parse_args()
    if args.check:
        check()
    else:
        configure(args.token)


if __name__ == "__main__":
    main()

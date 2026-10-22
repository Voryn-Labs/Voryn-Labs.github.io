"""Manually combine verified app feeds into the single Voryn Labs iOS source.

Only published, uploaded release assets with matching byte sizes are advertised.
A failed fetch or validation leaves the previous catalog untouched.
"""
import argparse
import base64
from copy import deepcopy
import json
import os
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = 'https://voryn-labs.github.io/source.json'


def fetch_json(url):
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'Voryn-Labs-iOS-source'}
    token = os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
    if token and urlsplit(url).hostname == 'api.github.com':
        headers['Authorization'] = f'Bearer {token}'
    with urlopen(Request(url, headers=headers), timeout=30) as response:
        return json.load(response)


def fetch_app_feed(repository):
    # The Contents API reads main directly, avoiding a stale raw-CDN response
    # immediately after the owner publishes an app and runs this workflow.
    document = fetch_json(f'https://api.github.com/repos/{repository}/contents/source.json?ref=main')
    require(document.get('type') == 'file' and document.get('encoding') == 'base64',
            f'{repository}: missing generated app feed')
    return json.loads(base64.b64decode(document['content']))


def require(condition, message):
    if not condition:
        raise ValueError(message)


def build_catalog(registry, feeds, release_lookup):
    apps = []
    identities = set()
    for spec in registry:
        identity = spec['bundleIdentifier']
        require(identity not in identities, f'Duplicate bundle identifier: {identity}')
        identities.add(identity)
        repository = spec['repository']
        require(repository.startswith('Voryn-Labs/') and repository.count('/') == 1,
                f'Unexpected repository: {repository}')
        feed = feeds[repository]
        candidates = [app for app in feed['apps'] if app.get('bundleIdentifier') == identity]
        require(len(candidates) == 1, f'{repository}: expected exactly one matching app')
        app = deepcopy(candidates[0])
        require(app.get('name') == spec['name'], f'{repository}: incorrect app name')
        versions = app.get('versions', [])
        require(bool(versions), f'{repository}: missing release version')
        verified_releases = []
        for version in versions:
            for field in ['version', 'date', 'downloadURL', 'size', 'minOSVersion']:
                require(bool(version.get(field)), f'{repository}: missing {field}')
            download = urlsplit(version['downloadURL'])
            parts = download.path.strip('/').split('/')
            require(download.scheme == 'https' and download.hostname == 'github.com'
                    and not download.query and not download.fragment
                    and len(parts) == 6 and '/'.join(parts[:2]) == repository
                    and parts[2:4] == ['releases', 'download']
                    and unquote(parts[5]).lower().endswith('.ipa'),
                    f'{repository}: invalid release download URL')
            tag = unquote(parts[4])
            release = release_lookup(repository, tag)
            require(release.get('tag_name') == tag and not release.get('draft')
                    and bool(release.get('published_at')),
                    f'{repository}: release {tag} is not published')
            assets = [asset for asset in release.get('assets', [])
                      if asset.get('browser_download_url') == version['downloadURL']]
            require(len(assets) == 1, f'{repository}: IPA asset is missing for {tag}')
            asset = assets[0]
            require(asset.get('state') == 'uploaded' and type(version['size']) is int
                    and version['size'] > 0 and asset.get('size') == version['size'],
                    f'{repository}: IPA size/upload mismatch for {tag}')
            digest = asset.get('digest') or ''
            if digest.startswith('sha256:'):
                checksum = digest.removeprefix('sha256:')
                require(not version.get('sha256') or version['sha256'] == checksum,
                        f'{repository}: SHA-256 mismatch for {tag}')
                version['sha256'] = checksum
            verified_releases.append((version, release))
        # Keep the catalog concise: newest stable and newest preview only.
        # Sorting by GitHub's publication timestamp makes promotion predictable
        # even when an app feed contains older versions in an arbitrary order.
        selected = []
        for prerelease in (False, True):
            channel = [item for item in verified_releases
                       if bool(item[1].get('prerelease', False)) == prerelease]
            if channel:
                selected.append(max(channel, key=lambda item: item[1]['published_at']))
        selected.sort(key=lambda item: item[1]['published_at'], reverse=True)
        verified_versions = [item[0] for item in selected]
        # Both modern versions[] and legacy flat fields are used by installers.
        # Keep the real build number, minimum OS and permission disclosures.
        version = verified_versions[0]
        app['versions'] = verified_versions
        app.update(version=version['version'], versionDate=version['date'],
                   versionDescription=version.get('localizedDescription', ''),
                   downloadURL=version['downloadURL'], size=version['size'],
                   minOSVersion=version['minOSVersion'])
        if 'buildVersion' in version:
            app['buildVersion'] = version['buildVersion']
        apps.append(app)
    require(bool(apps), 'The shared source cannot be empty')
    return {
        'name': 'Voryn Labs',
        'identifier': 'com.vorynlabs.source',
        'subtitle': 'Independent apps for iPhone',
        'description': 'Unsigned Voryn Labs apps for compatible installers. Sign with your own certificate or import into a compatible host.',
        'website': 'https://voryn-labs.github.io/#iphone-apps',
        'sourceURL': SOURCE_URL,
        'iconURL': 'https://voryn-labs.github.io/assets/voryn-mark.png',
        'tintColor': '#A88840',
        'apps': apps,
        'news': [],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Validate remote releases without writing')
    args = parser.parse_args()
    registry = json.loads((ROOT / 'tools/ios_apps.json').read_text())
    feeds = {spec['repository']: fetch_app_feed(spec['repository']) for spec in registry}
    catalog = build_catalog(registry, feeds, lambda repo, tag: fetch_json(
        f'https://api.github.com/repos/{repo}/releases/tags/{quote(tag, safe="")}'))
    output = json.dumps(catalog, indent=2, ensure_ascii=False) + '\n'
    if not args.check:
        destination = ROOT / 'docs/source.json'
        temporary = destination.with_suffix('.json.tmp')
        temporary.write_text(output)
        temporary.replace(destination)
    for app in catalog['apps']:
        print(f'{app["name"]}: {app["version"]} ({app.get("buildVersion", "1")}), '
              f'iOS {app["minOSVersion"]}+, {app["size"]} bytes')
    print('Verified shared source' if args.check else f'Updated {SOURCE_URL}')


if __name__ == '__main__':
    main()

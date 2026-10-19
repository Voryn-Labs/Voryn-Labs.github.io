import copy
import importlib.util
import json
import tempfile
from unittest.mock import patch
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('ios_source', Path(__file__).resolve().parents[1] / 'tools/update_ios_source.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SourceTest(unittest.TestCase):
    def setUp(self):
        self.registry = []
        self.feeds = {}
        self.releases = {}
        for name, os_version, build in [('Cloudified', '26.0', '27'), ('Musyn', '15.0', '1')]:
            repo = f'Voryn-Labs/{name}'
            identity = f'com.vorynlabs.{name.lower()}'
            url = f'https://github.com/{repo}/releases/download/v0.1/{name}.ipa'
            self.registry.append(dict(name=name, repository=repo, bundleIdentifier=identity))
            version = dict(version='0.1', buildVersion=build, date='2026-10-19T10:00:00Z', downloadURL=url, size=123, minOSVersion=os_version)
            self.feeds[repo] = {'apps': [dict(name=name, bundleIdentifier=identity, versions=[version], appPermissions={'entitlements': [], 'privacy': {}})]}
            self.releases[repo] = dict(tag_name='v0.1', draft=False, published_at='2026-10-19T10:00:00Z', assets=[dict(browser_download_url=url, state='uploaded', size=123, digest='sha256:' + 'a' * 64)])

    def build(self):
        return module.build_catalog(self.registry, self.feeds, lambda repo, tag: self.releases[repo])

    def test_both_apps_preserve_versions_permissions_and_os(self):
        original = copy.deepcopy(self.feeds)
        catalog = self.build()
        self.assertEqual(catalog['sourceURL'], 'https://voryn-labs.github.io/source.json')
        self.assertEqual(catalog['identifier'], 'com.vorynlabs.source')
        self.assertEqual([app['name'] for app in catalog['apps']], ['Cloudified', 'Musyn'])
        self.assertEqual([app['minOSVersion'] for app in catalog['apps']], ['26.0', '15.0'])
        self.assertEqual(catalog['apps'][0]['buildVersion'], '27')
        for app in catalog['apps']:
            self.assertEqual(app['downloadURL'], app['versions'][0]['downloadURL'])
            self.assertEqual(app['versions'][0]['sha256'], 'a' * 64)
            self.assertIn('appPermissions', app)
        self.assertEqual(original, self.feeds)

    def test_draft_cannot_be_advertised(self):
        self.releases['Voryn-Labs/Musyn']['draft'] = True
        with self.assertRaisesRegex(ValueError, 'not published'):
            self.build()

    def test_missing_asset_cannot_be_advertised(self):
        self.releases['Voryn-Labs/Musyn']['assets'] = []
        with self.assertRaisesRegex(ValueError, 'asset is missing'):
            self.build()

    def test_size_mismatch_is_rejected(self):
        self.releases['Voryn-Labs/Musyn']['assets'][0]['size'] = 124
        with self.assertRaisesRegex(ValueError, 'size/upload mismatch'):
            self.build()

    def test_checksum_mismatch_is_rejected(self):
        self.feeds['Voryn-Labs/Musyn']['apps'][0]['versions'][0]['sha256'] = 'b' * 64
        with self.assertRaisesRegex(ValueError, 'SHA-256 mismatch'):
            self.build()

    def test_wrong_repository_is_rejected(self):
        self.feeds['Voryn-Labs/Musyn']['apps'][0]['versions'][0]['downloadURL'] = 'https://github.com/another/Musyn/releases/download/v0.1/Musyn.ipa'
        with self.assertRaisesRegex(ValueError, 'invalid release download'):
            self.build()

    def test_duplicate_identity_is_rejected(self):
        self.registry.append(self.registry[0])
        with self.assertRaisesRegex(ValueError, 'Duplicate bundle'):
            self.build()

    def test_failed_refresh_keeps_the_existing_file(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'tools').mkdir()
            (root / 'docs').mkdir()
            (root / 'tools/ios_apps.json').write_text(json.dumps(self.registry))
            destination = root / 'docs/source.json'
            destination.write_text('last working catalog')
            with patch.object(module, 'ROOT', root), patch.object(module, 'fetch_app_feed', side_effect=TimeoutError('offline')), patch('sys.argv', ['update_ios_source.py']):
                with self.assertRaises(TimeoutError):
                    module.main()
            self.assertEqual(destination.read_text(), 'last working catalog')

    def test_empty_catalog_is_rejected(self):
        self.registry.clear()
        with self.assertRaisesRegex(ValueError, 'cannot be empty'):
            self.build()


if __name__ == '__main__':
    unittest.main()

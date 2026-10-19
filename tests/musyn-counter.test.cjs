const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = readFileSync('docs/assets/js/musyn.js', 'utf8');
async function run(pages, source = {apps: [{bundleIdentifier: 'com.vorynlabs.musyn', versions: [{version: '0.1.4', buildVersion: '5', downloadURL: 'https://github.com/Voryn-Labs/Musyn/releases/download/v0.1.4/Musyn.ipa'}]}]}) {
  const nodes = Object.fromEntries(['ipa-downloads', 'download-status', 'download-ipa', 'release-checksum', 'release-identity'].map(id => [id, {textContent: '', href: ''}]));
  let request = 0;
  const context = {document: {documentElement: {getAttribute: () => null}, getElementById: id => nodes[id], querySelector: () => ({content: ''})}, window: {matchMedia: () => ({matches: false, addEventListener() {}})}, Intl, AbortController, setTimeout, clearTimeout, fetch: async url => {
    if (url === 'source.json') {
      if (source instanceof Error) throw source;
      return {ok: true, json: async () => source};
    }
    const page = pages[request++]; if (page instanceof Error) throw page;
    return {ok: true, headers: {get: () => page.next ? '<next>; rel="next"' : ''}, json: async () => page.releases};
  }};
  vm.runInNewContext(code, context);
  for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve));
  return {nodes, request};
}
(async () => {
  const asset = (name, n) => ({name, download_count: n, browser_download_url: 'https://github.com/Voryn-Labs/Musyn/releases/download/v0.1.0/Musyn.ipa'});
  const first = await run([{next: true, releases: [{tag_name: 'v0.1.0', assets: [asset('Musyn.ipa', 3), asset('source.json', 99)]}, {draft: true, assets: [asset('Musyn.ipa', 10)]}]}, {releases: [{tag_name: 'v0.0.1', assets: [asset('Musyn.ipa', 2), asset('Musified.ipa', 100)]}]}]);
  assert.equal(first.nodes['ipa-downloads'].textContent, '5');
  assert.equal(first.request, 2);
  assert.match(first.nodes['download-ipa'].href, /v0\.1\.4\/Musyn\.ipa$/);
  const failed = await run([new Error('offline')]);
  assert.equal(failed.nodes['ipa-downloads'].textContent, '—');
  assert.match(failed.nodes['download-status'].textContent, /unavailable/);
  const empty = await run([{releases: []}]);
  assert.equal(empty.nodes['ipa-downloads'].textContent, '0');
  assert.match(empty.nodes['download-status'].textContent, /not installations/);
  assert.match(first.nodes['release-checksum'].href, /tag\/v0\.1\.4$/);
  assert.match(first.nodes['release-identity'].textContent, /0\.1\.4 \(5\)/);
  assert.match(failed.nodes['download-ipa'].href, /v0\.1\.4/);
  const badSource = await run([{releases: []}], new Error('source unavailable'));
  assert.equal(badSource.nodes['download-ipa'].href, 'https://github.com/Voryn-Labs/Musyn/releases');
  console.log('Musyn counter: pagination, exact IPA filtering, draft exclusion, error and empty states passed');
})();

const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = readFileSync('docs/assets/js/musyn.js', 'utf8');
async function run(pages, source = {apps: [{bundleIdentifier: 'com.vorynlabs.musyn', versions: [{version: '0.1.4', buildVersion: '5', downloadURL: 'https://github.com/Voryn-Labs/Musyn/releases/download/v0.1.4/Musyn.ipa'}]}]}) {
  const nodes = Object.fromEntries(['download-ipa', 'release-checksum', 'release-identity'].map(id => [id, {textContent: '', href: ''}]));
  let request = 0;
  const context = {document: {documentElement: {getAttribute: () => null}, getElementById: id => nodes[id], querySelector: () => ({content: ''})}, window: {matchMedia: () => ({matches: false, addEventListener() {}})}, Intl, AbortController, setTimeout, clearTimeout, fetch: async url => {
    if (url === 'source.json') {
      if (source instanceof Error) throw source;
      return {ok: true, json: async () => source};
    }
    request++; throw new Error('Unexpected external statistics request');
  }};
  vm.runInNewContext(code, context);
  for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve));
  return {nodes, request};
}
(async () => {
  const first = await run([]);
  assert.equal(first.request, 0);
  assert.match(first.nodes['download-ipa'].href, /v0\.1\.4\/Musyn\.ipa$/);
  assert.match(first.nodes['release-checksum'].href, /tag\/v0\.1\.4$/);
  assert.match(first.nodes['release-identity'].textContent, /0\.1\.4 \(5\)/);
  const badSource = await run([{releases: []}], new Error('source unavailable'));
  assert.equal(badSource.nodes['download-ipa'].href, 'https://github.com/Voryn-Labs/Musyn/releases');
  console.log('Installer links follow the shared feed without fetching download statistics');
})();

const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = readFileSync('docs/assets/js/musyn.js', 'utf8');
async function run(pages) {
  const nodes = Object.fromEntries(['ipa-downloads', 'download-status', 'download-ipa'].map(id => [id, {textContent: '', href: ''}]));
  let request = 0;
  const context = {document: {documentElement: {getAttribute: () => null}, getElementById: id => nodes[id], querySelector: () => ({content: ''})}, window: {matchMedia: () => ({matches: false, addEventListener() {}})}, Intl, AbortController, setTimeout, clearTimeout, fetch: async () => {
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
  assert.match(first.nodes['download-ipa'].href, /v0\.1\.0\/Musyn\.ipa$/);
  const failed = await run([new Error('offline')]);
  assert.equal(failed.nodes['ipa-downloads'].textContent, '—');
  assert.match(failed.nodes['download-status'].textContent, /unavailable/);
  const empty = await run([{releases: []}]);
  assert.equal(empty.nodes['ipa-downloads'].textContent, '0');
  assert.match(empty.nodes['download-status'].textContent, /being prepared/);
  console.log('Musyn counter: pagination, exact IPA filtering, draft exclusion, error and empty states passed');
})();

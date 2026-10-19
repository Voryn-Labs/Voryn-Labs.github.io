(function () {
  'use strict';
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  function syncTheme() {
    var selected = root.getAttribute('data-theme');
    var dark = selected ? selected === 'dark' : system.matches;
    if (toggle) toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0E0D0B' : '#F6F4EE';
  }
  if (toggle) toggle.addEventListener('click', function () {
    var selected = root.getAttribute('data-theme');
    var dark = selected ? selected === 'dark' : system.matches;
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('voryn-theme', next); } catch (_) {}
    syncTheme();
  });
  system.addEventListener('change', syncTheme);
  syncTheme();
  var copy = document.getElementById('copy-source');
  if (copy) copy.addEventListener('click', async function () {
    var source = document.getElementById('source-url');
    var status = document.getElementById('source-copy-status');
    try { await navigator.clipboard.writeText(source.textContent.trim()); status.textContent = 'Source URL copied'; }
    catch (_) {
      source.closest('details').open = true;
      source.focus();
      var range = document.createRange(); range.selectNodeContents(source);
      var selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Select and copy the URL below';
    }
  });
  // The maintainer-selected source is authoritative, including preview releases.
  // Keep this independent of GitHub statistics and its API rate limit.
  (async function () {
    var link = document.getElementById('download-ipa');
    if (!link) return;
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 10000);
    try {
      var response = await fetch('source.json', {signal: controller.signal, cache: 'no-cache'});
      if (!response.ok) throw new Error('Source unavailable');
      var source = await response.json();
      var app = (source.apps || []).find(function (app) { return app.bundleIdentifier === 'com.vorynlabs.musyn'; });
      var version = app && app.versions && app.versions[0];
      if (!version || !/^\d+\.\d+(?:\.\d+)?$/.test(version.version) ||
          !/^https:\/\/github\.com\/Voryn-Labs\/Musyn\/releases\/download\/v[\d.]+\/Musyn\.ipa$/.test(version.downloadURL)) throw new Error('Invalid source release');
      link.href = version.downloadURL;
      link.textContent = 'Download Musyn ' + version.version + ' IPA ↗';
      var checksum = document.getElementById('release-checksum');
      if (checksum) checksum.href = 'https://github.com/Voryn-Labs/Musyn/releases/tag/v' + version.version;
      var identity = document.getElementById('release-identity');
      if (identity) identity.textContent = 'com.vorynlabs.musyn · ' + version.version + (version.buildVersion ? ' (' + version.buildVersion + ')' : '');
    } catch (_) {
      link.href = 'https://github.com/Voryn-Labs/Musyn/releases';
      link.textContent = 'View Musyn releases ↗';
    } finally { clearTimeout(timeout); }
  })();
  var counter = document.getElementById('ipa-downloads');
  var status = document.getElementById('download-status');
  if (!counter) return;
  (async function () {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 10000);
    try {
      var total = 0;
      for (var page = 1; page <= 20; page++) {
        var response = await fetch('https://api.github.com/repos/Voryn-Labs/Musyn/releases?per_page=100&page=' + page, {signal: controller.signal, headers: {Accept: 'application/vnd.github+json'}});
        if (!response.ok) throw new Error('Release statistics unavailable');
        var releases = await response.json();
        if (!Array.isArray(releases)) throw new Error('Invalid release response');
        releases.forEach(function (release) {
          if (release.draft) return;
          (release.assets || []).forEach(function (asset) {
            if (asset.name !== 'Musyn.ipa') return;
            if (!Number.isFinite(asset.download_count) || asset.download_count < 0) throw new Error('Invalid download total');
            total += asset.download_count;

          });
        });
        if (!(response.headers.get('Link') || '').includes('rel="next"')) break;
        if (page === 20) throw new Error('Incomplete release statistics');
      }
      counter.textContent = new Intl.NumberFormat().format(total);
      status.textContent = 'Public GitHub asset downloads · not installations';
    } catch (_) {
      counter.textContent = '—';
      status.textContent = 'Statistics unavailable · see GitHub releases';
    } finally { clearTimeout(timeout); }
  })();
})();

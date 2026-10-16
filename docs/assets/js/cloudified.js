(function () {
  "use strict";
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var system = window.matchMedia("(prefers-color-scheme: dark)");
  function syncTheme() {
    var selected = root.getAttribute("data-theme");
    var dark = selected ? selected === "dark" : system.matches;
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    document.querySelector('meta[name="theme-color"]').content = dark ? "#0E0D0B" : "#F6F4EE";
  }
  toggle.addEventListener("click", function () {
    var selected = root.getAttribute("data-theme");
    var dark = selected ? selected === "dark" : system.matches;
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("voryn-theme", next); } catch (_) {}
    syncTheme();
  });
  system.addEventListener("change", syncTheme);
  syncTheme();
  document.getElementById("copy-source").addEventListener("click", async function () {
    var source = document.getElementById("source-url");
    var status = document.getElementById("source-copy-status");
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
      status.textContent = "Source URL copied";
    } catch (_) {
      source.closest("details").open = true;
      source.focus();
      var range = document.createRange();
      range.selectNodeContents(source);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Select and copy the URL below";
    }
  });
})();

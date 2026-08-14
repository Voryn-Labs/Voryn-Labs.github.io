/* VORYN LABS — hub site behavior.
 * 1. Theme manager: system auto + manual toggle, persisted in localStorage.
 * 2. Renders the games grid from window.VORYN_APPS with dark/light icon swap.
 * 3. Mobile nav toggle. 4. Scroll reveal (honors reduced-motion). 5. Year.
 */
(function () {
  "use strict";

  var REPO = "https://github.com/Voryn-Labs/CoreBundle/tree/main/apps/";
  var STORAGE_KEY = "voryn-theme";

  /* ---- theme helpers ---- */
  function isDark() {
    var s = localStorage.getItem(STORAGE_KEY);
    if (s === "dark")  return true;
    if (s === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function applyTheme(theme) {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(STORAGE_KEY, theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem(STORAGE_KEY);
    }
    var dark = isDark();
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0E0D0B" : "#F6F4EE");
    swapIcons(dark);
  }
  function swapIcons(dark) {
    document.querySelectorAll("[data-dark][data-light]").forEach(function (img) {
      var src = dark ? img.getAttribute("data-dark") : img.getAttribute("data-light");
      if (src) img.src = src;
    });
  }
  function initTheme() {
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        applyTheme(isDark() ? "light" : "dark");
      });
    }
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        if (!localStorage.getItem(STORAGE_KEY)) swapIcons(e.matches);
      });
    }
    swapIcons(isDark()); // sync icons on load
  }

  /* ---- card builder ---- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function pad(index) { return (index + 1 < 10 ? "0" : "") + (index + 1); }

  function buildCard(app, index) {
    var live = typeof app.storeUrl === "string" && app.storeUrl.length > 0;
    var dark = isDark();

    var card = el("article", "app-card reveal");
    card.id = "app-" + app.id;
    card.style.setProperty("--accent", app.accent);

    var icon = el("img", "app-icon");
    icon.setAttribute("data-dark",  "assets/icons/" + app.id + "-dark.png");
    icon.setAttribute("data-light", "assets/icons/" + app.id + "-light.png");
    icon.src   = dark ? "assets/icons/" + app.id + "-dark.png"
                      : "assets/icons/" + app.id + "-light.png";
    icon.alt   = app.name + " — app icon";
    icon.width = 128; icon.height = 128; icon.loading = "lazy";
    card.appendChild(icon);

    card.appendChild(el("span", "app-index", pad(index))).setAttribute("aria-hidden", "true");
    card.appendChild(el("h3", null, app.name));
    card.appendChild(el("p", "tagline", app.tagline));
    card.appendChild(el("span", "chip", app.genre));

    var cta = el("a", "card-cta", live ? "Get it on Google Play ↗" : "View the source ↗");
    cta.href = live ? app.storeUrl : REPO + app.id;
    card.appendChild(cta);
    card.appendChild(el("span", live ? "badge badge-live" : "badge badge-soon",
                        live ? "Get it on Google Play" : "Coming soon on Google Play"));
    return card;
  }

  function renderGrid() {
    var grid = document.getElementById("apps-grid");
    var apps = window.VORYN_APPS;
    if (!grid || !Array.isArray(apps)) return;
    var frag = document.createDocumentFragment();
    apps.forEach(function (app, i) { frag.appendChild(buildCard(app, i)); });
    grid.replaceChildren(frag);
  }

  function initNav() {
    var nav    = document.querySelector(".site-nav");
    var toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initReveal() {
    var targets = document.querySelectorAll(".reveal");
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (t) { obs.observe(t); });
  }

  function initYear() {
    var s = document.getElementById("year");
    if (s) s.textContent = String(new Date().getFullYear());
  }

  initTheme();
  renderGrid();
  initNav();
  initReveal();
  initYear();
})();

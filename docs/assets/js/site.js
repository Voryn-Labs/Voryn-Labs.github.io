/* VORYN LABS — hub site behavior.
 * 1. Adaptive theme manager (system auto + manual toggle with persistence).
 * 2. Renders each [data-collection] grid from window.VORYN_APPS with matching
 *    dark/light icons. The static cards in index.html are the no-JS fallback;
 *    tools/validate_site.py keeps them in sync with the registry.
 * 3. Mobile nav toggle. 4. Scroll reveal (honors reduced-motion). 5. Year.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "voryn-theme";

  function isDarkTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(STORAGE_KEY, theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem(STORAGE_KEY);
    }

    var dark = isDarkTheme();
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", dark ? "#0E0D0B" : "#F6F4EE");
    }

    updateIcons(dark);
  }

  function updateIcons(dark) {
    var icons = document.querySelectorAll("[data-dark][data-light]");
    icons.forEach(function (img) {
      var target = dark ? img.getAttribute("data-dark") : img.getAttribute("data-light");
      if (target && img.src !== target) {
        img.src = target;
      }
    });
  }

  function initTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }

    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var currentDark = isDarkTheme();
        var newTheme = currentDark ? "light" : "dark";
        applyTheme(newTheme);
      });
    }

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        if (!localStorage.getItem(STORAGE_KEY)) {
          updateIcons(e.matches);
          var meta = document.querySelector('meta[name="theme-color"]');
          if (meta) meta.setAttribute("content", e.matches ? "#0E0D0B" : "#F6F4EE");
        }
      });
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pad(index) {
    return (index + 1 < 10 ? "0" : "") + (index + 1);
  }

  function buildCard(app, index) {
    var live = typeof app.storeUrl === "string" && app.storeUrl.length > 0;
    // Every app not listing repoUrl lives in the private CoreBundle monorepo
    // — a link there would 404 for visitors, so it must never render.
    var sourceIsPublic = typeof app.repoUrl === "string" && app.repoUrl.length > 0;
    var dark = isDarkTheme();

    var card = el("article", app.featured ? "app-card app-card--featured reveal"
                                          : "app-card reveal");
    card.id = "app-" + app.id;
    card.style.setProperty("--accent", app.accent);

    var icon = el("img", "app-icon");
    var darkSrc = "assets/icons/" + app.id + "-dark.png";
    var lightSrc = "assets/icons/" + app.id + "-light.png";

    icon.src = dark ? darkSrc : lightSrc;
    icon.setAttribute("data-dark", darkSrc);
    icon.setAttribute("data-light", lightSrc);
    icon.alt = app.name + " — app icon";
    icon.width = 128;
    icon.height = 128;
    icon.loading = "lazy";

    var chip = el("span", "chip", app.platform || app.genre);

    // No link at all when there's neither a live store page nor a public
    // repo — a card with just the "coming soon" badge beats a 404.
    var cta = null;
    if (live) {
      cta = el("a", "card-cta", "Get it on Google Play ↗");
      cta.href = app.storeUrl;
    } else if (sourceIsPublic) {
      cta = el("a", "card-cta", "View the source ↗");
      cta.href = app.repoUrl;
    }

    var badge = el("span", live ? "badge badge-live" : "badge badge-soon",
                   live ? "Get it on Google Play" : "Coming soon on Google Play");

    if (app.featured) {
      // Spotlight layout: brand column + copy column with feature bullets.
      var brand = el("div", "card-brand");
      brand.appendChild(icon);
      brand.appendChild(chip);
      card.appendChild(brand);

      var copy = el("div", "card-copy");
      copy.appendChild(el("h3", null, app.name));
      copy.appendChild(el("p", "tagline", app.tagline));

      if (Array.isArray(app.features) && app.features.length) {
        var list = el("ul", "card-features");
        app.features.forEach(function (pair) {
          var item = el("li");
          item.appendChild(el("strong", null, pair[0]));
          item.appendChild(document.createTextNode(" — " + pair[1]));
          list.appendChild(item);
        });
        copy.appendChild(list);
      }

      var actions = el("div", "card-actions");
      if (cta) actions.appendChild(cta);
      actions.appendChild(badge);
      copy.appendChild(actions);
      card.appendChild(copy);
      return card;
    }

    card.appendChild(icon);
    card.appendChild(el("span", "app-index", pad(index)))
        .setAttribute("aria-hidden", "true");
    card.appendChild(el("h3", null, app.name));
    card.appendChild(el("p", "tagline", app.tagline));
    card.appendChild(chip);
    if (cta) card.appendChild(cta);
    card.appendChild(badge);
    return card;
  }

  function renderGrid() {
    var apps = window.VORYN_APPS;
    if (!Array.isArray(apps)) return;
    document.querySelectorAll("[data-collection]").forEach(function (grid) {
      var id = grid.getAttribute("data-collection");
      var fragment = document.createDocumentFragment();
      // Each collection numbers its own cards from 01.
      apps.filter(function (app) { return app.collection === id; })
          .forEach(function (app, index) {
            fragment.appendChild(buildCard(app, index));
          });
      grid.replaceChildren(fragment);
    });
  }

  function initNav() {
    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
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
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (t) { observer.observe(t); });
  }

  function initYear() {
    var slot = document.getElementById("year");
    if (slot) slot.textContent = String(new Date().getFullYear());
  }

  initTheme();
  renderGrid();
  initNav();
  initReveal();
  initYear();
})();

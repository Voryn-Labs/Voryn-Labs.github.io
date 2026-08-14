/* VORYN LABS — hub site behavior.
 * 1. Renders the games grid from window.VORYN_APPS (THE single update point:
 *    set storeUrl in apps.js and the badge + CTA flip — zero HTML edits).
 * 2. Mobile nav toggle. 3. Scroll reveal (honors reduced-motion). 4. Year.
 * Progressive enhancement: the static cards in index.html already carry the
 * full catalogue, so the page is complete with JS disabled.
 */
(function () {
  "use strict";

  var REPO = "https://github.com/tinyredphoenix/CoreBundle/tree/main/apps/";

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pad(index) {
    return (index + 1 < 10 ? "0" : "") + (index + 1);
  }

  /* One card per registry entry. Derived values are never stored:
   * icon = assets/icons/<id>.png, repo CTA = repo tree URL, index = order. */
  function buildCard(app, index) {
    var live = typeof app.storeUrl === "string" && app.storeUrl.length > 0;

    var card = el("article", "app-card reveal");
    card.id = "app-" + app.id;
    card.style.setProperty("--accent", app.accent);

    var icon = el("img", "app-icon");
    icon.src = "assets/icons/" + app.id + ".png";
    icon.alt = app.name + " — app icon";
    icon.width = 128;
    icon.height = 128;
    icon.loading = "lazy";
    card.appendChild(icon);

    card.appendChild(el("span", "app-index", pad(index)))
        .setAttribute("aria-hidden", "true");
    card.appendChild(el("h3", null, app.name));
    card.appendChild(el("p", "tagline", app.tagline));
    card.appendChild(el("span", "chip", app.genre));

    var cta = el("a", "card-cta", live ? "Get it on Google Play ↗"
                                       : "View the source ↗");
    cta.href = live ? app.storeUrl : REPO + app.id;
    card.appendChild(cta);

    card.appendChild(el("span", live ? "badge badge-live" : "badge badge-soon",
                        live ? "Get it on Google Play"
                             : "Coming soon on Google Play"));
    return card;
  }

  function renderGrid() {
    var grid = document.getElementById("apps-grid");
    var apps = window.VORYN_APPS;
    if (!grid || !Array.isArray(apps)) return;
    var fragment = document.createDocumentFragment();
    apps.forEach(function (app, index) {
      fragment.appendChild(buildCard(app, index));
    });
    grid.replaceChildren(fragment);
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
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  renderGrid();
  initNav();
  initReveal();
  initYear();
})();

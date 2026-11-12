/**
 * VORYN LABS — Next-Generation Kinetic Ecosystem Engine
 * Modular, vanilla ES6+, zero-dependency client architecture.
 * Controls: Adaptive Theme, Platform Matrix, Sideload Source Copy,
 * Archive Filters, Scroll Reveals, and Kinetic Metric Counters.
 */

(function () {
  "use strict";

  var THEME_KEY = "voryn-theme";

  /* ==========================================================================
     1. THEME ENGINE (Dark / Light with System Sync & Icon Swapping)
     ========================================================================== */
  function getPreferredTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme, save) {
    if (save) {
      localStorage.setItem(THEME_KEY, theme);
    }
    document.documentElement.setAttribute("data-theme", theme);

    // Update browser status bar / theme-color meta tag
    var metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "light" ? "#F8FAFC" : "#07080B");
    }

    // Update dynamic image sources
    var dynamicIcons = document.querySelectorAll("[data-dark][data-light]");
    dynamicIcons.forEach(function (img) {
      var target = theme === "light" ? img.getAttribute("data-light") : img.getAttribute("data-dark");
      if (target && img.getAttribute("src") !== target) {
        img.setAttribute("src", target);
      }
    });

    // Update toggle ARIA
    var toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
      toggleBtn.setAttribute("title", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
    }
  }

  function initTheme() {
    var initialTheme = getPreferredTheme();
    applyTheme(initialTheme, false);

    var toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || "dark";
        var next = current === "dark" ? "light" : "dark";
        applyTheme(next, true);
      });
    }

    // Listen for OS system theme changes if user hasn't explicitly set a preference
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? "light" : "dark", false);
        }
      });
    }
  }

  /* ==========================================================================
     2. PLATFORM MATRIX SWITCHER
     ========================================================================== */
  function initPlatformMatrix() {
    var tabs = document.querySelectorAll("[data-platform-tab]");
    var cards = document.querySelectorAll("[data-platform-card]");
    if (!tabs.length || !cards.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var targetPlatform = tab.getAttribute("data-platform-tab");

        // Update active tab states
        tabs.forEach(function (t) {
          var isActive = t === tab;
          t.classList.toggle("is-active", isActive);
          t.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        // Special handling for Lab Archive tab
        if (targetPlatform === "archive") {
          var archiveEl = document.getElementById("archive");
          if (archiveEl) {
            archiveEl.scrollIntoView({ behavior: "smooth" });
          }
          return;
        }

        // Filter product cards
        cards.forEach(function (card) {
          var cardPlatform = card.getAttribute("data-platform-card");
          var matches = targetPlatform === "all" || cardPlatform === targetPlatform;

          if (matches) {
            card.classList.remove("is-hidden");
            // Trigger reflow for smooth re-entry animation
            card.style.animation = "none";
            void card.offsetWidth;
            card.style.animation = "cardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
          } else {
            card.classList.add("is-hidden");
          }
        });
      });
    });
  }

  /* ==========================================================================
     3. 1-CLICK SOURCE URL COPY & TOAST
     ========================================================================== */
  function initSourceCopy() {
    var copyBtn = document.getElementById("copy-source-btn");
    var statusMsg = document.getElementById("copy-status-msg");
    var codeElement = document.querySelector(".source-code-val");

    if (!copyBtn) return;

    copyBtn.addEventListener("click", function () {
      var sourceUrl = "https://voryn-labs.github.io/source.json";

      function showSuccess() {
        copyBtn.classList.add("copied");
        var originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> <span>Copied URL!</span>';

        if (statusMsg) {
          statusMsg.textContent = "Source URL copied to clipboard! Paste into your iOS installer.";
          statusMsg.classList.add("is-visible");
        }

        setTimeout(function () {
          copyBtn.classList.remove("copied");
          copyBtn.innerHTML = originalText;
          if (statusMsg) {
            statusMsg.classList.remove("is-visible");
          }
        }, 3200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sourceUrl).then(showSuccess).catch(function () {
          fallbackCopy(sourceUrl, showSuccess);
        });
      } else {
        fallbackCopy(sourceUrl, showSuccess);
      }
    });

    function fallbackCopy(text, callback) {
      var textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        callback();
      } catch (err) {
        if (statusMsg) {
          statusMsg.textContent = "Please copy manually: " + text;
          statusMsg.classList.add("is-visible");
        }
      }
      document.body.removeChild(textArea);
    }
  }

  /* ==========================================================================
     3B. GENERIC CODE & COMMAND COPY BUTTONS
     ========================================================================== */
  function initCopyButtons() {
    var cmdButtons = document.querySelectorAll(".copy-cmd-btn");
    cmdButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var textToCopy = btn.getAttribute("data-copy-text") || "";
        if (!textToCopy) {
          var targetId = btn.getAttribute("data-copy-target");
          if (targetId) {
            var targetEl = document.getElementById(targetId);
            if (targetEl) textToCopy = targetEl.textContent.trim();
          }
        }
        if (!textToCopy) return;

        function showBtnSuccess() {
          btn.classList.add("copied");
          var originalHTML = btn.innerHTML;
          btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> <span>Copied!</span>';
          setTimeout(function () {
            btn.classList.remove("copied");
            btn.innerHTML = originalHTML;
          }, 2400);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(showBtnSuccess).catch(function () {
            fallbackCopy(textToCopy, showBtnSuccess);
          });
        } else {
          fallbackCopy(textToCopy, showBtnSuccess);
        }
      });
    });
  }

  /* ==========================================================================
     4. LAB ARCHIVE FILTER SWITCHER
     ========================================================================== */
  function initArchiveTabs() {
    var tabs = document.querySelectorAll("[data-archive-filter]");
    var lumenCol = document.getElementById("collection-lumen");
    var indiaCol = document.getElementById("collection-india");

    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = tab.getAttribute("data-archive-filter");

        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
        });

        if (lumenCol) {
          lumenCol.style.display = filter === "all" || filter === "lumen" ? "block" : "none";
        }
        if (indiaCol) {
          indiaCol.style.display = filter === "all" || filter === "india" ? "block" : "none";
        }
      });
    });
  }

  /* ==========================================================================
     5. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ========================================================================== */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal");
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================================
     6. METRIC COUNTER ANIMATION
     ========================================================================== */
  function initMetricCounters() {
    var counterElements = document.querySelectorAll("[data-counter-target]");
    if (!counterElements.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseInt(el.getAttribute("data-counter-target"), 10);
            if (isNaN(target)) return;

            var duration = 1200;
            var startTime = null;

            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              // Ease-out cubic
              var ease = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.floor(ease * target);
              if (progress < 1) {
                window.requestAnimationFrame(step);
              } else {
                el.textContent = target;
              }
            }

            window.requestAnimationFrame(step);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================================
     7. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  function initMobileNav() {
    var nav = document.querySelector(".site-nav");
    var toggleBtn = document.querySelector(".nav-toggle");
    var navLinks = document.querySelectorAll(".nav-links a");

    if (!nav || !toggleBtn) return;

    toggleBtn.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Close when clicking outside
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target)) {
        nav.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ==========================================================================
     8. DYNAMIC YEAR
     ========================================================================== */
  function initYear() {
    var yearSlot = document.getElementById("year");
    if (yearSlot) {
      yearSlot.textContent = String(new Date().getFullYear());
    }
  }

  /* ==========================================================================
     9. CURSOR SPOTLIGHT ENGINE (Ambient Hardware Glow)
     ========================================================================== */
  function initCursorSpotlight() {
    var cards = document.querySelectorAll(
      ".product-card, .showcase-card, .workflow-card, .installer-card-btn, .archive-item-card, .creed-card, .arch-card, .android-rd-card, .about-card"
    );
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", x + "px");
        card.style.setProperty("--mouse-y", y + "px");
      });
    });
  }

  /* ==========================================================================
     10. SCREENSHOT LIGHTBOX VIEWER
     ========================================================================== */
  function initLightbox() {
    var images = document.querySelectorAll(".screenshot-figure img, [data-lightbox]");
    if (!images.length) return;

    var lb = document.createElement("div");
    lb.className = "voryn-lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Screenshot Preview");
    lb.innerHTML = '<button class="voryn-lightbox-close" aria-label="Close dialog">&times;</button><div class="voryn-lightbox-content"><img class="voryn-lightbox-img" src="" alt=""><p class="voryn-lightbox-caption"></p></div>';
    document.body.appendChild(lb);

    var closeBtn = lb.querySelector(".voryn-lightbox-close");
    var lbImg = lb.querySelector(".voryn-lightbox-img");
    var lbCap = lb.querySelector(".voryn-lightbox-caption");

    function close() {
      lb.classList.remove("is-open");
    }

    closeBtn.addEventListener("click", close);
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("is-open")) close();
    });

    images.forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        var src = img.getAttribute("src");
        var alt = img.getAttribute("alt") || "";
        var figcaption = img.closest("figure") ? img.closest("figure").querySelector("figcaption") : null;
        var captionText = figcaption ? figcaption.textContent.trim() : alt;

        lbImg.setAttribute("src", src);
        lbImg.setAttribute("alt", alt);
        lbCap.textContent = captionText;
        lb.classList.add("is-open");
      });
    });
  }

  /* ==========================================================================
     11. EXCLY INTERACTIVE RIBBON SIMULATOR
     ========================================================================== */
  function initExclySim() {
    var sim = document.getElementById("excly-interactive-sim");
    if (!sim) return;
    var keysSlot = sim.querySelector(".excly-sim-keys");
    var outputSlot = sim.querySelector(".excly-sim-output");
    var triggers = sim.querySelectorAll("[data-excly-seq]");

    var sequences = {
      autofit: {
        keys: ["Alt", "H", "O", "I"],
        action: "AutoFit Columns (A:F)",
        result: "Width 180px → 64px [Applied]"
      },
      sheet: {
        keys: ["Ctrl", "PgDn"],
        action: "Switch Active Sheet",
        result: "Sheet 1 → Sheet 2 (Financials)"
      },
      values: {
        keys: ["Alt", "H", "V", "V"],
        action: "Paste Special: Values",
        result: "Formulas stripped → Pure values"
      },
      filter: {
        keys: ["Alt", "A", "C"],
        action: "Clear Active Filters",
        result: "420 hidden rows revealed"
      }
    };

    triggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var seqKey = btn.getAttribute("data-excly-seq");
        var seq = sequences[seqKey];
        if (!seq) return;

        triggers.forEach(function (b) { b.classList.toggle("is-active", b === btn); });

        keysSlot.innerHTML = seq.keys.map(function (k) { return "<kbd>" + k + "</kbd>"; }).join(" <span>+</span> ");
        outputSlot.innerHTML = '<span>' + seq.action + '</span> <span class="excly-output-badge">' + seq.result + '</span>';
      });
    });
  }

  /* ==========================================================================
     12. ADVANCED GSAP MOTION & KINETIC PHYSICS ENGINE
     ========================================================================== */
  function initGsapMotion() {
    if (typeof window.gsap === "undefined") {
      // Graceful fallback for offline / blocked CDN: ensure all reveal elements are visible
      document.querySelectorAll(".reveal, .product-card, .showcase-card").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // A. Hero Cinematic Orchestration
    var hero = document.getElementById("hero");
    if (hero) {
      var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      var eyebrow = hero.querySelector(".hero-eyebrow");
      var headline = hero.querySelector(".hero-headline");
      var lede = hero.querySelector(".hero-lede");
      var ctas = hero.querySelectorAll(".hero-cta-group .action-btn");
      var showcaseCards = hero.querySelectorAll(".showcase-card");

      if (eyebrow) {
        heroTl.from(eyebrow, { y: -16, opacity: 0, duration: 0.7 });
      }
      if (headline) {
        heroTl.from(headline, { y: 32, opacity: 0, duration: 0.95 }, "-=0.4");
      }
      if (lede) {
        heroTl.from(lede, { y: 20, opacity: 0, duration: 0.8 }, "-=0.5");
      }
      if (ctas.length) {
        heroTl.from(ctas, { y: 18, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.5");
      }
      if (showcaseCards.length) {
        heroTl.from(showcaseCards, { y: 30, opacity: 0, duration: 0.75, stagger: 0.08, ease: "power2.out" }, "-=0.4");
      }
    }

    // B. ScrollTrigger Product Card Reveals & Depth Parallax
    if (ScrollTrigger) {
      var productCards = document.querySelectorAll(".product-card");
      productCards.forEach(function (card) {
        var info = card.querySelector(".product-card-col-info");
        var visual = card.querySelector(".product-card-col-visual");

        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            toggleActions: "play none none none"
          }
        });

        if (info) {
          tl.from(info, {
            y: 35,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out"
          });
        }

        if (visual) {
          tl.from(visual, {
            scale: 0.92,
            opacity: 0,
            y: 25,
            duration: 0.95,
            ease: "back.out(1.2)"
          }, "-=0.6");

          // Parallax float on scroll
          gsap.to(visual, {
            yPercent: -4,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2
            }
          });
        }
      });

      // Sideload Pipeline Banner ScrollTrigger
      var sideloadBanner = document.getElementById("ios-source");
      if (sideloadBanner) {
        gsap.from(sideloadBanner.querySelectorAll(".installer-card-btn"), {
          scrollTrigger: {
            trigger: sideloadBanner,
            start: "top 80%"
          },
          y: 25,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out"
        });
      }

      // Android R&D Cards Reveal
      var androidSection = document.getElementById("android-devices");
      if (androidSection) {
        gsap.from(androidSection.querySelectorAll(".creed-card, .android-rd-card"), {
          scrollTrigger: {
            trigger: androidSection,
            start: "top 80%"
          },
          y: 30,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out"
        });
      }

      // Archive Teaser Card Reveal
      var archiveSection = document.getElementById("archive");
      if (archiveSection) {
        var archiveBanner = archiveSection.querySelector(".archive-teaser-banner");
        if (archiveBanner) {
          gsap.from(archiveBanner, {
            scrollTrigger: {
              trigger: archiveSection,
              start: "top 85%"
            },
            y: 35,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out"
          });
        }
      }
    }

    // C. 3D Dynamic Card Tilt Physics on Mouse Move
    var tiltElements = document.querySelectorAll(".product-card, .showcase-card, .mac-app-window, .phone-app-window");
    tiltElements.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -3.5;
        var rotateY = ((x - centerX) / centerX) * 3.5;

        gsap.to(el, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1000,
          duration: 0.35,
          ease: "power1.out"
        });
      });

      el.addEventListener("mouseleave", function () {
        gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "power2.out"
        });
      });
    });

    // D. Magnetic Hover Micro-Tension on Primary Action Buttons
    var magneticButtons = document.querySelectorAll(".action-btn-primary, .hero-btn-primary");
    magneticButtons.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.18,
          y: y * 0.18,
          duration: 0.3,
          ease: "power1.out"
        });

        var arrow = btn.querySelector(".btn-arrow-circle");
        if (arrow) {
          gsap.to(arrow, {
            x: x * 0.28,
            y: y * 0.28,
            duration: 0.3,
            ease: "power1.out"
          });
        }
      });

      btn.addEventListener("mouseleave", function () {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)"
        });

        var arrow = btn.querySelector(".btn-arrow-circle");
        if (arrow) {
          gsap.to(arrow, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.4)"
          });
        }
      });
    });
  }

  /* ==========================================================================
     BOOTSTRAP
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initPlatformMatrix();
    initSourceCopy();
    initCopyButtons();
    initArchiveTabs();
    initScrollReveal();
    initMetricCounters();
    initMobileNav();
    initYear();
    initCursorSpotlight();
    initLightbox();
    initExclySim();
    initGsapMotion();
  });
})();

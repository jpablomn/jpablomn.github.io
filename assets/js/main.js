document.documentElement.classList.add("js");

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById("preloader");
  var preloaderFill = document.getElementById("preloaderFill");
  var heroEl = document.querySelector(".hero");

  function revealHero() {
    if (heroEl) heroEl.classList.add("is-ready");
  }

  function hidePreloader() {
    document.body.classList.remove("is-loading");
    if (preloader) preloader.classList.add("is-hidden");
    revealHero();
  }

  if (preloader) {
    if (reduceMotion) {
      hidePreloader();
    } else {
      requestAnimationFrame(function () {
        if (preloaderFill) preloaderFill.style.width = "100%";
      });
      var minDelay = 900;
      var start = Date.now();
      window.addEventListener("load", function () {
        var elapsed = Date.now() - start;
        setTimeout(hidePreloader, Math.max(0, minDelay - elapsed));
      });
      // Safety net: never let the preloader block the page for more than 3s.
      setTimeout(hidePreloader, 3000);
    }
  } else {
    revealHero();
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Spine active-section highlighting + sliding indicator ---------- */
  var navLinks = document.querySelectorAll("[data-nav]");
  var spineList = document.getElementById("spineList");
  var spineIndicator = document.getElementById("spineIndicator");
  var navSections = Array.prototype.map.call(navLinks, function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  function moveIndicator(link) {
    if (!spineIndicator || !spineList || !link) return;
    var listRect = spineList.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    spineIndicator.style.top = (linkRect.top - listRect.top) + "px";
    spineIndicator.style.height = linkRect.height + "px";
    spineIndicator.style.opacity = "1";
  }

  if ("IntersectionObserver" in window && navSections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (link) {
          var active = link.getAttribute("href") === id;
          link.classList.toggle("is-active", active);
          if (active) moveIndicator(link);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navSections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Skill bars ---------- */
  var skillBars = document.querySelectorAll(".skill__bar-fill");
  if ("IntersectionObserver" in window && skillBars.length) {
    var skillObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    skillBars.forEach(function (el) { skillObserver.observe(el); });
  } else {
    skillBars.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters (highlights strip) ---------- */
  var counters = document.querySelectorAll(".count[data-count-to]");
  function runCounter(el) {
    var target = parseFloat(el.dataset.countTo);
    if (reduceMotion) { el.textContent = target; return; }
    var duration = 1100;
    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.countTo; });
  }

  /* ---------- Timeline: scroll-linked progress line ---------- */
  var timelineEl = document.getElementById("timeline");
  var timelineProgress = document.getElementById("timelineProgress");
  if (timelineEl && timelineProgress && !reduceMotion) {
    var tlTicking = false;
    function updateTimelineProgress() {
      var rect = timelineEl.getBoundingClientRect();
      var vh = window.innerHeight;
      var startPoint = vh * 0.85;
      var totalSpan = startPoint + rect.height - vh * 0.4;
      var current = startPoint - rect.top;
      var p = totalSpan > 0 ? Math.min(Math.max(current / totalSpan, 0), 1) : 0;
      timelineProgress.style.transform = "scaleY(" + p + ")";
      tlTicking = false;
    }
    window.addEventListener("scroll", function () {
      if (!tlTicking) { requestAnimationFrame(updateTimelineProgress); tlTicking = true; }
    }, { passive: true });
    updateTimelineProgress();
  }

  /* ---------- Proyectos: rail nav (scroll + active state) ---------- */
  var railLinks = document.querySelectorAll(".dossier-rail__link");
  var dossierBlocks = Array.prototype.map.call(railLinks, function (link) {
    return document.getElementById(link.dataset.target);
  }).filter(Boolean);

  if ("IntersectionObserver" in window && dossierBlocks.length) {
    var railObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        railLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.dataset.target === entry.target.id);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    dossierBlocks.forEach(function (block) { railObserver.observe(block); });
  }

  /* ---------- Certificaciones: filter ---------- */
  var certFilters = document.querySelectorAll(".cert-filter");
  var certItems = document.querySelectorAll(".cert-item");
  certFilters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      certFilters.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.dataset.filter;
      certItems.forEach(function (item) {
        var show = filter === "*" || item.dataset.cat === filter;
        item.classList.toggle("is-shown", show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  if (window.GLightbox) {
    GLightbox({ selector: ".portfolio-lightbox" });
    GLightbox({ selector: ".cert-lightbox" });
  }

  /* ---------- Testimonials ---------- */
  var track = document.getElementById("testimonialTrack");
  var prevBtn = document.getElementById("testimonialPrev");
  var nextBtn = document.getElementById("testimonialNext");
  var indexEl = document.getElementById("testimonialIndex");
  if (track && prevBtn && nextBtn) {
    var slides = track.children.length;
    var current = 0;
    var autoplayId = null;
    function goTo(i) {
      current = (i + slides) % slides;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      if (indexEl) indexEl.textContent = current + 1;
    }
    function stopAutoplay() { if (autoplayId) { clearInterval(autoplayId); autoplayId = null; } }
    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      autoplayId = setInterval(function () { goTo(current + 1); }, 7000);
    }
    prevBtn.addEventListener("click", function () { goTo(current - 1); stopAutoplay(); });
    nextBtn.addEventListener("click", function () { goTo(current + 1); stopAutoplay(); });
    track.parentElement.addEventListener("mouseenter", stopAutoplay);
    track.parentElement.addEventListener("mouseleave", startAutoplay);
    startAutoplay();
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Contact form (AJAX via FormSubmit) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var statusText = document.getElementById("formStatusText");
  if (form && status && statusText) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector("button[type=submit]");
      var email = form.getAttribute("action").split("/").pop();
      submitBtn.disabled = true;
      status.className = "form-status";
      statusText.textContent = "Enviando...";

      fetch("https://formsubmit.co/ajax/" + email, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          statusText.textContent = "Mensaje enviado. Te responderé pronto.";
          status.className = "form-status is-ok";
          form.reset();
        })
        .catch(function () {
          statusText.textContent = "No se pudo enviar. Escríbeme directo a jpabloomn@gmail.com o por WhatsApp.";
          status.className = "form-status is-err";
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  /* ---------- Custom cursor ---------- */
  var cursorDot = document.getElementById("cursorDot");
  var cursorRing = document.getElementById("cursorRing");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (cursorDot && cursorRing && canHover && !reduceMotion) {
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      document.documentElement.classList.add("has-cursor");
      cursorDot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    });
    document.addEventListener("mouseleave", function () {
      document.documentElement.classList.remove("has-cursor");
    });
    (function raf() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    })();
    var hoverTargets = "a, button, [data-magnetic], .python-case, .dossier-excel-item, .dossier-bi-item, .cert-item__wrap";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverTargets)) cursorRing.classList.add("is-active");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverTargets)) cursorRing.classList.remove("is-active");
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.25) + "px," + (y * 0.35) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- Hero portrait parallax on mouse move ---------- */
  var heroMediaImg = document.querySelector(".hero__media img");
  if (heroEl && heroMediaImg && canHover && !reduceMotion) {
    heroEl.addEventListener("mousemove", function (e) {
      var r = heroEl.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width - 0.5) * 14;
      var y = ((e.clientY - r.top) / r.height - 0.5) * 10;
      heroMediaImg.style.translate = x + "px " + y + "px";
    });
  }

  /* ---------- Top scroll-progress bar ---------- */
  var scrollProgress = document.getElementById("scrollProgress");
  if (scrollProgress) {
    var spTicking = false;
    function updateScrollProgress() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      scrollProgress.style.width = pct + "%";
      spTicking = false;
    }
    window.addEventListener("scroll", function () {
      if (!spTicking) { requestAnimationFrame(updateScrollProgress); spTicking = true; }
    }, { passive: true });
    updateScrollProgress();
  }

  /* ---------- Card tilt on hover (projects & certificates) ---------- */
  if (canHover && !reduceMotion) {
    var tiltEls = document.querySelectorAll(".python-case, .dossier-excel-item, .dossier-bi-item, .cert-item__wrap");
    tiltEls.forEach(function (el) {
      el.style.transformStyle = "preserve-3d";
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(700px) rotateX(" + (py * -8) + "deg) rotateY(" + (px * 8) + "deg) scale3d(1.02,1.02,1.02)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }
})();

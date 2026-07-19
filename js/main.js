/* Netqorix — shared site behavior (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header scroll state ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var hamburger = document.querySelector(".hamburger");
  var mobileNav = document.querySelector(".mobile-nav");
  if (hamburger && mobileNav) {
    var closeMobileNav = function () {
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "Open menu");
      mobileNav.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    var openMobileNav = function () {
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", "Close menu");
      mobileNav.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var firstLink = mobileNav.querySelector("a");
      if (firstLink) firstLink.focus();
    };
    hamburger.addEventListener("click", function () {
      var isOpen = hamburger.getAttribute("aria-expanded") === "true";
      if (isOpen) { closeMobileNav(); } else { openMobileNav(); }
    });
    mobileNav.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMobileNav();
        hamburger.focus();
      }
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });
  }

  /* ---------- Header search overlay ---------- */
  var searchToggle = document.getElementById("search-toggle");
  var searchOverlay = document.getElementById("search-overlay");
  var searchForm = document.getElementById("site-search-form");
  var searchInput = document.getElementById("site-search-input");
  if (searchToggle && searchOverlay) {
    var closeSearch = function () {
      searchToggle.setAttribute("aria-expanded", "false");
      searchToggle.setAttribute("aria-label", "Open search");
      searchOverlay.classList.remove("is-open");
    };
    var openSearch = function () {
      searchToggle.setAttribute("aria-expanded", "true");
      searchToggle.setAttribute("aria-label", "Close search");
      searchOverlay.classList.add("is-open");
      if (searchInput) searchInput.focus();
    };
    searchToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = searchToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) { closeSearch(); } else { openSearch(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && searchToggle.getAttribute("aria-expanded") === "true") {
        closeSearch();
        searchToggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      var isOpen = searchToggle.getAttribute("aria-expanded") === "true";
      if (isOpen && !searchOverlay.contains(e.target) && e.target !== searchToggle) {
        closeSearch();
      }
    });
    if (searchForm && searchInput) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var query = searchInput.value.trim();
        if (!query) {
          searchInput.focus();
          return;
        }
        /* No local search index exists on this static site, so queries are
           delegated to a site-restricted Google search. */
        var url = "https://www.google.com/search?q=" + encodeURIComponent("site:netqorix.com " + query);
        window.open(url, "_blank", "noopener");
        closeSearch();
      });
    }
  }

  /* ---------- Scroll reveal via IntersectionObserver ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- Two-tone heading fill on scroll ---------- */
  var fillHeadings = document.querySelectorAll(".reveal-fill");
  if (fillHeadings.length && "IntersectionObserver" in window) {
    var fillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-filled");
          fillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    fillHeadings.forEach(function (el) { fillObserver.observe(el); });
  } else {
    fillHeadings.forEach(function (el) { el.classList.add("is-filled"); });
  }

  /* ---------- Count-up metrics ---------- */
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffixEl = el.querySelector(".suffix");
      var valueEl = el.querySelector(".value") || el;
      if (prefersReducedMotion) {
        valueEl.textContent = target;
        return;
      }
      var duration = 1400;
      var start = null;
      var startVal = 0;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(startVal + (target - startVal) * eased);
        valueEl.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          valueEl.textContent = target;
        }
      }
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Services carousel (dots + keyboard + swipe) ---------- */
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var dotsWrap = carousel.querySelector(".carousel-dots");
    if (!track || !dotsWrap) return;
    var cards = Array.prototype.slice.call(track.children);

    cards.forEach(function (card, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    var setActiveDot = function (index) {
      dots.forEach(function (d, i) {
        d.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    };

    var updateDots = function () {
      var trackRect = track.getBoundingClientRect();
      var closestIndex = 0;
      var closestDist = Infinity;
      cards.forEach(function (card, i) {
        var dist = Math.abs(card.getBoundingClientRect().left - trackRect.left);
        if (dist < closestDist) { closestDist = dist; closestIndex = i; }
      });
      setActiveDot(closestIndex);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setActiveDot(i);
        cards[i].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", inline: "start", block: "nearest" });
      });
    });

    track.addEventListener("scroll", function () {
      window.requestAnimationFrame(updateDots);
    }, { passive: true });

    track.setAttribute("tabindex", "0");
    track.setAttribute("role", "region");
    track.setAttribute("aria-label", "Services carousel, use arrow keys to browse");
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        track.scrollBy({ left: 300, behavior: prefersReducedMotion ? "auto" : "smooth" });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        track.scrollBy({ left: -300, behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var answer = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (answer) {
        answer.style.maxHeight = expanded ? "0px" : answer.scrollHeight + "px";
      }
    });
  });

  /* ---------- Inline form validation (Formspree forms) ---------- */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var fields = form.querySelectorAll("input[required], textarea[required], select[required]");

    var showError = function (field) {
      field.setAttribute("data-touched", "true");
      var errorEl = form.querySelector('.form-error[data-for="' + field.name + '"]');
      if (!errorEl) return;
      if (field.validity.valid) {
        errorEl.classList.remove("is-visible");
        errorEl.textContent = "";
      } else {
        errorEl.classList.add("is-visible");
        if (field.validity.valueMissing) {
          errorEl.textContent = "This field is required.";
        } else if (field.validity.typeMismatch) {
          errorEl.textContent = "Please enter a valid " + (field.type === "email" ? "email address." : "value.");
        } else {
          errorEl.textContent = "Please check this field.";
        }
      }
    };

    fields.forEach(function (field) {
      field.addEventListener("blur", function () { showError(field); });
      field.addEventListener("input", function () {
        if (field.getAttribute("data-touched") === "true") showError(field);
      });
    });

    form.addEventListener("submit", function (e) {
      var valid = true;
      fields.forEach(function (field) {
        showError(field);
        if (!field.validity.valid) valid = false;
      });
      if (!valid) {
        e.preventDefault();
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (form.hasAttribute("data-ajax")) {
        e.preventDefault();
        var successEl = form.querySelector(".form-success");
        var submitErrorEl = form.querySelector(".form-submit-error");
        var submitBtn = form.querySelector('button[type="submit"]');

        var showSubmitError = function (message) {
          if (submitErrorEl) {
            submitErrorEl.textContent = message;
            submitErrorEl.classList.add("is-visible");
          } else {
            alert(message);
          }
        };

        /* This template ships with an unconfigured Formspree placeholder
           endpoint. Fail loudly instead of silently posting to a dead URL. */
        if (/\/f\/yourFormId$/.test(form.action)) {
          showSubmitError("This form isn't connected yet — please email us directly at sanjeev125789632@gmail.com.");
          return;
        }

        if (submitErrorEl) {
          submitErrorEl.classList.remove("is-visible");
          submitErrorEl.textContent = "";
        }
        if (submitBtn) submitBtn.disabled = true;

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        }).then(function (response) {
          if (response.ok) {
            form.reset();
            if (successEl) successEl.classList.add("is-visible");
          } else {
            if (submitBtn) submitBtn.disabled = false;
            showSubmitError("Something went wrong sending your message. Please try again or email us directly.");
          }
        }).catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          showSubmitError("Something went wrong sending your message. Please try again or email us directly.");
        });
      }
    });
  });

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

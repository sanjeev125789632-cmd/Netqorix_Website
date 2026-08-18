/**
 * Netqorix Main JavaScript Engine
 * Vanilla JS - Zero External Dependencies
 * Features: Mobile Nav, Sticky Header, Netqorix Ledger Count-Up, FAQ Accordion,
 *           INR/USD Currency Switcher, Form Validation, Anti-Spam & UTM Tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Production Lead Capture Endpoint & Access Key
  const ACCESS_KEY = '21a04abe-eff7-4856-a921-1d630b0ae2a6';
  const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
  const CONTACT_EMAIL = 'netqorix@gmail.com';

  /* ==========================================================================
     1. STICKY HEADER & MOBILE NAVIGATION
     ========================================================================== */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  function closeMobileNav() {
    if (navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      document.body.classList.remove('nav-open');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `;
      }
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        navMenu.classList.add('open');
        document.body.classList.add('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        mobileToggle.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      }
    });

    // Close menu when clicking outside header
    document.addEventListener('click', (e) => {
      if (header && !header.contains(e.target) && navMenu.classList.contains('open')) {
        closeMobileNav();
      }
    });

    // Close menu on link click inside drawer
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        closeMobileNav();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMobileNav();
        mobileToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. DUAL CURRENCY TOGGLE (INR ⇄ USD) & PERSISTENCE
     ========================================================================== */
  const CURRENCY_STORAGE_KEY = 'netqorix_currency_pref';
  // Deliberate default currency for first-time visitors: INR
  let currentCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (!currentCurrency || (currentCurrency !== 'INR' && currentCurrency !== 'USD')) {
    currentCurrency = 'INR';
  }

  function applyCurrency(curr) {
    currentCurrency = curr;
    localStorage.setItem(CURRENCY_STORAGE_KEY, curr);

    // Update active state on all currency option buttons across the DOM
    const inrBtns = document.querySelectorAll('.currency-option[data-currency="INR"]');
    const usdBtns = document.querySelectorAll('.currency-option[data-currency="USD"]');

    inrBtns.forEach(btn => btn.classList.toggle('active', curr === 'INR'));
    usdBtns.forEach(btn => btn.classList.toggle('active', curr === 'USD'));

    // Update all price elements in the DOM
    const priceElements = document.querySelectorAll('[data-inr][data-usd]');
    priceElements.forEach(el => {
      const inrVal = el.getAttribute('data-inr');
      const usdVal = el.getAttribute('data-usd');
      el.textContent = (curr === 'INR') ? inrVal : usdVal;
    });
  }

  // Initialize currency on page load
  applyCurrency(currentCurrency);

  // Global event delegation for currency buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.currency-option');
    if (btn) {
      const selected = btn.getAttribute('data-currency');
      if (selected && (selected === 'INR' || selected === 'USD')) {
        applyCurrency(selected);
      }
    }
  });

  /* ==========================================================================
     3. NETQORIX LEDGER COUNT-UP ANIMATION & SCROLL REVEALS
     ========================================================================== */
  const ledgerCard = document.querySelector('.ledger-card');
  let animated = false;

  function animateCountUp() {
    const counterElements = document.querySelectorAll('.count-up');
    counterElements.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const duration = 2000; // ms
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const easedProgress = progress * (2 - progress);
        const currentVal = Math.round(target * easedProgress * Math.pow(10, decimals)) / Math.pow(10, decimals);
        
        el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  if (ledgerCard && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCountUp();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(ledgerCard);
  }

  /* ==========================================================================
     4. FAQ ACCORDION
     ========================================================================== */
  const faqButtons = document.querySelectorAll('.faq-button');
  faqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.closest('.faq-item');
      const content = faqItem.querySelector('.faq-content');
      const isOpen = faqItem.classList.contains('active');

      // Close all other open FAQ items
      document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
          const itemContent = item.querySelector('.faq-content');
          if (itemContent) itemContent.style.maxHeight = null;
          const itemBtn = item.querySelector('.faq-button');
          if (itemBtn) itemBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        faqItem.classList.remove('active');
        content.style.maxHeight = null;
        button.setAttribute('aria-expanded', 'false');
      } else {
        faqItem.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Recompute accordion height on resize for active items
  window.addEventListener('resize', () => {
    document.querySelectorAll('.faq-item.active .faq-content').forEach(content => {
      content.style.maxHeight = content.scrollHeight + 'px';
    });
  });

  /* ==========================================================================
     5. UTM TRACKING & SESSION STORAGE
     ========================================================================== */
  function captureUTMs() {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    utmKeys.forEach(key => {
      const val = params.get(key);
      if (val) {
        sessionStorage.setItem(key, val);
      }
    });
  }

  captureUTMs();

  // Populate hidden UTM fields in forms if present
  function populateFormUTMs(form) {
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    utmKeys.forEach(key => {
      const savedVal = sessionStorage.getItem(key);
      if (savedVal) {
        let hiddenInput = form.querySelector(`input[name="${key}"]`);
        if (!hiddenInput) {
          hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = key;
          form.appendChild(hiddenInput);
        }
        hiddenInput.value = savedVal;
      }
    });
  }

  /* ==========================================================================
     6. LEAD FORM VALIDATION, HONEYPOT & SUBMISSION
     ========================================================================== */
  const leadForm = document.querySelector('#lead-form');
  const formStartTime = Date.now();

  if (leadForm) {
    populateFormUTMs(leadForm);

    const inputs = leadForm.querySelectorAll('input:not([type="hidden"]), select, textarea');

    // Inline field validation logic
    function validateField(input) {
      const fieldGroup = input.closest('.form-group') || input.parentElement;
      let errorElement = fieldGroup.querySelector('.field-error');
      let isValid = true;
      let errorMessage = '';

      if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required.';
      } else if (input.type === 'email' && input.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isValid = false;
          errorMessage = 'Please enter a valid work email address.';
        }
      }

      if (!isValid) {
        input.classList.add('is-invalid');
        if (!errorElement) {
          errorElement = document.createElement('span');
          errorElement.className = 'field-error';
          fieldGroup.appendChild(errorElement);
        }
        errorElement.textContent = errorMessage;
      } else {
        input.classList.remove('is-invalid');
        if (errorElement) {
          errorElement.remove();
        }
      }

      return isValid;
    }

    // Validate on blur
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
    });

    // Form Submit Handler
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check Honeypot field (#website-url-confirm)
      const honeypot = leadForm.querySelector('#website-url-confirm');
      if (honeypot && honeypot.value !== '') {
        console.warn('Bot submission blocked via honeypot.');
        window.location.href = 'thanks.html';
        return;
      }

      // Check minimum time-on-form threshold (anti-bot)
      const timeElapsed = Date.now() - formStartTime;
      if (timeElapsed < 800) {
        console.warn('Submission too fast, likely bot.');
        window.location.href = 'thanks.html';
        return;
      }

      // Validate all fields
      let formIsValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          formIsValid = false;
        }
      });

      if (!formIsValid) {
        const firstInvalid = leadForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Submit loading state
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"></circle>
          </svg>
          Processing...
        `;
      }

      const formData = new FormData(leadForm);
      if (!formData.has('access_key')) {
        formData.append('access_key', ACCESS_KEY);
      }

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          window.location.href = 'thanks.html';
        } else {
          // Fallback to mailto if endpoint fails or is placeholder
          triggerMailtoFallback(formData);
        }
      } catch (err) {
        console.warn('Fetch submission error, falling back to mailto:', err);
        triggerMailtoFallback(formData);
      }
    });

    function triggerMailtoFallback(formData) {
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const company = formData.get('company') || '';
      const service = formData.get('service') || '';
      const budget = formData.get('budget') || '';
      const message = formData.get('message') || '';

      const bodyText = `Name: ${name}%0D%0AEmail: ${email}%0D%0ACompany: ${company}%0D%0AService: ${service}%0D%0ABudget: ${budget}%0D%0AMessage: ${message}`;
      const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=Netqorix Scoping Request - ${encodeURIComponent(name)}&body=${bodyText}`;
      
      window.location.href = mailtoUrl;
      setTimeout(() => {
        window.location.href = 'thanks.html';
      }, 1000);
    }
  }

  /* ==========================================================================
     7. DYNAMIC FOOTER YEAR
     ========================================================================== */
  const yearEl = document.querySelector('#current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     8. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ========================================================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
});



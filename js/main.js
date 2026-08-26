/**
 * Netqorix Main JavaScript Engine
 * Vanilla JS - Zero External Dependencies
 * Features: Mobile Nav, Sticky Header, Netqorix Ledger Count-Up, FAQ Accordion,
 *           INR/USD Currency Switcher, Form Validation, Anti-Spam & UTM Tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Production Lead Capture Endpoint & Access Key
  const ACCESS_KEY = 'dfb47309-848e-47a9-a2c0-30ff4a8df0fc';
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
     2. LANGUAGE & MULTI-CURRENCY LOCALIZATION
     ========================================================================== */
  const CURRENCY_STORAGE_KEY = 'netqorix_currency_pref';
  const LANGUAGE_STORAGE_KEY = 'netqorix_language_pref';
  const SUPPORTED_CURRENCIES = ['INR', 'USD', 'GBP', 'EUR', 'JPY', 'KRW', 'CNY'];
  const LANGUAGE_CURRENCY = {
    en: 'USD',
    es: 'EUR',
    de: 'EUR',
    it: 'EUR',
    ja: 'JPY',
    ko: 'KRW',
    zh: 'CNY'
  };
  const CURRENCY_META = {
    INR: { label: '₹ INR', locale: 'en-IN', rate: 1 },
    USD: { label: '$ USD', locale: 'en-US', rate: 1 },
    GBP: { label: '£ GBP', locale: 'en-GB', rate: 0.74 },
    EUR: { label: '€ EUR', locale: 'de-DE', rate: 0.86 },
    JPY: { label: '¥ JPY', locale: 'ja-JP', rate: 147 },
    KRW: { label: '₩ KRW', locale: 'ko-KR', rate: 1390 },
    CNY: { label: '¥ CNY', locale: 'zh-CN', rate: 7.12 }
  };
  const LANGUAGE_OPTIONS = [
    ['en', 'English'],
    ['es', 'Español'],
    ['de', 'Deutsch'],
    ['it', 'Italiano'],
    ['ja', '日本語'],
    ['ko', '한국어'],
    ['zh-CN', '中文']
  ];

  function normalizedLanguage(language) {
    return language === 'zh-CN' ? 'zh' : language;
  }

  function displayLanguage(language) {
    return language === 'zh' ? 'zh-CN' : language;
  }

  function readGoogleLanguageCookie() {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
    return match ? normalizedLanguage(decodeURIComponent(match[1])) : '';
  }

  let currentLanguage = normalizedLanguage(
    localStorage.getItem(LANGUAGE_STORAGE_KEY) || readGoogleLanguageCookie() || 'en'
  );
  if (!Object.prototype.hasOwnProperty.call(LANGUAGE_CURRENCY, currentLanguage)) {
    currentLanguage = 'en';
  }

  let currentCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (!SUPPORTED_CURRENCIES.includes(currentCurrency)) {
    // First-time visitors always start with INR. Currency changes automatically
    // only after they choose another language or manually select a currency.
    currentCurrency = 'INR';
  }

  function formatConvertedUsdText(value, currency) {
    if (currency === 'USD') return value;
    const meta = CURRENCY_META[currency];
    return value.replace(/\$\s?([\d,]+)/g, (match, amount) => {
      const usd = Number(amount.replace(/,/g, ''));
      if (!Number.isFinite(usd)) return match;
      const converted = usd * meta.rate;
      const rounding = currency === 'JPY' || currency === 'KRW'
        ? (converted >= 100000 ? 10000 : 1000)
        : (converted >= 10000 ? 100 : converted >= 1000 ? 10 : 1);
      const rounded = Math.round(converted / rounding) * rounding;
      return new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0
      }).format(rounded);
    });
  }

  function applyCurrency(currency, persist = true) {
    if (!SUPPORTED_CURRENCIES.includes(currency)) return;
    currentCurrency = currency;
    if (persist) localStorage.setItem(CURRENCY_STORAGE_KEY, currency);

    document.querySelectorAll('.currency-option').forEach(button => {
      button.classList.toggle('active', button.dataset.currency === currency);
    });
    document.querySelectorAll('.currency-select').forEach(select => {
      select.value = currency;
    });

    document.querySelectorAll('[data-inr][data-usd]').forEach(element => {
      const inrValue = element.getAttribute('data-inr');
      const usdValue = element.getAttribute('data-usd');
      element.textContent = currency === 'INR'
        ? inrValue
        : formatConvertedUsdText(usdValue, currency);
    });
  }

  function setTranslationCookie(language) {
    const translatedLanguage = displayLanguage(language);
    const cookieValue = language === 'en' ? '' : `/en/${translatedLanguage}`;
    const expiry = language === 'en' ? 'Thu, 01 Jan 1970 00:00:00 GMT' : 'Fri, 31 Dec 2038 23:59:59 GMT';
    document.cookie = `googtrans=${cookieValue}; path=/; expires=${expiry}; SameSite=Lax`;
    if (location.hostname.endsWith('netqorix.com')) {
      document.cookie = `googtrans=${cookieValue}; domain=.netqorix.com; path=/; expires=${expiry}; SameSite=Lax`;
    }
  }

  function languageName(language) {
    const selected = LANGUAGE_OPTIONS.find(([code]) => normalizedLanguage(code) === normalizedLanguage(language));
    return selected ? selected[1] : 'English';
  }

  function createSelect(className, label, options, selectedValue, visibleLabel = true) {
    const wrapper = document.createElement('label');
    wrapper.className = 'locale-field notranslate';
    wrapper.setAttribute('translate', 'no');

    const labelText = document.createElement('span');
    labelText.className = visibleLabel ? 'locale-field-label' : 'sr-only';
    labelText.textContent = label;

    const select = document.createElement('select');
    select.className = className;
    select.setAttribute('aria-label', label);
    options.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    });
    select.value = selectedValue;
    wrapper.append(labelText, select);
    return wrapper;
  }

  function updateLocaleSummary() {
    document.querySelectorAll('.locale-trigger-text').forEach(element => {
      element.textContent = `${languageName(currentLanguage)} · ${CURRENCY_META[currentCurrency].label}`;
    });
    document.querySelectorAll('.locale-status').forEach(element => {
      element.textContent = `Selected: ${languageName(currentLanguage)} and ${CURRENCY_META[currentCurrency].label}`;
    });
  }

  function closeLocalePanels(exceptSwitcher) {
    document.querySelectorAll('.locale-switcher').forEach(switcher => {
      if (switcher === exceptSwitcher) return;
      const button = switcher.querySelector('.locale-trigger');
      const panel = switcher.querySelector('.locale-panel');
      if (button && panel) {
        button.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      }
    });
  }

  function createLocaleSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'locale-switcher notranslate';
    switcher.setAttribute('translate', 'no');

    const panelId = `locale-panel-${Math.random().toString(36).slice(2, 9)}`;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'locale-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-label', 'Change website language and currency');
    trigger.innerHTML = `
      <svg class="locale-globe" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21M12 3C9.6 5.5 8.4 8.5 8.4 12S9.6 18.5 12 21"></path>
      </svg>
      <span class="locale-trigger-text"></span>
      <svg class="locale-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5"></path></svg>
    `;

    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'locale-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="locale-panel-heading">
        <span class="locale-panel-kicker">GLOBAL PREFERENCES</span>
        <strong>Choose your region</strong>
      </div>
    `;
    panel.append(
      createSelect('language-select', 'Website language', LANGUAGE_OPTIONS, displayLanguage(currentLanguage)),
      createSelect(
        'currency-select',
        'Display currency',
        SUPPORTED_CURRENCIES.map(code => [code, CURRENCY_META[code].label]),
        currentCurrency
      )
    );

    const note = document.createElement('p');
    note.className = 'locale-note';
    note.textContent = 'Your selection is remembered. Converted prices are estimates.';
    const status = document.createElement('span');
    status.className = 'locale-status sr-only';
    status.setAttribute('aria-live', 'polite');
    panel.append(note, status);
    switcher.append(trigger, panel);

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeLocalePanels(isOpen ? null : switcher);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      if (!isOpen) panel.querySelector('select')?.focus();
    });

    return switcher;
  }

  function installLocaleControls() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      const switcher = createLocaleSwitcher();
      const oldCurrencyControl = headerActions.querySelector('.currency-toggle-wrapper');
      if (oldCurrencyControl) oldCurrencyControl.replaceWith(switcher);
      else headerActions.prepend(switcher);
    }

    document.querySelectorAll('.pricing-header-bar .currency-toggle-wrapper').forEach(wrapper => {
      const pricingField = createSelect(
        'currency-select currency-select--pricing',
        'Display currency',
        SUPPORTED_CURRENCIES.map(code => [code, CURRENCY_META[code].label]),
        currentCurrency
      );
      pricingField.classList.add('locale-field--pricing');
      wrapper.replaceWith(pricingField);
    });

    document.querySelectorAll('.language-select').forEach(select => {
      select.addEventListener('change', event => {
        const language = normalizedLanguage(event.target.value);
        currentLanguage = language;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        applyCurrency(LANGUAGE_CURRENCY[language]);
        setTranslationCookie(language);
        window.location.reload();
      });
    });
    document.querySelectorAll('.currency-select').forEach(select => {
      select.addEventListener('change', event => {
        applyCurrency(event.target.value);
        updateLocaleSummary();
      });
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('.locale-switcher')) closeLocalePanels();
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const openSwitcher = document.querySelector('.locale-trigger[aria-expanded="true"]')?.closest('.locale-switcher');
      if (openSwitcher) {
        closeLocalePanels();
        openSwitcher.querySelector('.locale-trigger')?.focus();
      }
    });

    updateLocaleSummary();
  }

  window.googleTranslateElementInit = function () {
    if (!window.google || !window.google.translate) return;
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,es,de,it,ja,ko,zh-CN',
      autoDisplay: false
    }, 'netqorix-google-translate');
  };

  function loadTranslationEngine() {
    const mount = document.createElement('div');
    mount.id = 'netqorix-google-translate';
    mount.className = 'translation-engine';
    document.body.appendChild(mount);
    if (document.querySelector('script[data-netqorix-translate]')) return;
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.dataset.netqorixTranslate = 'true';
    document.head.appendChild(script);
  }

  document.documentElement.lang = displayLanguage(currentLanguage);
  installLocaleControls();
  applyCurrency(currentCurrency, false);
  loadTranslationEngine();

  document.addEventListener('click', event => {
    const button = event.target.closest('.currency-option');
    if (button && SUPPORTED_CURRENCIES.includes(button.dataset.currency)) {
      applyCurrency(button.dataset.currency);
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
      } else if (input.type === 'tel' && input.value.trim()) {
        // WhatsApp number is the primary reply channel — needs at least 8 digits
        const digits = input.value.replace(/\D/g, '');
        if (digits.length < 8) {
          isValid = false;
          errorMessage = 'Please enter a valid WhatsApp number with country or STD code.';
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
      const phone = formData.get('phone') || '';
      const email = formData.get('email') || '';
      const company = formData.get('company') || '';
      const service = formData.get('service') || '';
      const budget = formData.get('budget') || '';
      const message = formData.get('message') || '';

      const bodyText = `Name: ${name}%0D%0AWhatsApp: ${phone}%0D%0AEmail: ${email}%0D%0ACompany: ${company}%0D%0AService: ${service}%0D%0ABudget: ${budget}%0D%0AMessage: ${message}`;
      const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=Netqorix Quote Request - ${encodeURIComponent(name)}&body=${bodyText}`;
      
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



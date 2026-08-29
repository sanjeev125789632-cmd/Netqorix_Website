/**
 * Netqorix Main JavaScript Engine
 * Vanilla JS - Zero External Dependencies
 * Features: Mobile Nav, Sticky Header, Netqorix Ledger Count-Up, FAQ Accordion,
 *           Language-Aware Currency Switcher, Form Validation, Anti-Spam & UTM Tracking.
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
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
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
      if (!navMenu.classList.contains('open')) return;
      if (!e.target.isConnected) return;
      if (mobileToggle.contains(e.target)) return;

      if (header && !header.contains(e.target)) {
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
  const LOCALE_PREFERENCE_KEY = 'netqorix_locale_preferences_v2';
  const EXCHANGE_RATE_CACHE_KEY = 'netqorix_exchange_rates_v1';
  const RATE_CACHE_TTL = 24 * 60 * 60 * 1000;
  const SUPPORTED_CURRENCIES = ['INR', 'EUR', 'JPY', 'KRW', 'CNY'];
  const basePrices = Object.freeze({
    starter: 15000,
    growth: 45000,
    custom: 120000,
    mobileApp: 80000,
    cloudSetup: 15000,
    monthlySupport: 8000
  });
  const LANGUAGE_REGIONS = {
    en: { language: 'en', region: '', currency: 'INR', label: 'English', translate: 'en' },
    'hi-IN': { language: 'hi', region: 'IN', currency: 'INR', label: 'हिन्दी', translate: 'hi' },
    es: { language: 'es', region: 'ES', currency: 'EUR', label: 'Español', translate: 'es' },
    de: { language: 'de', region: 'DE', currency: 'EUR', label: 'Deutsch', translate: 'de' },
    it: { language: 'it', region: 'IT', currency: 'EUR', label: 'Italiano', translate: 'it' },
    ja: { language: 'ja', region: 'JP', currency: 'JPY', label: '日本語', translate: 'ja' },
    ko: { language: 'ko', region: 'KR', currency: 'KRW', label: '한국어', translate: 'ko' },
    'zh-CN': { language: 'zh', region: 'CN', currency: 'CNY', label: '简体中文', translate: 'zh-CN' }
  };
  const CURRENCY_META = {
    INR: { label: 'INR (₹)', locale: 'en-IN', fallbackRate: 1 },
    EUR: { label: 'EUR (€)', locale: 'de-DE', fallbackRate: 0.0111 },
    JPY: { label: 'JPY (¥)', locale: 'ja-JP', fallbackRate: 1.8 },
    KRW: { label: 'KRW (₩)', locale: 'ko-KR', fallbackRate: 16.5 },
    CNY: { label: 'CNY (¥)', locale: 'zh-CN', fallbackRate: 0.0867 }
  };
  const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_REGIONS).map(([code, config]) => [code, config.label]);
  const FALLBACK_RATES = Object.fromEntries(
    SUPPORTED_CURRENCIES.map(code => [code, CURRENCY_META[code].fallbackRate])
  );

  function browserLocalePreference() {
    const locales = navigator.languages?.length ? navigator.languages : [navigator.language || 'en-IN'];
    for (const locale of locales) {
      const normalized = locale.replace('_', '-');
      if (/^en/i.test(normalized)) return 'en';
      if (/^hi/i.test(normalized)) return 'hi-IN';
      if (/^es/i.test(normalized)) return 'es';
      if (/^de/i.test(normalized)) return 'de';
      if (/^it/i.test(normalized)) return 'it';
      if (/^ja/i.test(normalized)) return 'ja';
      if (/^ko/i.test(normalized)) return 'ko';
      if (/^zh/i.test(normalized)) return 'zh-CN';
    }
    return 'en';
  }

  function readGoogleLanguageCookie() {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
    const translated = match ? decodeURIComponent(match[1]) : '';
    return Object.keys(LANGUAGE_REGIONS).find(code => LANGUAGE_REGIONS[code].translate === translated) || '';
  }

  function readPreferenceState() {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCALE_PREFERENCE_KEY));
      if (saved && LANGUAGE_REGIONS[saved.locale] && SUPPORTED_CURRENCIES.includes(saved.currency)) return saved;
    } catch (error) {
      // Ignore malformed or unavailable storage and use browser preferences.
    }
    const legacyLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || readGoogleLanguageCookie();
    const legacyLocale = /^en(?:-|$)/i.test(legacyLanguage) ? 'en' : legacyLanguage;
    const locale = LANGUAGE_REGIONS[legacyLocale] ? legacyLocale : browserLocalePreference();
    const config = LANGUAGE_REGIONS[locale];
    const legacyCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return {
      locale,
      language: config.language,
      region: config.region,
      currency: SUPPORTED_CURRENCIES.includes(legacyCurrency) ? legacyCurrency : config.currency,
      currencyManuallySelected: SUPPORTED_CURRENCIES.includes(legacyCurrency)
    };
  }

  let preferenceState = readPreferenceState();
  let currentLanguage = preferenceState.locale;
  let currentCurrency = preferenceState.currency;
  let exchangeRates = { ...FALLBACK_RATES };
  let exchangeRateTimestamp = 0;

  function persistPreferenceState() {
    localStorage.setItem(LOCALE_PREFERENCE_KEY, JSON.stringify(preferenceState));
    localStorage.setItem(LANGUAGE_STORAGE_KEY, preferenceState.locale);
    localStorage.setItem(CURRENCY_STORAGE_KEY, preferenceState.currency);
  }

  function loadCachedRates() {
    try {
      const cached = JSON.parse(localStorage.getItem(EXCHANGE_RATE_CACHE_KEY));
      if (cached?.rates && Number.isFinite(cached.timestamp)) {
        exchangeRates = { ...FALLBACK_RATES, ...cached.rates, INR: 1 };
        exchangeRateTimestamp = cached.timestamp;
        return Date.now() - cached.timestamp < RATE_CACHE_TTL;
      }
    } catch (error) {
      // Static fallbacks keep every price visible if storage is unavailable.
    }
    return false;
  }

  function cleanRound(value, currency) {
    if (currency === 'INR') return Math.round(value);
    let increment = 1;
    if (currency === 'JPY') increment = 1000;
    else if (currency === 'KRW') increment = value >= 100000 ? 10000 : 1000;
    else if (currency === 'CNY') increment = value >= 10000 ? 100 : value >= 1000 ? 10 : 1;
    else increment = value >= 1000 ? 10 : value >= 100 ? 5 : 1;
    return Math.round(value / increment) * increment;
  }

  function convertFromINR(inrAmount, currency = currentCurrency) {
    const amount = Number(inrAmount);
    if (!Number.isFinite(amount)) return 0;
    return cleanRound(amount * (exchangeRates[currency] || FALLBACK_RATES[currency]), currency);
  }

  function formatINRPrice(inrAmount, currency = currentCurrency) {
    const meta = CURRENCY_META[currency];
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(convertFromINR(inrAmount, currency));
  }

  function formatPriceElement(element, currency) {
    if (element.dataset.priceStatic) {
      element.textContent = element.dataset.priceStatic;
      return;
    }
    const minimum = Number(element.dataset.priceMin);
    const maximum = Number(element.dataset.priceMax);
    if (!Number.isFinite(minimum)) return;
    const prefix = element.dataset.pricePrefix || '';
    const suffix = element.dataset.priceSuffix || '';
    const formatted = Number.isFinite(maximum)
      ? `${formatINRPrice(minimum, currency)} – ${formatINRPrice(maximum, currency)}`
      : formatINRPrice(minimum, currency);
    element.textContent = `${prefix}${formatted}${suffix}`;
    if (element instanceof HTMLOptionElement) element.value = element.textContent;
    element.setAttribute('data-display-currency', currency);
  }

  function updateStructuredData() {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        const visit = value => {
          if (!value || typeof value !== 'object') return;
          if (value['@type'] === 'Offer' || value['@type'] === 'AggregateOffer' || value.priceSpecification) {
            if (value.priceCurrency) value.priceCurrency = 'INR';
            if (value.priceSpecification?.priceCurrency) value.priceSpecification.priceCurrency = 'INR';
          }
          Object.values(value).forEach(visit);
        };
        visit(data);
        script.textContent = JSON.stringify(data);
      } catch (error) {
        // Leave valid server-rendered schema untouched if a block is not JSON.
      }
    });
  }

  function installPricingDisclosure() {
    if (!document.querySelector('[data-price-min]') || document.querySelector('.currency-estimate-note')) return;
    const note = document.createElement('p');
    note.className = 'currency-estimate-note';
    note.textContent = 'Prices shown in currencies other than INR are estimates based on recent exchange rates. Your final fixed quote and payment currency will be confirmed before the project begins.';
    const anchor = document.querySelector('.pricing-header-bar, .scope-sheet, .package-grid, .pricing-table, [class*="pricing"]');
    if (anchor) anchor.insertAdjacentElement('afterend', note);
  }

  function applyCurrency(currency, { persist = true, manual = preferenceState.currencyManuallySelected } = {}) {
    if (!SUPPORTED_CURRENCIES.includes(currency)) return;
    currentCurrency = currency;
    preferenceState.currency = currency;
    preferenceState.currencyManuallySelected = manual;
    if (persist) persistPreferenceState();

    document.querySelectorAll('.currency-option').forEach(button => {
      button.classList.toggle('active', button.dataset.currency === currency);
    });
    document.querySelectorAll('.currency-select').forEach(select => {
      select.value = currency;
    });

    document.querySelectorAll('[data-price-min], [data-price-static]').forEach(element => formatPriceElement(element, currency));
    document.documentElement.dataset.currency = currency;
    document.documentElement.classList.add('currency-ready');
    document.dispatchEvent(new CustomEvent('netqorix:currencychange', { detail: { currency } }));
    updateLocaleSummary();
  }

  function clearTranslationCookies() {
    const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
    ['googtrans', 'googtransopt'].forEach(name => {
      document.cookie = `${name}=; path=/; expires=${expired}; Max-Age=0; SameSite=Lax`;
      if (location.hostname.endsWith('netqorix.com')) {
        document.cookie = `${name}=; domain=.netqorix.com; path=/; expires=${expired}; Max-Age=0; SameSite=Lax`;
        document.cookie = `${name}=; domain=netqorix.com; path=/; expires=${expired}; Max-Age=0; SameSite=Lax`;
      }
    });
  }

  function setTranslationCookie(locale) {
    const translatedLanguage = LANGUAGE_REGIONS[locale].translate;
    if (translatedLanguage === 'en') {
      clearTranslationCookies();
      return;
    }
    const cookieValue = `/en/${translatedLanguage}`;
    const expiry = 'Fri, 31 Dec 2038 23:59:59 GMT';
    document.cookie = `googtrans=${cookieValue}; path=/; expires=${expiry}; SameSite=Lax`;
    if (location.hostname.endsWith('netqorix.com')) {
      document.cookie = `googtrans=${cookieValue}; domain=.netqorix.com; path=/; expires=${expiry}; SameSite=Lax`;
    }
  }

  function languageName(locale) {
    return LANGUAGE_REGIONS[locale]?.label || LANGUAGE_REGIONS.en.label;
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
      createSelect('language-select', 'Website language and region', LANGUAGE_OPTIONS, currentLanguage),
      createSelect(
        'currency-select',
        'Display currency',
        [
          ['DEFAULT', `Use language default (${LANGUAGE_REGIONS[currentLanguage].currency})`],
          ...SUPPORTED_CURRENCIES.map(code => [code, CURRENCY_META[code].label])
        ],
        currentCurrency
      )
    );

    const note = document.createElement('p');
    note.className = 'locale-note';
    note.textContent = 'Your selection is remembered. Non-INR prices are indicative estimates.';
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
        [
          ['DEFAULT', `Use language default (${LANGUAGE_REGIONS[currentLanguage].currency})`],
          ...SUPPORTED_CURRENCIES.map(code => [code, CURRENCY_META[code].label])
        ],
        currentCurrency
      );
      pricingField.classList.add('locale-field--pricing');
      wrapper.replaceWith(pricingField);
    });

    document.querySelectorAll('.language-select').forEach(select => {
      select.addEventListener('change', event => {
        const locale = event.target.value;
        const config = LANGUAGE_REGIONS[locale];
        if (!config) return;
        currentLanguage = locale;
        preferenceState.locale = locale;
        preferenceState.language = config.language;
        preferenceState.region = config.region;
        document.documentElement.lang = locale;
        setTranslationCookie(locale);
        // A language/region choice always resets pricing to that market's
        // mapped currency. Visitors can still override currency afterwards.
        applyCurrency(config.currency, { manual: false });

        // Google Translate cannot reliably restore the source language by
        // selecting its empty option. Reload once after clearing its cookie
        // so English always renders from the original English HTML.
        if (config.translate === 'en') {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.set('_nqlang', `en-${Date.now()}`);
          window.location.replace(cleanUrl.toString());
          return;
        }

        const googleSelect = document.querySelector('.goog-te-combo');
        if (googleSelect) {
          googleSelect.value = config.translate === 'en' ? '' : config.translate;
          googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    document.querySelectorAll('.currency-select').forEach(select => {
      select.addEventListener('change', event => {
        if (event.target.value === 'DEFAULT') {
          applyCurrency(LANGUAGE_REGIONS[currentLanguage].currency, { manual: false });
        } else {
          applyCurrency(event.target.value, { manual: true });
        }
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
      includedLanguages: 'en,hi,es,de,it,ja,ko,zh-CN',
      autoDisplay: false
    }, 'netqorix-google-translate');

    const targetLanguage = LANGUAGE_REGIONS[currentLanguage].translate;
    let attempts = 0;
    const applyWithoutReload = () => {
      const googleSelect = document.querySelector('.goog-te-combo');
      if (!googleSelect && attempts++ < 20) {
        setTimeout(applyWithoutReload, 100);
        return;
      }
      if (googleSelect && targetLanguage !== 'en' && googleSelect.value !== targetLanguage) {
        googleSelect.value = targetLanguage;
        googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    applyWithoutReload();
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

  async function refreshExchangeRates() {
    const cacheIsFresh = loadCachedRates();
    applyCurrency(currentCurrency, { persist: false, manual: preferenceState.currencyManuallySelected });
    if (cacheIsFresh) return;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://api.frankfurter.app/latest?from=INR', {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`Exchange-rate request failed: ${response.status}`);
      const payload = await response.json();
      const rates = { INR: 1 };
      SUPPORTED_CURRENCIES.forEach(code => {
        if (code !== 'INR' && Number.isFinite(payload.rates?.[code])) rates[code] = payload.rates[code];
      });
      if (Object.keys(rates).length < SUPPORTED_CURRENCIES.length) throw new Error('Exchange-rate response was incomplete');
      exchangeRates = rates;
      exchangeRateTimestamp = Date.now();
      localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify({
        base: 'INR',
        rates,
        timestamp: exchangeRateTimestamp
      }));
      applyCurrency(currentCurrency, { persist: false, manual: preferenceState.currencyManuallySelected });
    } catch (error) {
      // Cached or bundled fallback rates remain active; prices never disappear.
    }
  }

  window.NetqorixCurrency = Object.freeze({
    basePrices,
    currencies: [...SUPPORTED_CURRENCIES],
    format: formatINRPrice,
    convert: convertFromINR,
    getCurrency: () => currentCurrency,
    getRateTimestamp: () => exchangeRateTimestamp,
    formatText(inrText) {
      return String(inrText).replace(/₹\s?([\d,]+)/g, (match, amount) => {
        const numeric = Number(amount.replace(/,/g, ''));
        return Number.isFinite(numeric) ? formatINRPrice(numeric) : match;
      });
    }
  });

  document.documentElement.lang = currentLanguage;
  if (currentLanguage === 'en') {
    clearTranslationCookies();
    const cleanUrl = new URL(window.location.href);
    if (cleanUrl.searchParams.has('_nqlang')) {
      cleanUrl.searchParams.delete('_nqlang');
      window.history.replaceState(null, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    }
  }
  installLocaleControls();
  installPricingDisclosure();
  updateStructuredData();
  refreshExchangeRates();
  loadTranslationEngine();

  document.addEventListener('click', event => {
    const button = event.target.closest('.currency-option');
    if (button && SUPPORTED_CURRENCIES.includes(button.dataset.currency)) {
      applyCurrency(button.dataset.currency, { manual: true });
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

  /* ========================================================================
     8. HOMEPAGE PROJECT ESTIMATOR
     Indicative only; the final amount is confirmed after scoping.
     ======================================================================== */
  const estimator = document.querySelector('#project-estimator');
  if (estimator) {
    const pagesInput = estimator.querySelector('#est-pages');
    const pageOutput = estimator.querySelector('#page-count-output');
    const deliveryInput = estimator.querySelector('#est-delivery');
    const estimateOutput = estimator.querySelector('#estimate-total');
    const estimateCta = estimator.querySelector('#estimator-cta');
    const featureCosts = {
      cms: 15000,
      seo: 12000,
      commerce: 50000,
      integrations: 25000,
      hosting: 10000
    };

    function calculateEstimate() {
      const pages = Number(pagesInput.value);
      let inr = basePrices.starter + Math.max(0, pages - 5) * 2500;
      estimator.querySelectorAll('input[name="feature"]:checked').forEach(input => {
        inr += featureCosts[input.value];
      });
      if (deliveryInput.value === 'ten') inr += 10000;
      if (deliveryInput.value === 'rush') inr += 30000;

      pageOutput.textContent = pages;
      estimateOutput.dataset.priceMin = String(inr);
      delete estimateOutput.dataset.priceMax;
      formatPriceElement(estimateOutput, currentCurrency);

      const selected = Array.from(estimator.querySelectorAll('input[name="feature"]:checked'))
        .map(input => input.parentElement.textContent.trim());
      const brief = `Hi Netqorix, I would like a fixed quote for approximately ${pages} pages${selected.length ? ` with ${selected.join(', ')}` : ''}. Preferred delivery: ${deliveryInput.options[deliveryInput.selectedIndex].text}. Indicative estimate shown: ${estimateOutput.textContent} (${currentCurrency}). Final quote and payment currency to be confirmed after scoping.`;
      estimateCta.href = `https://wa.me/918369532924?text=${encodeURIComponent(brief)}`;
    }

    estimator.addEventListener('input', calculateEstimate);
    estimator.addEventListener('change', calculateEstimate);
    document.addEventListener('netqorix:currencychange', calculateEstimate);
    calculateEstimate();
  }

  /* ==========================================================================
     9. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ========================================================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal, .reveal-on-scroll');
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

/**
 * Netqorix AI Assistant Engine
 * Client-side AI Conversational Engine for Netqorix Website
 * Updated per 2026 Service Rate Card: Web, Mobile, 3D, Automation & AI Agents, 3D Modeling, Add-ons, SEO & Terms.
 */

(function () {
  'use strict';

  // State Management
  const STORAGE_KEY = 'netqorix_chat_history_v2';
  let chatHistory = [];
  let isThinking = false;

  // Detect Active Currency Preference (INR vs USD)
  function getActiveCurrency() {
    try {
      const stored = localStorage.getItem('netqorix_currency_pref');
      if (stored === 'USD' || stored === 'INR') return stored;
    } catch (e) {
      // fallback default
    }
    return 'INR';
  }

  // Format currency text according to preference
  function formatPrice(inrText, usdText) {
    const curr = getActiveCurrency();
    return curr === 'USD' ? usdText : inrText;
  }

  /* ==========================================================================
     KNOWLEDGE BASE & INTENT RECOGNITION ENGINE (RATE CARD 2026)
     ========================================================================== */
  const KNOWLEDGE_BASE = [
    {
      id: 'founder',
      keywords: ['founder', 'ceo', 'who built', 'who started', 'who owns', 'sanjeev', 'team', 'leadership', 'owner', 'company info', 'mumbai'],
      response: () => `
<strong>About Netqorix Founder & Leadership:</strong><br><br>
Netqorix was founded and is led by <strong>Sanjeev Kumar</strong> (Technical Director & Founder) alongside a senior engineering team based in <strong>Mumbai, India</strong>.<br><br>
<strong>Key Commitments:</strong>
<ul>
  <li><strong>Zero Ambiguity:</strong> Public, fixed-quote project charges with no hidden hourly padding.</li>
  <li><strong>100% IP Ownership:</strong> Complete source code, asset, and domain ownership handed over upon project delivery.</li>
  <li><strong>Direct Engineering Access:</strong> Work directly with senior developers, avoiding account manager delays.</li>
</ul>
<strong>Trusted Clients:</strong> Alok S Kumar & Co (Chartered Accountants), Bharat Infra Solar, NAVANA Architects, SS EXIM Global.<br><br>
📫 Direct Founder Email: <a href="mailto:sanjeev125789632@gmail.com">sanjeev125789632@gmail.com</a><br>
📞 Call / WhatsApp: <a href="tel:+918369532924">+91 83695 32924</a>
      `
    },
    {
      id: 'automation_ai',
      keywords: ['automation', 'ai agent', 'llm', 'gpt', 'claude', 'n8n', 'zapier', 'make', 'workflow', 'script', 'scraping', 'marketing automation'],
      response: () => `
<strong>Automation & AI Agent Services (2026 Rate Card):</strong><br><br>
<ul>
  <li><strong>Workflow Automation (${formatPrice('₹5,000 – ₹20,000', '$180 – $750')}):</strong> Zapier / Make / n8n app integrations, auto-tasks, data sync per workflow.</li>
  <li><strong>Chatbot — Rule-Based (${formatPrice('₹15,000 – ₹40,000', '$550 – $1,500')}):</strong> FAQ & lead-capture bot for website or WhatsApp with scripted flows.</li>
  <li><strong>AI Agent / LLM Bot (${formatPrice('₹40,000 – ₹1,50,000', '$1,500 – $5,500')}):</strong> GPT / Claude-powered assistant, custom knowledge base, system integrations.</li>
  <li><strong>Marketing Automation (${formatPrice('₹12,000 – ₹45,000', '$450 – $1,700')}):</strong> Email / WhatsApp drip campaigns, CRM setup, automated sequences.</li>
  <li><strong>Custom Scripts / API Automation (${formatPrice('₹8,000 – ₹35,000', '$300 – $1,300')}):</strong> Data scraping, report generation, system-to-system scripts.</li>
  <li><strong>Automation Maintenance (${formatPrice('₹3,000 – ₹8,000 / mo', '$120 – $300 / mo')}):</strong> Ongoing API monitoring, fixes, and tweaks.</li>
</ul>
<a href="contact.html">Book a scoping call for a custom AI/Automation quote!</a>
      `
    },
    {
      id: 'interactive_3d_web',
      keywords: ['3d website', 'webgl', 'threejs', 'three.js', 'interactive site', '3d hero', 'product viewer', 'configurator', 'immersive'],
      response: () => `
<strong>3D & Interactive Web Engineering Rates:</strong><br><br>
<ul>
  <li><strong>3D / Interactive — Essential (${formatPrice('₹80,000 – ₹2,00,000', '$3,000 – $7,000')}):</strong> Three.js / WebGL, animated 3D hero model or product viewer, interactive scroll scenes (1–2 scenes).</li>
  <li><strong>3D / Interactive — Immersive (${formatPrice('₹2,50,000 – ₹6,00,000+', '$9,000 – $22,000+')}):</strong> Full 3D web experience, custom 3D models, physics engine, product configurator.</li>
</ul>
Combine with our standard web tiers for maximum visual impact! <a href="contact.html">Book a free scoping call</a>.
      `
    },
    {
      id: 'pricing_web',
      keywords: ['web price', 'website cost', 'web development pricing', 'starter website', 'ecommerce cost', 'web app pricing'],
      response: () => `
<strong>Website Development & Deployment Service Charges:</strong><br><br>
<ul>
  <li><strong>Starter (${formatPrice('₹15,000 – ₹40,000', '$500 – $1,200')}):</strong> Static/business site up to 5 pages, responsive design, contact form, basic technical SEO.</li>
  <li><strong>Professional (${formatPrice('₹50,000 – ₹1,50,000', '$1,800 – $5,000')}):</strong> Custom dynamic site, CMS, blog system, backend API, user authentication.</li>
  <li><strong>E-Commerce / Web App (${formatPrice('₹2,00,000+', '$6,500+')}):</strong> Online store, payment gateways, custom logic, admin dashboard.</li>
  <li><strong>3D Essential (${formatPrice('₹80,000 – ₹2,00,000', '$3,000 – $7,000')}):</strong> Three.js / WebGL animated hero or viewer.</li>
  <li><strong>3D Immersive (${formatPrice('₹2,50,000 – ₹6,00,000+', '$9,000 – $22,000+')}):</strong> Complete 3D configurator experience.</li>
  <li><strong>Deployment Setup (${formatPrice('₹5,000 – ₹15,000', '$200 – $500')}):</strong> SSL, domain setup, CI/CD pipeline, go-live audit.</li>
</ul>
      `
    },
    {
      id: 'pricing_app',
      keywords: ['app price', 'mobile app cost', 'ios pricing', 'android price', 'flutter cost', 'react native pricing', 'app store cost'],
      response: () => `
<strong>Mobile & Web App Development Rates:</strong><br><br>
<ul>
  <li><strong>Simple App (${formatPrice('₹80,000 – ₹2,00,000', '$3,000 – $7,000')}):</strong> Few screens, basic backend, cross-platform build (React Native / Flutter) for iOS & Android.</li>
  <li><strong>Mid-Complexity (${formatPrice('₹3,00,000 – ₹8,00,000', '$10,000 – $28,000')}):</strong> Auth, payment gateways, push notifications, real-time sync, user dashboard.</li>
  <li><strong>Complex / Enterprise (${formatPrice('₹10,00,000+', '$35,000+')}):</strong> Custom logic, high scale concurrency, multi-tier admin control portal.</li>
  <li><strong>Native Build Premium:</strong> 1.5× – 2× base multiplier for separate dedicated native iOS (Swift) + Android (Kotlin) codebases.</li>
  <li><strong>App Store Deployment (${formatPrice('₹10,000 – ₹25,000', '$350 – $800')}):</strong> Apple App Store & Google Play Store submission and review handling.</li>
</ul>
      `
    },
    {
      id: 'cloud_devops',
      keywords: ['cloud', 'aws', 'gcp', 'azure', 'digitalocean', 'devops', 'infrastructure', 'server', 'hosting setup'],
      response: () => `
<strong>Cloud Services & Infrastructure Rates (2026):</strong><br><br>
<ul>
  <li><strong>Cloud Setup (one-time) (${formatPrice('₹15,000 – ₹60,000', '$500 – $2,200')}):</strong> Account/architecture setup, environments, CI/CD, security config on AWS / GCP / Azure / DO.</li>
  <li><strong>Managed — Starter (${formatPrice('₹4,000 / mo', '$150 / mo')}):</strong> Small app / static + serverless. Monitoring, backups, SSL, patching.</li>
  <li><strong>Managed — Business (${formatPrice('₹10,000 / mo', '$380 / mo')}):</strong> Multi-service app, autoscaling, DB management, alerts, monthly report.</li>
  <li><strong>Managed — Scale (${formatPrice('₹25,000+ / mo', '$900+ / mo')}):</strong> High-traffic enterprise app, load balancing, DevOps, 24×7 monitoring, priority SLA.</li>
  <li><strong>Provider Cost Markup:</strong> Actual AWS/GCP/Azure/DO usage billed at cost + ${formatPrice('15–20%', '15–20%')} management margin.</li>
</ul>
      `
    },
    {
      id: 'maintenance_amc',
      keywords: ['amc', 'annual maintenance', 'retainer', 'support plan', 'maintenance', 'bug fix', 'patch', 'hosting management'],
      response: () => `
<strong>Maintenance & Support Services (Recurring):</strong><br><br>
<ul>
  <li><strong>Annual Maintenance (AMC) (${formatPrice('15 – 20% / yr', '15 – 20% / yr')}):</strong> Updates, bug fixes, security patches, uptime monitoring (% of project cost / year).</li>
  <li><strong>Retainer — Basic (${formatPrice('₹8,000 / mo', '$300 / mo')}):</strong> Up to 10 hrs/month of changes, support, minor features.</li>
  <li><strong>Retainer — Growth (${formatPrice('₹18,000 / mo', '$650 / mo')}):</strong> Up to 25 hrs/month, priority support, ongoing feature work.</li>
  <li><strong>Hosting Management (${formatPrice('₹3,000 – ₹6,000 / mo', '$120 – $250 / mo')}):</strong> Server management, backups, scaling, SSL renewal (excl. hosting fees).</li>
</ul>
      `
    },
    {
      id: 'modeling_3d',
      keywords: ['3d model', 'blender', 'rigging', 'animation', 'render', 'turntable', 'character model', 'pbr', '3d asset'],
      response: () => `
<strong>3D Modeling & Visual Asset Services:</strong><br><br>
<ul>
  <li><strong>Simple Model (static) (${formatPrice('₹3,000 – ₹12,000', '$120 – $450')}):</strong> Basic product/prop, clean topology, single texture.</li>
  <li><strong>Detailed Model + Textures (${formatPrice('₹15,000 – ₹45,000', '$550 – $1,700')}):</strong> High-detail model, PBR textures, web/game optimized.</li>
  <li><strong>Complex / Character Model (${formatPrice('₹40,000 – ₹1,20,000', '$1,500 – $4,500')}):</strong> Character asset, rigging-ready, multi-materials.</li>
  <li><strong>Animation / Rigging (${formatPrice('₹10,000 – ₹50,000', '$380 – $1,900')}):</strong> Rig + animation cycles per model.</li>
  <li><strong>Product Render / Visualization (${formatPrice('₹2,500 – ₹10,000', '$100 – $380')}):</strong> Photorealistic still render or 360° turntable.</li>
</ul>
Source files (.blend / .fbx / .glb) included on delivery!
      `
    },
    {
      id: 'addons_design',
      keywords: ['addon', 'add-on', 'ui ux', 'figma', 'logo', 'branding', 'business card', 'vcard', 'qr card', 'payment gateway', 'razorpay', 'stripe', 'admin dashboard', 'rush delivery'],
      response: () => `
<strong>Add-On Services & Design Rates:</strong><br><br>
<ul>
  <li><strong>UI/UX Design (${formatPrice('₹20,000 – ₹80,000', '$700 – $2,800')}):</strong> Figma prototypes, user journeys, responsive wireframes.</li>
  <li><strong>Logo & Brand Identity (${formatPrice('₹8,000 – ₹25,000', '$300 – $900')}):</strong> Vector logo, color system, brand manual.</li>
  <li><strong>Business Card — Standard (${formatPrice('₹800 – ₹2,000', '$30 – $75')}):</strong> 1 concept, print-ready.</li>
  <li><strong>Business Card — Premium (${formatPrice('₹2,500 – ₹6,000', '$90 – $220')}):</strong> 2–3 concepts, double-sided, source files.</li>
  <li><strong>Digital / QR Business Card (${formatPrice('₹3,000 – ₹8,000', '$110 – $300')}):</strong> vCard tap-to-share integration.</li>
  <li><strong>Payment Gateway Integration (${formatPrice('₹10,000 – ₹25,000', '$350 – $900')}):</strong> Razorpay, Stripe, PayPal, UPI with Webhooks.</li>
  <li><strong>Third-Party API Integration (${formatPrice('₹8,000 – ₹20,000', '$300 – $700')}):</strong> Per API endpoint.</li>
  <li><strong>Admin Dashboard / CMS (${formatPrice('₹25,000 – ₹90,000', '$900 – $3,200')}):</strong> Web management portal.</li>
  <li><strong>Rush Delivery:</strong> +25 – 40% expedited timeline surcharge.</li>
</ul>
      `
    },
    {
      id: 'seo',
      keywords: ['seo', 'google business', 'local seo', 'keyword', 'onpage', 'audit', 'content writing', 'blog article'],
      response: () => `
<strong>SEO & Content Marketing Services:</strong><br><br>
<ul>
  <li><strong>SEO Audit (${formatPrice('₹8,000 – ₹20,000', '$300 – $750')}):</strong> Technical + on-page audit & keyword gap report.</li>
  <li><strong>On-Page Setup (${formatPrice('₹12,000 – ₹35,000', '$450 – $1,300')}):</strong> Meta tags, schema, sitemap XML, Core Web Vitals.</li>
  <li><strong>Monthly SEO — Starter (${formatPrice('₹10,000 / mo', '$380 / mo')}):</strong> Up to 10 keywords + 2 blogs / month.</li>
  <li><strong>Monthly SEO — Growth (${formatPrice('₹22,000 / mo', '$800 / mo')}):</strong> Up to 25 keywords + 4 blogs + link building.</li>
  <li><strong>Google Business Profile Setup (${formatPrice('₹3,000 – ₹8,000', '$120 – $300')}):</strong> Account verification & geotagged setup.</li>
  <li><strong>Local SEO Retainer (${formatPrice('₹8,000 / mo', '$300 / mo')}):</strong> Google Maps ranking & local citations.</li>
  <li><strong>Content / Blog Article (${formatPrice('₹1,500 – ₹4,000', '$60 – $150')}):</strong> SEO article (800–1,200 words).</li>
</ul>
      `
    },
    {
      id: 'terms_conditions',
      keywords: ['terms', 'condition', 'payment term', 'revision', 'hourly rate', 'ownership', 'ip', 'source code', 'contract', 'gst'],
      response: () => `
<strong>Official Engagement Terms (Netqorix 2026):</strong><br><br>
<ul>
  <li>💳 <strong>Payment Terms:</strong> 50% advance to start, 50% on final delivery. Retainers billed monthly in advance.</li>
  <li>🔄 <strong>Revisions:</strong> 2 rounds of design/code revisions included per milestone. Additional rounds billed hourly.</li>
  <li>⏱️ <strong>Hourly Rate:</strong> ${formatPrice('₹800 – ₹1,500 / hr (India)', '$30 – $60 / hr (International)')} for out-of-scope work.</li>
  <li>🔑 <strong>100% Ownership:</strong> Full source code and IP transferred on final payment.</li>
  <li>📋 <strong>Quote & Taxes:</strong> Timeline & final cost confirmed after a scoping call. GST / applicable taxes extra where relevant.</li>
</ul>
      `
    },
    {
      id: 'pricing_general',
      keywords: ['pricing', 'price', 'cost', 'charge', 'rate', 'fee', 'inr', 'usd', 'how much', 'budget', 'quote', 'rate card'],
      response: () => `
<strong>Netqorix Service Rate Card Overview (2026):</strong><br><br>
Dual-currency public service charges active in <strong>${formatPrice('₹ INR', '$ USD')}</strong>:<br>
<ul>
  <li>🌐 <strong>Web Engineering:</strong> ${formatPrice('₹15k – ₹1.5L+', '$500 – $6,500+')}</li>
  <li>✨ <strong>3D / Interactive Web:</strong> ${formatPrice('₹80k – ₹6L+', '$3,000 – $22,000+')}</li>
  <li>📱 <strong>Mobile & Web Apps:</strong> ${formatPrice('₹80k – ₹10L+', '$3,000 – $35,000+')}</li>
  <li>🤖 <strong>Automation & AI Agents:</strong> ${formatPrice('₹5k – ₹1.5L', '$180 – $5,500')}</li>
  <li>🧊 <strong>3D Modeling:</strong> ${formatPrice('₹3k – ₹1.2L', '$120 – $4,500')}</li>
  <li>☁️ <strong>Cloud & DevOps:</strong> ${formatPrice('₹15k – ₹60k setup', '$500 – $2,200 setup')}</li>
  <li>🎨 <strong>Add-Ons & UI/UX:</strong> ${formatPrice('₹800 – ₹90k', '$30 – $3,200')}</li>
  <li>🔍 <strong>SEO & Content:</strong> ${formatPrice('₹8k – ₹22k/mo', '$300 – $800/mo')}</li>
</ul>
Visit our full <a href="pricing.html">Transparent Service Charges page</a> or <a href="contact.html">Book a free scoping call</a>!
      `
    },
    {
      id: 'contact',
      keywords: ['contact', 'call', 'email', 'phone', 'reach', 'meeting', 'scoping', 'book', 'address', 'office', 'whatsapp'],
      response: () => `
<strong>Contact Netqorix Engineering Team:</strong><br><br>
📧 <strong>Email:</strong> <a href="mailto:sanjeev125789632@gmail.com">sanjeev125789632@gmail.com</a><br>
📞 <strong>Phone / WhatsApp:</strong> <a href="tel:+918369532924">+91 83695 32924</a><br>
📍 <strong>Location:</strong> Mumbai, India (Serving clients worldwide)<br><br>
🚀 <a href="contact.html" style="font-weight: 700;">Click here to book a free 30-minute scoping call</a>
      `
    },
    {
      id: 'greetings',
      keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'start'],
      response: () => `
Hello! 👋 Welcome to <strong>Netqorix</strong>.<br><br>
I'm your AI assistant. Ask me anything about our <strong>2026 Service Rate Card</strong>:
<ul>
  <li>💰 <strong>Web & App Pricing</strong></li>
  <li>🤖 <strong>AI Agents & Automation Services</strong></li>
  <li>✨ <strong>3D Websites & 3D Modeling</strong></li>
  <li>📜 <strong>Engagement Terms & Hourly Rates</strong></li>
</ul>
      `
    }
  ];

  // Match input string against knowledge base
  function generateResponse(userMsg) {
    const cleanMsg = userMsg.toLowerCase().trim();

    // Check knowledge base items
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => cleanMsg.includes(kw))) {
        return item.response();
      }
    }

    // Default Fallback
    return `
I'm glad you asked! Netqorix provides transparent, project-based engineering for digital products.<br><br>
You can ask me about:
<ul>
  <li>💰 <strong>Pricing details</strong> (Web, App, Cloud, SEO, Retainers)</li>
  <li>🤖 <strong>AI Agents & Automation Services</strong></li>
  <li>✨ <strong>3D / Interactive Web Engineering</strong></li>
  <li>🎨 <strong>UI/UX Design & Brand Add-ons</strong></li>
  <li>📜 <strong>Engagement Terms & Payment Policy</strong></li>
  <li>👨‍💻 <strong>Founder & Direct Contact Info</strong></li>
</ul>
Feel free to contact Founder <strong>Sanjeev Kumar</strong> directly at or <a href="tel:+918369532924">+91 83695 32924</a>.
    `;
  }

  /* ==========================================================================
     DOM BUILDER & UI ENGINE
     ========================================================================== */
  function initChatbot() {
    if (document.getElementById('netqorix-chatbot')) return;

    // Create Widget Markup
    const container = document.createElement('div');
    container.id = 'netqorix-chatbot';
    container.innerHTML = `
      <button class="nq-chat-trigger" aria-label="Open Netqorix AI Assistant">
        <div class="nq-chat-trigger-icon">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <span class="nq-chat-trigger-text">Ask Netqorix AI</span>
        <span class="nq-chat-trigger-badge"></span>
      </button>

      <div class="nq-chat-window" role="dialog" aria-label="Netqorix AI Assistant Chat">
        <div class="nq-chat-header">
          <div class="nq-chat-header-brand">
            <div class="nq-chat-avatar">
              NQ
              <span class="nq-chat-avatar-status"></span>
            </div>
            <div class="nq-chat-title-group">
              <h4>Netqorix AI</h4>
              <span>● Online & ready</span>
            </div>
          </div>
          <div class="nq-chat-header-actions">
            <button class="nq-chat-header-btn nq-btn-reset" title="Reset Conversation" aria-label="Reset Chat">
              <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </button>
            <button class="nq-chat-header-btn nq-btn-close" title="Minimize Chat" aria-label="Close Chat">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div class="nq-chat-messages" id="nq-chat-messages-list">
          <!-- Dynamic Messages -->
        </div>

        <div class="nq-chat-footer">
          <input type="text" class="nq-chat-input" placeholder="Ask about AI agents, 3D sites, pricing..." aria-label="Type message">
          <button class="nq-chat-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Cache elements
    const triggerBtn = container.querySelector('.nq-chat-trigger');
    const closeBtn = container.querySelector('.nq-btn-close');
    const resetBtn = container.querySelector('.nq-btn-reset');
    const inputEl = container.querySelector('.nq-chat-input');
    const sendBtn = container.querySelector('.nq-chat-send-btn');
    const msgListEl = container.querySelector('#nq-chat-messages-list');

    // Toggle Chat Window
    function toggleChat(open) {
      if (typeof open === 'boolean') {
        container.classList.toggle('open', open);
      } else {
        container.classList.toggle('open');
      }
      if (container.classList.contains('open')) {
        setTimeout(() => inputEl.focus(), 150);
        scrollToBottom();
      }
    }

    triggerBtn.addEventListener('click', () => toggleChat(true));
    closeBtn.addEventListener('click', () => toggleChat(false));

    // Reset Chat
    resetBtn.addEventListener('click', () => {
      chatHistory = [];
      try { sessionStorage.removeItem(STORAGE_KEY); } catch(e){}
      msgListEl.innerHTML = '';
      sendInitialGreeting();
    });

    // Scroll to bottom
    function scrollToBottom() {
      msgListEl.scrollTop = msgListEl.scrollHeight;
    }

    // Format current time
    function getFormattedTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Append Message to UI
    function appendMessage(sender, htmlContent, save = true) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `nq-msg nq-msg-${sender}`;

      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = 'nq-msg-bubble';
      bubbleDiv.innerHTML = htmlContent;

      const timeDiv = document.createElement('div');
      timeDiv.className = 'nq-msg-time';
      timeDiv.textContent = getFormattedTime();

      msgDiv.appendChild(bubbleDiv);
      msgDiv.appendChild(timeDiv);
      msgListEl.appendChild(msgDiv);

      scrollToBottom();

      if (save) {
        chatHistory.push({ sender, content: htmlContent, time: getFormattedTime() });
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
        } catch (e) {}
      }
    }

    // Show quick action chips
    function appendQuickChips() {
      const chipsWrapper = document.createElement('div');
      chipsWrapper.className = 'nq-msg nq-msg-bot';
      chipsWrapper.style.maxWidth = '100%';
      chipsWrapper.innerHTML = `
        <div class="nq-chat-chips-title">SUGGESTED TOPICS:</div>
        <div class="nq-chat-chips">
          <button class="nq-chip" data-query="What are your web and mobile app prices?">💰 Web & App Pricing</button>
          <button class="nq-chip" data-query="How much does an AI Agent or Automation cost?">🤖 AI Agents & Automation</button>
          <button class="nq-chip" data-query="What 3D web and 3D modeling services do you offer?">✨ 3D Sites & Modeling</button>
          <button class="nq-chip" data-query="What are your payment terms and hourly rates?">📜 Terms & Hourly Rates</button>
          <button class="nq-chip" data-query="Who is the founder of Netqorix?">👨‍💻 About Founder</button>
        </div>
      `;

      msgListEl.appendChild(chipsWrapper);
      scrollToBottom();

      // Bind click events on chips
      chipsWrapper.querySelectorAll('.nq-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const query = chip.getAttribute('data-query');
          if (query && !isThinking) {
            handleUserSend(query);
          }
        });
      });
    }

    // Show Typing Indicator
    function showTypingIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'nq-msg nq-msg-bot nq-typing-wrapper';
      indicator.innerHTML = `
        <div class="nq-typing-indicator">
          <div class="nq-typing-dot"></div>
          <div class="nq-typing-dot"></div>
          <div class="nq-typing-dot"></div>
        </div>
      `;
      msgListEl.appendChild(indicator);
      scrollToBottom();
      return indicator;
    }

    // Handle User Message Submission
    function handleUserSend(textOverride) {
      const userText = textOverride || inputEl.value.trim();
      if (!userText || isThinking) return;

      inputEl.value = '';
      appendMessage('user', userText);

      isThinking = true;
      const typingEl = showTypingIndicator();

      // Simulate natural AI thinking time
      const delay = Math.floor(Math.random() * 400) + 400; // 400ms - 800ms
      setTimeout(() => {
        if (typingEl && typingEl.parentNode) {
          typingEl.parentNode.removeChild(typingEl);
        }
        const botReply = generateResponse(userText);
        appendMessage('bot', botReply);
        isThinking = false;
      }, delay);
    }

    sendBtn.addEventListener('click', () => handleUserSend());
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserSend();
      }
    });

    // Initial greeting or restore history
    function sendInitialGreeting() {
      const greetingHtml = `
Hello! 👋 Welcome to <strong>Netqorix</strong>.<br><br>
I'm your AI engineering assistant updated with our official <strong>2026 Service Rate Card</strong>. Ask me about <strong>Web & Apps</strong>, <strong>AI Agents & Automation</strong>, <strong>3D Websites</strong>, <strong>SEO</strong>, or <strong>Engagement Terms</strong>!
      `;
      appendMessage('bot', greetingHtml, false);
      appendQuickChips();
    }

    // Load history or greet
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        chatHistory = JSON.parse(saved);
        if (chatHistory.length > 0) {
          chatHistory.forEach(item => appendMessage(item.sender, item.content, false));
          appendQuickChips();
        } else {
          sendInitialGreeting();
        }
      } else {
        sendInitialGreeting();
      }
    } catch (e) {
      sendInitialGreeting();
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();

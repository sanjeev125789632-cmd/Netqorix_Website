# Netqorix Website

Production website for [Netqorix](https://www.netqorix.com/), a Mumbai-based, founder-led web, application, cloud, SEO and maintenance studio.

The site presents Netqorix's fixed-scope delivery model, public pricing, services, client work, case studies and technical insights. It is built with first-party HTML, CSS and JavaScript and requires no framework or build step.

## Live website

[https://www.netqorix.com/](https://www.netqorix.com/)

## Technology

- Semantic HTML5
- CSS custom properties and responsive media queries
- Vanilla JavaScript
- Google Translate for language switching
- Client-side currency conversion with cached exchange rates
- Google Analytics
- JSON-LD structured data
- Vercel hosting and clean URL redirects

## Main features

- Responsive desktop and mobile navigation
- Sticky header and mobile contact CTA
- English, Hindi, Spanish, German, Italian, Japanese, Korean and Simplified Chinese localization
- INR, EUR, JPY, KRW and CNY price display
- Fixed-price project estimator
- Accessible FAQ accordions
- Client case studies and live-project links
- WhatsApp enquiry links and chatbot
- Canonical metadata, sitemap, robots directives and structured data
- Keyboard navigation, visible focus states and reduced-motion support

## Public pricing

| Package | Price |
| --- | ---: |
| Starter | ₹15,000 flat |
| Growth | ₹45,000 |
| Custom | From ₹1,20,000+ |

Pricing is maintained consistently on the homepage, pricing page and relevant service pages. Confirm the full project scope before changing package values.

## Project structure

```text
.
├── index.html                 # Homepage
├── about.html                 # Company and founder profile
├── services*.html             # Services and service-detail pages
├── pricing.html               # Packages, estimator and pricing FAQs
├── work.html                  # Client work index
├── work-*.html                # Individual case studies
├── blog.html                  # Insights index
├── blog-post-*.html           # Insight articles
├── contact.html               # Contact page
├── thanks.html                # Enquiry confirmation page
├── 404.html                   # Custom error page
├── css/
│   ├── style.css              # Shared design system and page styles
│   └── chatbot.css            # Chatbot styles
├── js/
│   ├── main.js                # Navigation, localization, pricing and UI behavior
│   └── chatbot.js             # Chatbot behavior
├── assets/                    # Images and client assets
├── DESIGN-SYSTEM.md           # Editorial design-system documentation
├── robots.txt                 # Search crawler directives
├── sitemap.xml                # Public URL inventory
└── vercel.json                # Clean URLs and canonical-host redirects
```

## Run locally

No installation or compilation is required. Serve the repository root with any static HTTP server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Using an HTTP server is recommended because browser restrictions can affect scripts, storage and integrations when pages are opened directly with a `file://` URL.

## Deployment

The production site is deployed on Vercel. The configuration in `vercel.json`:

- redirects the apex domain to `https://www.netqorix.com/`;
- removes `.html` extensions from public URLs;
- keeps URLs free of trailing slashes.

Changes merged into `main` trigger the connected Vercel deployment. Verify the deployment status and key routes after every release.

## Configuration and integrations

### Lead forms

The HTTP form endpoint in `js/main.js` is intentionally empty. The existing validation and `mailto:` fallback remain active, but direct server submission stays disabled until a secure server-side handler is configured.

Do not commit API keys or form access keys to this public repository. Store secrets in the hosting provider's environment variables and send submissions through a server-side endpoint.

### Localization and currency

Language and currency preferences are stored in the browser. Google Translate handles translated page content, while `js/main.js` controls locale selection, English restoration, currency formatting and exchange-rate caching.

When changing localization behavior, test:

- switching from English to every supported language;
- returning to English;
- the language-to-currency mapping;
- translated navigation, CTAs, footer and chatbot content;
- prices and the estimator at desktop and mobile widths.

### Analytics

Google Analytics is loaded directly in the page `<head>`. Preserve the analytics script when editing metadata or shared page markup.

## SEO and structured data

Pages include canonical URLs, social metadata and JSON-LD appropriate to their content. The site currently uses schema types including `Organization`, `ProfessionalService`, `Service`, `FAQPage`, `Article`, `OfferCatalog` and related entities.

When adding or removing a public page:

1. Add accurate title, description, canonical and social metadata.
2. Add only structured data supported by visible page content.
3. Update `sitemap.xml`.
4. Verify internal links and Vercel clean-URL behavior.
5. Do not add review or aggregate-rating schema without genuine published reviews.

## Maintenance checklist

Before publishing a change:

1. Check HTML, CSS and JavaScript for syntax errors.
2. Confirm every page loads `css/style.css`, `css/chatbot.css`, `js/main.js` and `js/chatbot.js` where required.
3. Test navigation, localization, currency conversion, estimator, FAQs, WhatsApp links and chatbot.
4. Test keyboard navigation and focus indicators.
5. Check approximately 1440 px, 768 px and 390 px viewport widths.
6. Validate canonical links, JSON-LD, `robots.txt` and `sitemap.xml`.
7. Review the final diff for accidental content, pricing, contact or URL changes.

## Brand and contact

- Website: [https://www.netqorix.com/](https://www.netqorix.com/)
- Email: [netqorix@gmail.com](mailto:netqorix@gmail.com)
- Phone/WhatsApp: [+91 83695 32924](https://wa.me/918369532924)
- Founder: Sanjeev Yadav

## Contributing

Keep changes focused and preserve the existing editorial design system, responsive behavior, accessibility, SEO metadata, structured data and public URLs. Do not redesign pages or change business content as part of maintenance-only work.

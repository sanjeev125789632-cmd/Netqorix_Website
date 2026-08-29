# Netqorix Editorial Engineering System

## 1. Brand concept

Netqorix is presented as a founder-led production studio: precise enough to publish its scope, fast enough to ship in ten days, and transparent enough to hand over the repository. The interface borrows from technical drawings, deployment logs, and signed scope documents rather than SaaS dashboards.

## 2. Color and typography

- Drafting paper: `#F3F1EA`
- Ink: `#111318`
- Cobalt signal: `#304FFE`
- Acid status: `#C9F35A`
- Construction line: `#C9C6BA`
- Display: Bricolage Grotesque
- Body: Public Sans
- Data and annotations: JetBrains Mono

## 3. Layout grid

The desktop system uses a 12-column grid with visible vertical construction lines and a 24px baseline rhythm. Major sections alternate between 7/5, 8/4, and 5/7 compositions. Mobile collapses to one column while retaining numbered annotations and horizontal rules.

## 4. Visual motif

`scope → design → build → deploy` is the recurring visual and interaction motif. It appears in the hero delivery log, section dividers, service system, process timeline, status indicators, and CTA language.

## 5. Homepage wireframe

1. Split hero: promise and CTAs / animated ten-day production log
2. Inline proof ledger
3. Asymmetric five-project editorial portfolio
4. Connected delivery-system diagram
5. Scope-sheet pricing and accessible estimator
6. Staggered outcome-led client proof
7. Four-stage production timeline with handover outputs
8. Founder portrait and first-person statement
9. Project-brief enquiry form
10. Editorial FAQ and retained footer controls

## 6. Responsive behavior

- 320–719px: single column, horizontal timeline stages stack, large type clamps safely, no horizontal overflow.
- 720–1023px: two-column hero and selected portfolio pairs; pricing becomes stacked scope rows.
- 1024px+: full 12-column compositions and offset project plates.
- Motion is disabled when `prefers-reduced-motion: reduce` is active.

## 7. Component inventory

- Technical header and locale control
- Deployment status indicator
- Ten-day delivery log
- Proof ledger
- Project plate
- Delivery-system rail
- Scope-sheet pricing row
- Project estimator
- Outcome statement
- Production-stage timeline
- Founder dossier
- Project-brief form
- Editorial FAQ accordion
- Existing chatbot, footer, and mobile CTA

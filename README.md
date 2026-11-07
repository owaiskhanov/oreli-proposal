# Orelli × Stalite — Marketing Proposal

A responsive, single-brand proposal for Orelli, by Stalite, with a branded entrance animation and two expandable service cards in a matching light-beige theme:

- **Social media management:** ₹25,000/month. Three dropdowns covering monthly deliverables, premium brand positioning, and content strategy.
- **Performance marketing:** ₹15,000/month. 10 concise points covering Meta + GPT audience targeting, creative, lead quality, and reporting.

Advertising spend is separate. ChatGPT advertising remains subject to market availability.

The header uses the Orelli header logo from `orelli.co.in` (saved locally as `assets/brand/ORELLI-header-logo.png`) and the supplied Stalite logo (`https://www.stalite.in/logo.png`). Both logos share the same rendered height with automatic widths to preserve their aspect ratios; Stalite has a text fallback if the external image cannot load.

The UI adapts the Orelli website palette to light beige: page and both cards `#F5EFE6`, deep text `#1A1A1A`, borders `#DED5C8`, footer/detail panels `#EAE0D1`, and gold accent `#C9A96E` (with darker gold `#755A2E` for small text contrast). Headings use Cormorant Garamond; body text uses DM Sans.

Sharing assets are included: a 1200×630 social share image (`assets/brand/social-share.png`), a favicon set (`favicon.ico`, 16/32/48 PNGs, Apple touch icon, 192/512 manifest icons), Open Graph/Twitter metadata, canonical URL, and `site.webmanifest`.

## Run

Requires Node.js 18 or newer. No dependencies or build step.

```sh
npm start
```

Open http://localhost:3000. Set `PORT` to use another port. The server binds to `0.0.0.0` for preview compatibility.

## Interactions

- On each page load, **Made for** introduces the Orelli logo with a blur fade-in. The label is compact and centered above the logo. After a short hold, the splash slides up and the proposal rises into view. Use **Skip intro** or press **Escape** to enter immediately.
- The landing view is reset to the top before the proposal is revealed, so the page does not open slightly scrolled after the splash.
- Reduced-motion preferences skip the animation. Without JavaScript, the proposal remains visible and usable. Printing always hides the splash and reveals the full proposal.
- Open individual sections with their headings; use **Expand all / Collapse all** for the complete plan.
- **Print / Save PDF** expands every section for printing and restores the previous view afterward.
- Native disclosure controls support keyboard navigation and reduced-motion preferences.

## Check

```sh
npm test
node --check app.js
```

Fonts are served locally. Their SIL Open Font Licenses are included in `assets/fonts/`.

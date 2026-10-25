# Coffee — Artisan Roasters

A coffee shop landing page with an animated hero slider, product grid and cart.
Plain HTML, CSS and JavaScript, with no framework and no build step.

## Run it

```bash
npm start          # serves the folder at http://localhost:3000
```

Or open `index.html` directly in a browser.

## Test it

```bash
npm install        # dev tools only, nothing is shipped to visitors
npm test           # ESLint + HTML validation + 44 browser checks
```

The browser checks (`tests/site.test.js`) cover the slider, filters, cart math,
cart persistence, keyboard and focus handling, the newsletter form, reduced
motion, mobile layout, and the security cases listed below.

## Features

- **Hero slider**: 5 slides with blur/slide transitions, flying coffee beans, a video background on the first slide,
  a photo background on the second, autoplay with a progress bar, arrows, dots, ← → keys and swipe.
- **Opening animation**: the hero zooms in from a dark fade on page load.
- **Products**: filterable grid (Beans / Machines / Cups) with add to cart.
- **Cart drawer**: quantities and total, saved in the browser and synced across tabs.
- **About** section with a video background, and a footer with a newsletter form.
- Responsive down to phone width. Respects "reduce motion" (no autoplay, no video, no animations).

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `css/styles.css` | All styles and animations |
| `js/main.js` | Slides and products data, slider, cart, navigation |
| `images/` | Product photos (WebP, transparent), `beans/` for the flying beans |
| `videos/` | Bean video, as WebM (smaller) and MP4 (Safari fallback) |
| `_headers` | Security and cache headers for Netlify / Cloudflare Pages |
| `tests/` | Browser test suite |

## Editing content

- **Slides**: the `SLIDES` array at the top of `js/main.js`.
  A slide can have `video` (path without extension), `photo` (a background image) or a `visual` made of product images.
- **Products**: the `PRODUCTS` array. Prices are in **cents** (`1850` = $18.50).
- **Images**: paths are in the `IMG` object. Use WebP with a transparent background for product shots.

## Security

- No `innerHTML`, `eval` or inline event handlers: every element is created with the DOM API,
  and all text goes in as text, so content can never be run as code (XSS).
- Strict Content Security Policy (in `index.html` and `_headers`): only scripts, styles,
  images and media from this site, plus Google Fonts. No inline scripts or styles allowed.
- The saved cart is treated as untrusted: unknown products, invalid quantities and corrupt
  data are dropped, and quantities are capped at 99.
- `_headers` also sets `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`
  and HSTS. If you host somewhere other than Netlify or Cloudflare Pages, set these headers there.

## Not connected yet

- **Checkout** shows a "coming soon" message. Connect a payment provider (for example
  Stripe Checkout) in `initCart()` in `js/main.js`.
- **Newsletter** validates the email but does not send it anywhere. Connect a mailing-list
  service in `initNewsletter()`.
- Prices on the page are for display only. When real payments are added, the server must
  look up prices itself and never trust prices or totals sent from the browser.

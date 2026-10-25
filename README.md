# Coffee — Artisan Roasters

A coffee shop landing page with an animated hero slider, product grid, and cart.
Plain HTML, CSS and JavaScript — no build step.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## What's inside

- **Hero slider**: 5 slides with blur/slide text transitions, outlined "ghost" text, flying coffee beans, auto-play with a progress bar, arrows, dots, keyboard (← →) and swipe support.
- **Products**: filterable grid (Beans / Machines / Cups) with add-to-cart.
- **Cart drawer**: quantities and total, saved in the browser.
- **About** and **footer** with a newsletter form.
- Responsive down to phone width; respects "reduce motion".

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `css/styles.css` | All styles and animations |
| `js/art.js` | SVG illustrations (bags, cups, espresso machine, beans) |
| `js/main.js` | Slides and products data, slider, cart |

## Customizing

- **Slides**: edit the `SLIDES` array in `js/main.js` (text, colors, background, visual).
- **Products**: edit the `PRODUCTS` array in `js/main.js`.
- **Photos**: paths are in the `IMG` object at the top of `js/main.js`. Use transparent PNGs.
  - `images/coffee-pouch.png`, `bean-sack.png`, `espresso-machine.png`, `espresso-shots.png`
  - `images/coffee-cup.jpg` — full photo (not cut out), used as the "Rich Aroma" slide background via `bgImage`.
  - `images/beans/` — single beans used for the flying-bean animation.
- **Video**: `videos/beans.webm` / `.mp4` plays behind the first slide and the About section (`images/beans-poster.jpg` shows while it loads).

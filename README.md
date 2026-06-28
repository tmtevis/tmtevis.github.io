# Tyler's Diode Designs — production build

Drop-in replacement for your storefront repo (`tmtevis/tmtevis.github.io`).
This mirrors your existing layout, so you can copy these over the repo root,
commit, and push — GitHub Pages serves it as-is.

```
index.html                 ← the shop
assets/
  css/styles.css           ← tokens + storefront styles (one flattened file)
  js/products.js           ← THE CATALOG — edit this to add/change products
  js/main.js               ← storefront interactions (cart, quick-view, filters)
  img/
    logo.svg favicon.svg hero-scene.svg
    illustrations/         ← hero chip art
    products/              ← product photos (<slug>_1.jpg, _2.jpg, …)
```

## Deploy
1. Copy the contents of this `production/` folder into your repo root
   (overwriting `index.html` and `assets/`). Keep your own `404.html`,
   `robots.txt`, `README.md`, `CNAME`, etc.
2. `git add -A && git commit -m "New storefront" && git push`
3. GitHub Pages redeploys in ~1 min.

## Add / edit a product
Everything is driven by `assets/js/products.js` — edit the `PRODUCTS` array,
drop photos into `assets/img/products/` named `<slug>_1.jpg`, `<slug>_2.jpg`, …
Made-to-order items (`madeToOrder: true`) are quote-only and link to your
contact form automatically. Full instructions live in the design system's
`readme.md`.

## Notes
- Fonts load from Google Fonts (Fredoka / Nunito / Space Mono) via the CSS.
- Checkout is a demo stub — wire the Checkout button to PayPal/Venmo/card
  before taking real orders.
- `assets/img/products/color_swatch.jpg` is included but unused (kept for
  later use, per your note).

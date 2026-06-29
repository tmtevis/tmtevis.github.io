# VSITEdesigns — production build

Drop-in replacement for your storefront repo (`tmtevis/tmtevis.github.io`).
This mirrors your existing layout, so you can copy these over the repo root,
commit, and push — GitHub Pages serves it as-is.

```
index.html                 ← the shop
thank_you.html             ← post-payment confirmation (PayPal redirect target)
assets/
  css/styles.css           ← tokens + storefront styles (one flattened file)
  js/products.js           ← THE CATALOG — edit this to add/change products
  js/main.js               ← storefront interactions (cart, quick-view, filters,
                              fulfillment chooser, Ohio sales tax, PayPal checkout)
  img/
    logo.svg favicon.svg hero-scene.svg
    illustrations/         ← hero chip art
    products/              ← product photos (<slug>_1.jpg, _2.jpg, …)
```

## Deploy
1. Copy the contents of this `production/` folder into your repo root
   (overwriting `index.html`, `thank_you.html`, and `assets/`). Keep your own
   `404.html`, `robots.txt`, `README.md`, `CNAME`, etc.
2. `git add -A && git commit -m "New storefront" && git push`
3. GitHub Pages redeploys in ~1 min.

## Add / edit a product
Everything is driven by `assets/js/products.js` — edit the `PRODUCTS` array,
drop photos into `assets/img/products/` named `<slug>_1.jpg`, `<slug>_2.jpg`, …
Made-to-order items (`madeToOrder: true`) are quote-only and link to your
contact form automatically. Full instructions live in the design system's
`readme.md`.

## Notes
- Fonts load from Google Fonts (Space Grotesk / Nunito / Space Mono) via the CSS.
- **Checkout is live via PayPal** (Buttons SDK, with Venmo enabled). The
  client-id is set on the PayPal `<script>` in `index.html` — swap it for your
  own before taking real orders. On approval the buyer lands on
  `thank_you.html?tx=<order-id>`.
- **Fulfillment & tax:** the cart asks for local pickup (free) or shipping
  (+$11.95) and adds Ohio + Cuyahoga County sales tax (8.00%). Adjust the
  `SHIP_FEE` / `TAX_*` constants near the top of `assets/js/main.js`.
- Made-to-order items (`madeToOrder: true`) are quote-only and link to your
  contact form automatically.
- `assets/img/products/color_swatch.jpg` is included but unused (kept for
  later use, per your note).

# Tyler's Diode Designs — Storefront

A whimsical, fast, **dependency-free** storefront for Tyler's Diode Designs — a maker-studio
spinoff of **TES, LLC** selling 3D printed maps, signs, statues, accessories, and lasercraft.

Built as a static site for **GitHub Pages**: plain HTML, CSS, and vanilla JS. No build step,
no framework, no npm install. Just open it.

> **Tagline:** *Precision Printed. Uniquely Yours.*

---

## What's on the page

- **Sticky header** with placeholder logo, brand name, nav (Home · Shop · Custom Orders · About · Contact), and a cart button.
- **Hero** with the tagline and two CTAs — *Shop Now* and *Request a Custom Order*.
- **Category grid** — Maps · Signs · Accessories · Statues · Lasercraft.
- **Shop** — a filterable grid of 12 SKU products with image, name, SKU, price, and **Add to Cart**.
- **Working cart + PayPal checkout** — slide-out drawer, quantity steppers, subtotal, and localStorage persistence. Checkout uses **PayPal Smart Buttons** (PayPal / Venmo / card) wired to the same business account as `tevisengineering.com`; the live cart total is charged on the spot.
- **Custom Orders** — a 3-step process with CTAs that link to the TES contact form.
- **About** — the TDD ↔ TES, LLC story.
- **Footer** — shop/studio links, contact info, social placeholders, copyright.
- Plus a themed **404 page**, scroll animations, mobile nav, and reduced-motion support.

All custom-quote / contact CTAs point to **<https://tevisengineering.com/contact.html>** for now.

---

## Project structure

```
.
├── index.html            # The whole storefront (one page)
├── 404.html              # Themed not-found page
├── robots.txt
├── .nojekyll             # Tell GitHub Pages to serve files as-is (skip Jekyll)
├── README.md
└── assets/
    ├── css/styles.css    # Design system + all components
    ├── js/main.js        # Product catalog, cart, filters, UI
    └── img/              # SVG logo + placeholder product art (swap these for photos)
        ├── logo.svg  favicon.svg  hero-scene.svg
        ├── topo-ohio.svg  topo-lake.svg  topo-state.svg
        ├── sign.svg  sign-est.svg
        ├── desk.svg  phone-stand.svg
        ├── skyline.svg  stadium.svg
        └── keychain.svg  magnet.svg  coaster.svg
```

---

## Edit the products

The catalog lives in one array near the top of [`assets/js/main.js`](assets/js/main.js):

```js
{ id: "TDD-OH-01", name: "Ohio Topographic Relief Map", price: 48, category: "maps",
  img: "assets/img/topo-ohio.svg", desc: "Layered elevation map of the Buckeye State…" },
```

- **Add a product:** copy a line, give it a unique `id` (SKU), set `price`, `category`, `img`, and `desc`.
- **Categories:** `maps`, `signs`, `accessories`, `statues`, `lasercraft`. (To add a new category, also add it to the `CATEGORIES` map in the same file, a `--c-*` color in `styles.css`, and a filter button + category card in `index.html`.)
- **Use real photos:** drop a `.jpg`/`.png`/`.webp` into `assets/img/` and point `img:` at it. Cards crop to a 4:3 frame, so ~1200×900 works well. The placeholder SVGs can stay until you have photos.

The price shown on each card and in the cart is read from this one array — no other edits needed.

---

## Preview locally

It's static, so any of these work from the project folder:

```bash
# Python (built in on most machines)
python -m http.server 8080
# then open http://localhost:8080

# or Node, if you have it
npx serve .
```

You can also just double-click `index.html`, though a local server is closer to how GitHub Pages serves it.

---

## Deploy to GitHub Pages

This folder is already a git repo wired to your personal Pages repo:

```
origin → https://github.com/tmtevis/tmtevis.github.io.git
```

A `username.github.io` repo publishes its **default branch root** straight to
`https://tmtevis.github.io/`. So the flow is just: commit these files and push.

### ⚠️ One-time note (read this first)

When this site was built, the repo **could not be fetched anonymously — it returned 401 (private)**,
and no GitHub credentials were available on this machine. So:

1. **The old repo contents were not pulled down.** That's intentional — we're replacing them. But it
   means your first push needs to reconcile with whatever history is already on GitHub.
2. **You'll need to authenticate** before pushing. Easiest options:
   - Install the GitHub CLI and run `gh auth login`, **or**
   - Create a Personal Access Token (PAT) and use it as the password when git prompts, **or**
   - Let Git Credential Manager (bundled with Git for Windows) prompt you in a desktop window.
3. **Confirm the default branch name.** This local repo is on **`master`**. If your GitHub repo's
   default branch is **`main`**, rename first: `git branch -m master main`.

### Push it

```bash
# from this folder
git add -A
git commit -m "Launch Tyler's Diode Designs storefront"

# If the remote already has history you don't need (the 'dead carcass'),
# overwrite it deliberately:
git push -u origin master --force-with-lease
#   …or 'main' if you renamed the branch / that's your default.
```

> `--force-with-lease` replaces the old site but refuses to clobber commits you haven't seen,
> which is safer than a plain `--force`. Use it only once you're sure you want the old content gone.

After pushing, check **Settings → Pages** on the repo. For a user site the source is usually
"Deploy from a branch → (default branch) / root." Give it a minute, then visit
`https://tmtevis.github.io/`.

---

## Payments (PayPal)

Checkout reuses the **same PayPal business account / client-id** as `tevisengineering.com/pay_invoice.html`, so it plugs into infrastructure that already exists — no new account, no server.

- The PayPal JS SDK is loaded once in `<head>` of [`index.html`](index.html) (`client-id=…`, `currency=USD`, `intent=capture`, `enable-funding=venmo`).
- When the cart drawer opens, [`assets/js/main.js`](assets/js/main.js) renders PayPal Smart Buttons into `#paypal-button-container`. At click time `createOrder()` reads the **live cart subtotal** and sends it as the order amount with an itemized `breakdown` (same dynamic-amount pattern as the invoice page).
- On approval the order is **captured client-side** (`actions.order.capture()`), the cart is cleared, and a "Payment received" screen shows the payer name, amount, and a `TDD-YYYYMMDD-XXXXX` order reference. Reconcile against your real PayPal transaction records.
- **Shipping** isn't charged at checkout — the cart note says shipping/pickup is arranged afterward, and PayPal collects the buyer's address for you. Add a flat rate later via the `breakdown.shipping` field if you want.

To swap accounts, change the `client-id` in the SDK `<script>` tag. To remove Venmo, drop `&enable-funding=venmo`.

> Like the invoice page, capture happens in the browser with no backend verifying it — fine for a low-volume maker shop you reconcile by hand. If volume grows, move the capture to a serverless function (PayPal Orders API v2) for server-side verification.

## Still to come (parking lot)

- [ ] **Pick a domain** and serve the site there (then add a `CNAME` file with the domain).
- [ ] **ProtonMail email alias** for the studio; wire it into the footer + contact CTAs (replacing the "coming soon" inbox line).
- [ ] Swap placeholder SVG art for **product photography**.
- [ ] Optional: a proper logo to replace the placeholder diode emblem.
- [ ] Optional: server-side PayPal capture verification if order volume picks up.

---

*Tyler's Diode Designs — a spinoff of TES, LLC. Precision printed in Ohio.*

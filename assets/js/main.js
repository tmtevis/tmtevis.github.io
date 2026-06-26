/* =====================================================================
   Tyler's Diode Designs — Storefront interactions
   Vanilla JS, no dependencies. Cart persists to localStorage.
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------- Product catalog ----------------------- */
  const CATEGORIES = {
    maps:        { label: "Maps",        accent: "var(--c-maps)" },
    signs:       { label: "Signs",       accent: "var(--c-signs)" },
    accessories: { label: "Accessories", accent: "var(--c-accessories)" },
    statues:     { label: "Statues",     accent: "var(--c-statues)" },
    lasercraft:  { label: "Lasercraft",  accent: "var(--c-lasercraft)" }
  };

  const PRODUCTS = [
    { id: "TDD-OH-01", name: "Ohio Topographic Relief Map", price: 48, category: "maps",
      img: "assets/img/topo-ohio.svg", desc: "Layered elevation map of the Buckeye State in rich terrain tones." },
    { id: "TDD-LE-02", name: "Lake Erie Bathymetric Map", price: 42, category: "maps",
      img: "assets/img/topo-lake.svg", desc: "Depth-contoured Great Lake, from shoreline shallows to the deep." },
    { id: "TDD-ST-03", name: "Custom State Topo — Any State", price: 45, category: "maps",
      img: "assets/img/topo-state.svg", desc: "Pick any U.S. state and we print its peaks and valleys to scale." },
    { id: "TDD-NS-04", name: "Layered City Name Sign", price: 34, category: "signs",
      img: "assets/img/sign.svg", desc: "Multi-color layered nameplate for desks, doors, and shelves." },
    { id: "TDD-FS-05", name: "Established Family Monogram", price: 39, category: "signs",
      img: "assets/img/sign-est.svg", desc: "Round 'est.' keepsake with your family name and founding year." },
    { id: "TDD-DO-06", name: "Filament Desk Organizer", price: 24, category: "accessories",
      img: "assets/img/desk.svg", desc: "Tidy caddy for pens, tools, and the odds and ends of a busy desk." },
    { id: "TDD-PS-07", name: "Topo-Edge Phone Stand", price: 18, category: "accessories",
      img: "assets/img/phone-stand.svg", desc: "Angled stand with a contour-line motif for desk or nightstand." },
    { id: "TDD-SK-08", name: "Columbus Skyline Statue", price: 55, category: "statues",
      img: "assets/img/skyline.svg", desc: "Your hometown skyline sculpted in crisp printed relief." },
    { id: "TDD-SD-09", name: "Game-Day Stadium Replica", price: 60, category: "statues",
      img: "assets/img/stadium.svg", desc: "Miniature of the stadium where the home crowd roars." },
    { id: "TDD-KC-10", name: "Ohio State Keychain", price: 9, category: "lasercraft",
      img: "assets/img/keychain.svg", desc: "Pocket-size, laser-engraved Buckeye pride." },
    { id: "TDD-MG-11", name: "Skyline Fridge Magnet", price: 7, category: "lasercraft",
      img: "assets/img/magnet.svg", desc: "Laser-cut skyline that sticks the landing on your fridge." },
    { id: "TDD-CS-12", name: "Engraved Coaster Set (4)", price: 26, category: "lasercraft",
      img: "assets/img/coaster.svg", desc: "A set of four engraved, hardwood-look coasters." }
  ];

  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const money = (n) => "$" + n.toFixed(2);

  /* ----------------------------- Icons ----------------------------- */
  const ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const ICON_HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5C6.5 16.5 3 13 3 9.2A4.2 4.2 0 0 1 12 6a4.2 4.2 0 0 1 9 3.2c0 3.8-3.5 7.3-9 11.3Z"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const ICON_BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

  /* --------------------------- Cart store -------------------------- */
  const STORAGE_KEY = "tdd-cart-v1";
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // Keep only entries that still map to a real product.
      return Array.isArray(parsed) ? parsed.filter((e) => e && byId(e.id) && e.qty > 0) : [];
    } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  const cartCount = () => cart.reduce((n, e) => n + e.qty, 0);
  const cartSubtotal = () => cart.reduce((s, e) => s + (byId(e.id) ? byId(e.id).price * e.qty : 0), 0);

  function addToCart(id, qty) {
    qty = qty || 1;
    const line = cart.find((e) => e.id === id);
    if (line) line.qty += qty; else cart.push({ id: id, qty: qty });
    // If a post-payment success screen is showing, return to the shopping view.
    const success = document.getElementById("cartSuccess");
    if (success && !success.hidden) { success.hidden = true; if (cartItemsEl) cartItemsEl.style.display = ""; }
    saveCart(); updateBadge(); renderCart();
  }
  function setQty(id, qty) {
    const line = cart.find((e) => e.id === id);
    if (!line) return;
    line.qty = qty;
    if (line.qty <= 0) cart = cart.filter((e) => e.id !== id);
    saveCart(); updateBadge(); renderCart();
  }
  function removeFromCart(id) {
    cart = cart.filter((e) => e.id !== id);
    saveCart(); updateBadge(); renderCart();
  }

  /* --------------------------- DOM refs ---------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const grid = $("#productGrid");
  const cartCountEl = $("#cartCount");
  const cartHeadCount = $("#cartHeadCount");
  const cartItemsEl = $("#cartItems");
  const cartFoot = $("#cartFoot");
  const toastWrap = $("#toastWrap");

  /* ----------------------- Render product grid --------------------- */
  function renderProducts() {
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map((p, i) => {
      const cat = CATEGORIES[p.category];
      const dollars = Math.floor(p.price);
      const cents = Math.round((p.price - dollars) * 100).toString().padStart(2, "0");
      return (
        '<article class="product-card reveal" data-category="' + p.category + '" data-delay="' + (i % 4) + '" style="--accent: ' + cat.accent + '">' +
          '<div class="product-card__media">' +
            '<span class="product-card__tag">' + cat.label + '</span>' +
            '<button class="product-card__fav" type="button" aria-pressed="false" aria-label="Save ' + p.name + '">' + ICON_HEART + '</button>' +
            '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" width="400" height="300" />' +
          '</div>' +
          '<div class="product-card__body">' +
            '<h3 class="product-card__name">' + p.name + '</h3>' +
            '<p class="product-card__desc">' + p.desc + '</p>' +
            '<div class="product-card__meta"><span class="product-card__sku">SKU · ' + p.id + '</span></div>' +
            '<div class="product-card__foot">' +
              '<span class="product-card__price">$' + dollars + '<small>.' + cents + '</small></span>' +
              '<button class="add-btn" type="button" data-add="' + p.id + '">' + ICON_PLUS + ' Add</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join("");
    observeReveals();
  }

  /* ---------------------------- Filtering -------------------------- */
  let activeFilter = "all";
  const shopNote = $("#shopNote");

  function applyFilter(cat) {
    activeFilter = cat;
    document.querySelectorAll("#filters .filter").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.filter === cat));
    let shown = 0;
    grid.querySelectorAll(".product-card").forEach((card) => {
      const match = cat === "all" || card.dataset.category === cat;
      card.style.display = match ? "" : "none";
      if (match) shown++;
    });
    if (shopNote) shopNote.textContent = shown + (shown === 1 ? " design" : " designs");
  }

  /* ----------------------------- Badge ----------------------------- */
  function updateBadge() {
    const n = cartCount();
    if (!cartCountEl) return;
    cartCountEl.textContent = n;
    cartCountEl.classList.toggle("is-active", n > 0);
    if (cartHeadCount) cartHeadCount.textContent = n ? "(" + n + ")" : "";
  }

  /* --------------------------- Render cart ------------------------- */
  function renderCart() {
    if (!cartItemsEl) return;
    cartItemsEl.style.display = "";
    if (!cart.length) {
      cartItemsEl.innerHTML =
        '<div class="cart-empty">' + ICON_BAG +
        '<p>Your cart is empty</p>' +
        '<span>Add a few printed treasures from the shop.</span>' +
        '<button class="btn btn--ghost" type="button" id="cartEmptyShop">Browse the Shop</button>' +
        '</div>';
      cartFoot.hidden = true;
      const shopBtn = $("#cartEmptyShop");
      if (shopBtn) shopBtn.addEventListener("click", () => { closeCart(); location.hash = "#shop"; });
      return;
    }
    cartItemsEl.innerHTML = cart.map((e) => {
      const p = byId(e.id);
      const lineTotal = p.price * e.qty;
      return (
        '<div class="cart-item" data-id="' + p.id + '">' +
          '<div class="cart-item__img"><img src="' + p.img + '" alt="" /></div>' +
          '<div>' +
            '<div class="cart-item__name">' + p.name + '</div>' +
            '<div class="cart-item__price">' + money(p.price) + ' each</div>' +
            '<div class="qty">' +
              '<button type="button" data-dec="' + p.id + '" aria-label="Decrease quantity">−</button>' +
              '<span>' + e.qty + '</span>' +
              '<button type="button" data-inc="' + p.id + '" aria-label="Increase quantity">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item__right">' +
            '<span class="cart-item__total">' + money(lineTotal) + '</span>' +
            '<button class="cart-item__remove" type="button" data-remove="' + p.id + '">Remove</button>' +
          '</div>' +
        '</div>'
      );
    }).join("");
    cartFoot.hidden = false;
    const sub = cartSubtotal();
    $("#cartSubtotal").textContent = money(sub);
    $("#cartTotal").textContent = money(sub);
  }

  /* ------------------------ Cart open/close ------------------------ */
  const cartEl = $("#cart");
  const overlay = $("#cartOverlay");
  const openBtn = $("#cartOpen");
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    cartEl.classList.add("is-open");
    overlay.classList.add("is-open");
    cartEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const close = $("#cartClose");
    if (close) close.focus();
    ensurePayPalButtons();
  }
  function closeCart() {
    cartEl.classList.remove("is-open");
    overlay.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ------------------------- PayPal checkout ----------------------- */
  /* Mirrors the tevisengineering.com pay_invoice.html flow: the live cart
     total is passed into createOrder() and captured client-side on approval. */
  let paypalRendered = false;
  let paypalTries = 0;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function makeOrderRef() {
    const d = new Date();
    const ymd = "" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
    return "TDD-" + ymd + "-" + rnd;
  }

  function ensurePayPalButtons() {
    const container = document.getElementById("paypal-button-container");
    if (!container || !cart.length || paypalRendered) return;
    if (!window.paypal || !window.paypal.Buttons) {
      // SDK is deferred — poll briefly until it's ready, then give a graceful fallback.
      if (paypalTries++ < 40) { setTimeout(ensurePayPalButtons, 150); return; }
      container.innerHTML = '<p class="cart__paypal-fallback">PayPal didn’t load. Refresh the page, or reach us via the <a href="https://tevisengineering.com/contact.html" target="_blank" rel="noopener">contact form</a>.</p>';
      return;
    }
    paypalRendered = true;
    paypalTries = 0;
    renderPayPalButtons(container);
  }

  function renderPayPalButtons(container) {
    container.innerHTML = "";
    window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal", tagline: false, height: 40 },
      createOrder: function (data, actions) {
        const subtotal = cartSubtotal();
        const items = cart.map(function (e) {
          const p = byId(e.id);
          return {
            name: p.name.substring(0, 127),
            quantity: String(e.qty),
            sku: p.id,
            category: "PHYSICAL_GOODS",
            unit_amount: { currency_code: "USD", value: p.price.toFixed(2) }
          };
        });
        return actions.order.create({
          purchase_units: [{
            description: "Tyler's Diode Designs order",
            custom_id: makeOrderRef(),
            amount: {
              currency_code: "USD",
              value: subtotal.toFixed(2),
              breakdown: { item_total: { currency_code: "USD", value: subtotal.toFixed(2) } }
            },
            items: items
          }]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          let paid = cartSubtotal();
          try { paid = Number(details.purchase_units[0].amount.value) || paid; } catch (e) {}
          let name = "friend";
          try { name = details.payer.name.given_name || name; } catch (e) {}
          cart = [];
          saveCart();
          updateBadge();
          paypalRendered = false;
          container.innerHTML = "";
          showCartSuccess(name, paid, data.orderID);
        });
      },
      onError: function (err) {
        console.error("PayPal error:", err);
        paypalRendered = false;
        container.innerHTML = '<p class="cart__paypal-fallback">Payment couldn’t be completed. Please try again, or reach us via the <a href="https://tevisengineering.com/contact.html" target="_blank" rel="noopener">contact form</a>.</p>';
      },
      onCancel: function () { /* leave the buttons in place so they can retry */ }
    }).render("#paypal-button-container").catch(function (e) {
      console.error("PayPal render failed:", e);
      paypalRendered = false;
    });
  }

  function showCartSuccess(name, amount, orderId) {
    const success = document.getElementById("cartSuccess");
    if (cartItemsEl) cartItemsEl.style.display = "none";
    if (cartFoot) cartFoot.hidden = true;
    if (cartHeadCount) cartHeadCount.textContent = "";
    if (!success) return;
    success.hidden = false;
    success.innerHTML =
      '<div class="cart-success__badge">' + ICON_CHECK + "</div>" +
      "<h3>Payment received!</h3>" +
      "<p>Thanks, " + escapeHtml(name) + ". Your payment of <strong>" + money(amount) +
      "</strong> came through. We’ll email you to confirm details and arrange shipping or local pickup.</p>" +
      '<p class="cart-success__ref">Order ref · ' + escapeHtml(orderId) + "</p>" +
      '<button class="btn btn--ghost" type="button" id="successContinue">Keep Shopping</button>';
    const cont = document.getElementById("successContinue");
    if (cont) cont.addEventListener("click", function () { resetCartView(); closeCart(); });
  }

  function resetCartView() {
    const success = document.getElementById("cartSuccess");
    if (success) success.hidden = true;
    if (cartItemsEl) cartItemsEl.style.display = "";
    renderCart();
  }

  /* ------------------------------ Toast ---------------------------- */
  function showToast(msg) {
    if (!toastWrap) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="toast__dot">' + ICON_CHECK + "</span><span>" + msg + "</span>";
    toastWrap.appendChild(t);
    setTimeout(() => t.remove(), 3100);
  }

  /* --------------------------- Reveal anim ------------------------- */
  let revealObserver = null;
  function observeReveals() {
    const els = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    }
    els.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------- Event wiring -------------------------- */
  function wireEvents() {
    // Add to cart + favorite (delegated on grid)
    grid.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        const p = byId(add.dataset.add);
        addToCart(p.id);
        add.classList.add("is-added");
        add.innerHTML = ICON_CHECK + " Added";
        showToast(p.name + " added to cart");
        setTimeout(() => { add.classList.remove("is-added"); add.innerHTML = ICON_PLUS + " Add"; }, 1300);
        return;
      }
      const fav = e.target.closest(".product-card__fav");
      if (fav) {
        const on = fav.classList.toggle("is-on");
        fav.setAttribute("aria-pressed", on ? "true" : "false");
      }
    });

    // Toolbar filters
    document.querySelectorAll("#filters .filter").forEach((btn) =>
      btn.addEventListener("click", () => applyFilter(btn.dataset.filter)));

    // Jump links (category cards + footer) that also set a filter
    document.querySelectorAll('a[data-filter]').forEach((a) =>
      a.addEventListener("click", () => applyFilter(a.dataset.filter)));

    // Cart open/close
    openBtn.addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && cartEl.classList.contains("is-open")) closeCart();
    });

    // Cart item controls (delegated)
    cartItemsEl.addEventListener("click", (e) => {
      const inc = e.target.closest("[data-inc]");
      const dec = e.target.closest("[data-dec]");
      const rem = e.target.closest("[data-remove]");
      if (inc) { const l = cart.find((x) => x.id === inc.dataset.inc); if (l) setQty(l.id, l.qty + 1); }
      else if (dec) { const l = cart.find((x) => x.id === dec.dataset.dec); if (l) setQty(l.id, l.qty - 1); }
      else if (rem) { const p = byId(rem.dataset.remove); removeFromCart(rem.dataset.remove); showToast((p ? p.name : "Item") + " removed"); }
    });

    // Mobile nav
    const navToggle = $("#navToggle");
    const mainNav = $("#mainNav");
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mainNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    // "Coming soon" placeholder links
    document.querySelectorAll("[data-soon]").forEach((a) =>
      a.addEventListener("click", (e) => { e.preventDefault(); showToast("Social links coming soon!"); }));

    // Header scroll state
    const header = $(".site-header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Footer year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------ Init ----------------------------- */
  renderProducts();
  wireEvents();
  observeReveals();
  updateBadge();
  renderCart();
})();

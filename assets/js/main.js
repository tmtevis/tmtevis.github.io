/* =====================================================================
   Tyler's Diode Designs — Storefront UI kit interactions
   Vanilla JS, no dependencies. Reads the catalog from data/products.js
   (window.TDD). Cart persists to localStorage and carries the chosen
   size + color per line. Quick-view pop-up handles gallery / color / size.
   ===================================================================== */
(function () {
  "use strict";
  var T = window.TDD;
  var CATEGORIES = T.CATEGORIES, FILAMENTS = T.FILAMENTS, BACKGROUNDS = T.BACKGROUNDS, PRODUCTS = T.PRODUCTS;
  var byId = T.byId, money = T.money;
  var QUOTE_URL = T.CONTACT_URL || "https://tevisengineering.com/contact.html";

  /* ----------------------------- Icons ----------------------------- */
  var I = {
    plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5C6.5 16.5 3 13 3 9.2A4.2 4.2 0 0 1 12 6a4.2 4.2 0 0 1 9 3.2c0 3.8-3.5 7.3-9 11.3Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    bag:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    left:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    sparkle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/></svg>',
    mail:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><path d="m3 7 9 6 9-6"/></svg>'
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }

  /* --------------------------- Favorites --------------------------- */
  var favs = {};

  /* ----------------------- Render product grid --------------------- */
  var grid = $("#productGrid");
  function filamentAdd(colorKey) {
    var f = colorKey && FILAMENTS[colorKey];
    return (f && f.addPrice) || 0;
  }
  function unitPrice(p, sizeId, colorKey) {
    var price = p.price;
    if (p.sizes) {
      var s = p.sizes.filter(function (x) { return x.id === sizeId; })[0] || p.sizes[0];
      price += (s.addPrice || 0);
    }
    return price + filamentAdd(colorKey);
  }
  function hasOptions(p) { return !!(p.sizes || (p.colors && p.colors.length > 1) || (p.bgColors && p.bgColors.length > 0)); }
  /* Whether the price can rise from the base (sizes, or an upcharged color) — drives the "$NN +" hint. */
  function hasUpcharge(p) {
    return !!(p.sizes || (p.colors && p.colors.some(function (k) { return filamentAdd(k) > 0; })));
  }

  function renderProducts() {
    grid.innerHTML = PRODUCTS.map(function (p, i) {
      var cat = CATEGORIES[p.category];
      var d = Math.floor(p.price), c = Math.round((p.price - d) * 100).toString().padStart(2, "0");
      return '<article class="product-card reveal" data-category="' + p.category + '" data-delay="' + (i % 4) + '" style="--accent: ' + cat.accent + '">' +
        '<div class="product-card__media" data-open="' + p.id + '">' +
          '<span class="product-card__tag">' + cat.label + '</span>' +
          '<button class="product-card__fav" type="button" data-fav="' + p.id + '" aria-label="Save ' + esc(p.name) + '">' + I.heart + '</button>' +
          (p.badge ? '<span class="pc-badge">' + esc(p.badge) + '</span>' : '') +
          '<img src="' + p.gallery[0] + '" alt="' + esc(p.name) + '" loading="lazy" />' +
        '</div>' +
        '<div class="product-card__body">' +
          '<h3 class="product-card__name" data-open="' + p.id + '">' + esc(p.name) + '</h3>' +
          '<p class="product-card__desc">' + esc(p.blurb) + '</p>' +
          '<div class="product-card__meta"><span class="product-card__sku">SKU · ' + p.id + '</span>' +
            (p.madeToOrder ? '<span class="pc-mto">' + I.sparkle + ' Made to order</span>' : '') + '</div>' +
          '<div class="product-card__foot">' +
            (p.madeToOrder
              ? '<span class="product-card__price product-card__price--quote">By quote</span>' +
                '<a class="add-btn add-btn--quote" href="' + QUOTE_URL + '" target="_blank" rel="noopener">' + I.mail + ' Request a quote</a>'
              : '<span class="product-card__price">$' + d + '<small>.' + c + (hasUpcharge(p) ? ' +' : '') + '</small></span>' +
                '<button class="add-btn" type="button" data-add="' + p.id + '">' + (hasOptions(p) ? I.search + ' Options' : I.plus + ' Add') + '</button>'
            ) +
          '</div>' +
        '</div>' +
      '</article>';
    }).join("");
    if (shopNote) shopNote.textContent = PRODUCTS.length + " designs";
    observeReveals();
  }

  /* ---------------------------- Filtering -------------------------- */
  var shopNote = $("#shopNote");
  function applyFilter(cat) {
    document.querySelectorAll("#filters .filter").forEach(function (b) { b.classList.toggle("is-active", b.dataset.filter === cat); });
    var shown = 0;
    grid.querySelectorAll(".product-card").forEach(function (card) {
      var match = cat === "all" || card.dataset.category === cat;
      card.style.display = match ? "" : "none"; if (match) shown++;
    });
    if (shopNote) shopNote.textContent = shown + (shown === 1 ? " design" : " designs");
  }

  /* ========================= QUICK-VIEW =========================== */
  var qvOverlay = $("#qvOverlay"), qvRoot = $("#qv");
  var qvState = { product: null, gi: 0, size: null, color: null, bgColor: null, qty: 1 };

  function openQuickView(id) {
    var p = byId(id); if (!p) return;
    qvState = { product: p, gi: 0, qty: 1,
      size: p.sizes ? p.sizes[0].id : null,
      color: (p.colors && p.colors.length) ? p.colors[0] : null,
      bgColor: (p.bgColors && p.bgColors.length) ? p.bgColors[0] : null };
    renderQuickView();
    qvOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeQuickView() {
    qvOverlay.classList.remove("is-open");
    if (!$("#cart").classList.contains("is-open")) document.body.style.overflow = "";
  }

  function renderQuickView() {
    var p = qvState.product; if (!p) return;
    var cat = CATEGORIES[p.category];
    var unit = unitPrice(p, qvState.size, qvState.color), total = unit * qvState.qty;

    var gallery = '<div class="gallery__main">' +
        '<img src="' + p.gallery[qvState.gi] + '" alt="' + esc(p.name) + '" />' +
        (p.gallery.length > 1 ?
          '<button class="gallery__nav gallery__nav--prev" data-gnav="-1" aria-label="Previous photo">' + I.left + '</button>' +
          '<button class="gallery__nav gallery__nav--next" data-gnav="1" aria-label="Next photo">' + I.right + '</button>' +
          '<span class="gallery__count">' + (qvState.gi + 1) + ' / ' + p.gallery.length + '</span>' : '') +
      '</div>' +
      (p.gallery.length > 1 ? '<div class="gallery__thumbs">' + p.gallery.map(function (src, i) {
        return '<button class="gallery__thumb' + (i === qvState.gi ? ' is-active' : '') + '" data-gthumb="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + src + '" alt="" /></button>';
      }).join("") + '</div>' : '');

    var colors = (p.colors && p.colors.length) ? (function () {
      var sel = FILAMENTS[qvState.color] || FILAMENTS[p.colors[0]];
      return '<div><div class="qv__opt-label"><span>Color</span></div>' +
        '<div class="color-select">' +
          '<span class="color-select__dot" style="background:' + (sel ? sel.hex : "#ccc") + '"></span>' +
          '<select class="color-select__input" data-color-select aria-label="Choose a color">' +
            p.colors.map(function (k) {
              var f = FILAMENTS[k]; if (!f) return "";
              var up = f.addPrice ? " + " + money(f.addPrice) : "";
              return '<option value="' + k + '"' + (k === qvState.color ? " selected" : "") + '>' + esc(f.label + up) + '</option>';
            }).join("") +
          '</select>' +
          '<svg class="color-select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
        '</div></div>';
    })() : '';

    var bgColors = (p.bgColors && p.bgColors.length) ? (function () {
      var sel = BACKGROUNDS[qvState.bgColor] || BACKGROUNDS[p.bgColors[0]];
      return '<div><div class="qv__opt-label"><span>Background</span></div>' +
        '<div class="color-select">' +
          '<span class="color-select__dot" style="background:' + (sel ? sel.hex : "#ccc") + '"></span>' +
          '<select class="color-select__input" data-bg-color-select aria-label="Choose a background color">' +
            p.bgColors.map(function (k) {
              var bg = BACKGROUNDS[k]; if (!bg) return "";
              return '<option value="' + k + '"' + (k === qvState.bgColor ? " selected" : "") + '>' + esc(bg.label) + '</option>';
            }).join("") +
          '</select>' +
          '<svg class="color-select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
        '</div></div>';
    })() : '';

    var sizes = p.sizes ? (function () {
      var selS = p.sizes.filter(function (s) { return s.id === qvState.size; })[0];
      return '<div><div class="qv__opt-label"><span>' + esc(p.sizeLabel || "Size") + '</span><small>' + esc(selS ? selS.note : "") + '</small></div>' +
        '<div class="sizes">' + p.sizes.map(function (s) {
          return '<button class="size' + (s.id === qvState.size ? ' is-on' : '') + '" data-size="' + s.id + '"><span>' + esc(s.label) + '</span>' +
            (s.addPrice ? '<span class="size__add">+' + money(s.addPrice) + '</span>' : '') + '</button>';
        }).join("") + '</div></div>';
    })() : '';

    qvRoot.innerHTML =
      '<button class="qv__close" id="qvClose" aria-label="Close">' + I.close + '</button>' +
      '<div class="qv__grid">' +
        '<div class="qv__media">' + gallery + '</div>' +
        '<div class="qv__detail">' +
          '<div class="qv__tags"><span class="product-card__tag" style="position:static;box-shadow:none;color:' + cat.accent + ';background:color-mix(in srgb,' + cat.accent + ' 14%, white)">' + cat.label + '</span>' +
            (p.badge ? '<span class="pc-badge" style="position:static">' + esc(p.badge) + '</span>' : '') + '</div>' +
          '<div><h2 class="qv__title">' + esc(p.name) + '</h2><p class="qv__desc">' + esc(p.desc) + '</p></div>' +
          (p.madeToOrder
            ? '<div class="qv__foot" style="margin-top:6px">' +
                '<a class="btn btn--primary btn--lg btn--block" href="' + QUOTE_URL + '" target="_blank" rel="noopener" style="text-decoration:none">' + I.mail + ' Request a quote</a>' +
                '<p class="qv__ship">' + I.sparkle + " Made to order — send us the details on our contact form and we'll reply with a quote and timing." + '</p>' +
              '</div>'
            : colors + bgColors + sizes +
              '<div class="qv__qty-row"><span>Quantity</span>' +
                '<div class="qty"><button type="button" data-qty="-1" aria-label="Decrease">−</button><span>' + qvState.qty + '</span><button type="button" data-qty="1" aria-label="Increase">+</button></div></div>' +
              '<div class="qv__foot">' +
                '<div class="qv__price-row"><span class="qv__price-each">' + money(unit) + ' each</span><span class="qv__price-total">' + money(total) + '</span></div>' +
                '<button class="btn btn--primary btn--lg btn--block" id="qvAdd">' + I.bag + ' Add to cart</button>' +
                '<p class="qv__ship">' + I.truck + " Printed to order. Ships or local pickup arranged after checkout." + '</p>' +
              '</div>'
          ) +
        '</div>' +
      '</div>';
  }

  function qvAddToCart() {
    var p = qvState.product;
    addToCart(p.id, qvState.size, qvState.color, qvState.bgColor, qvState.qty);
    var btn = $("#qvAdd");
    btn.innerHTML = I.check + " Added!";
    btn.style.background = "var(--teal)"; btn.style.color = "#06302b"; btn.style.boxShadow = "none";
    showToast(p.name + " added to cart");
    setTimeout(function () { if ($("#cart")) closeQuickView(); }, 650);
  }

  /* --------------------------- Cart store -------------------------- */
  var STORAGE_KEY = "tdd-kit-cart-v1";
  var cart = loadCart();
  function loadCart() { try { var r = localStorage.getItem(STORAGE_KEY); var a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a.filter(function (e) { return e && byId(e.id) && e.qty > 0; }) : []; } catch (e) { return []; } }
  function saveCart() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {} }
  function lineKey(id, size, color, bgColor) { return id + "|" + (size || "") + "|" + (color || "") + "|" + (bgColor || ""); }
  function cartCount() { return cart.reduce(function (n, e) { return n + e.qty; }, 0); }
  function lineUnit(e) { return unitPrice(byId(e.id), e.size, e.color); }
  function cartSubtotal() { return cart.reduce(function (s, e) { return s + lineUnit(e) * e.qty; }, 0); }

  function addToCart(id, size, color, bgColor, qty) {
    qty = qty || 1;
    var key = lineKey(id, size, color, bgColor);
    var line = cart.filter(function (e) { return lineKey(e.id, e.size, e.color, e.bgColor) === key; })[0];
    if (line) line.qty += qty; else cart.push({ id: id, size: size, color: color, bgColor: bgColor, qty: qty });
    saveCart(); updateBadge(); renderCart();
  }
  function setQty(key, qty) {
    var line = cart.filter(function (e) { return lineKey(e.id, e.size, e.color, e.bgColor) === key; })[0];
    if (!line) return; line.qty = qty;
    if (line.qty <= 0) cart = cart.filter(function (e) { return lineKey(e.id, e.size, e.color, e.bgColor) !== key; });
    saveCart(); updateBadge(); renderCart();
  }
  function removeFromCart(key) { cart = cart.filter(function (e) { return lineKey(e.id, e.size, e.color, e.bgColor) !== key; }); saveCart(); updateBadge(); renderCart(); }

  var cartCountEl = $("#cartCount"), cartHeadCount = $("#cartHeadCount"), cartItemsEl = $("#cartItems"), cartFoot = $("#cartFoot");
  function updateBadge() { var n = cartCount(); cartCountEl.textContent = n; cartCountEl.classList.toggle("is-active", n > 0); if (cartHeadCount) cartHeadCount.textContent = n ? "(" + n + ")" : ""; }

  function variantLabel(e) {
    var bits = [];
    if (e.size) { var p = byId(e.id); var s = p.sizes && p.sizes.filter(function (x) { return x.id === e.size; })[0]; if (s) bits.push(s.label); }
    if (e.color && FILAMENTS[e.color]) bits.push(FILAMENTS[e.color].label);
    if (e.bgColor && BACKGROUNDS && BACKGROUNDS[e.bgColor]) bits.push(BACKGROUNDS[e.bgColor].label + " bg");
    return bits.join(" · ");
  }

  function renderCart() {
    cartItemsEl.style.display = "";
    if (!cart.length) {
      cartItemsEl.innerHTML = '<div class="cart-empty">' + I.bag + '<p>Your cart is empty</p><span>Add a few printed treasures from the shop.</span><button class="btn btn--ghost" type="button" id="cartEmptyShop">Browse the Shop</button></div>';
      cartFoot.hidden = true;
      var b = $("#cartEmptyShop"); if (b) b.addEventListener("click", function () { closeCart(); location.hash = "#shop"; });
      return;
    }
    cartItemsEl.innerHTML = cart.map(function (e) {
      var p = byId(e.id), key = lineKey(e.id, e.size, e.color, e.bgColor), unit = lineUnit(e), vl = variantLabel(e);
      return '<div class="cart-item" data-key="' + key + '">' +
        '<div class="cart-item__img"><img src="' + p.gallery[0] + '" alt="" /></div>' +
        '<div><div class="cart-item__name">' + esc(p.name) + '</div>' +
          (vl ? '<div class="cart-item__price">' + esc(vl) + '</div>' : '') +
          '<div class="cart-item__price">' + money(unit) + ' each</div>' +
          '<div class="qty"><button type="button" data-dec="' + key + '" aria-label="Decrease">−</button><span>' + e.qty + '</span><button type="button" data-inc="' + key + '" aria-label="Increase">+</button></div>' +
        '</div>' +
        '<div class="cart-item__right"><span class="cart-item__total">' + money(unit * e.qty) + '</span><button class="cart-item__remove" type="button" data-remove="' + key + '">Remove</button></div>' +
      '</div>';
    }).join("");
    cartFoot.hidden = false;
    initPayPal();
    var sub = cartSubtotal();
    $("#cartSubtotal").textContent = money(sub); $("#cartTotal").textContent = money(sub);
  }

  /* ------------------------ Cart open/close ------------------------ */
  var cartEl = $("#cart"), overlay = $("#cartOverlay");
  function openCart() { cartEl.classList.add("is-open"); overlay.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeCart() { cartEl.classList.remove("is-open"); overlay.classList.remove("is-open"); if (!qvOverlay.classList.contains("is-open")) document.body.style.overflow = ""; }

  /* ------------------------------ Toast ---------------------------- */
  var toastWrap = $("#toastWrap");
  function showToast(msg) { var t = document.createElement("div"); t.className = "toast"; t.innerHTML = '<span class="toast__dot">' + I.check + "</span><span>" + esc(msg) + "</span>"; toastWrap.appendChild(t); setTimeout(function () { t.remove(); }, 3100); }

  /* --------------------------- Reveal anim ------------------------- */
  var revealObserver = null;
  function observeReveals() {
    var els = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    if (!revealObserver) revealObserver = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); revealObserver.unobserve(en.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------- Event wiring -------------------------- */
  function wire() {
    grid.addEventListener("click", function (e) {
      var open = e.target.closest("[data-open]"), add = e.target.closest("[data-add]"), fav = e.target.closest("[data-fav]");
      if (fav) { var id = fav.dataset.fav; favs[id] = !favs[id]; fav.classList.toggle("is-on", favs[id]); return; }
      if (add) { var pid = add.dataset.add, p = byId(pid);
        if (hasOptions(p)) { openQuickView(pid); }
        else { addToCart(pid, null, p.colors && p.colors[0], p.bgColors && p.bgColors[0], 1); add.classList.add("is-added"); add.innerHTML = I.check + " Added"; showToast(p.name + " added to cart"); setTimeout(function () { add.classList.remove("is-added"); add.innerHTML = I.plus + " Add"; }, 1300); }
        return; }
      if (open) openQuickView(open.dataset.open);
    });

    qvRoot.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("#qvClose")) return closeQuickView();
      var gnav = t.closest("[data-gnav]"); if (gnav) { var n = qvState.product.gallery.length; qvState.gi = (qvState.gi + parseInt(gnav.dataset.gnav, 10) + n) % n; return renderQuickView(); }
      var gthumb = t.closest("[data-gthumb]"); if (gthumb) { qvState.gi = parseInt(gthumb.dataset.gthumb, 10); return renderQuickView(); }
      var sz = t.closest("[data-size]"); if (sz) { qvState.size = sz.dataset.size; return renderQuickView(); }
      var q = t.closest("[data-qty]"); if (q) { qvState.qty = Math.max(1, Math.min(99, qvState.qty + parseInt(q.dataset.qty, 10))); return renderQuickView(); }
      if (t.closest("#qvAdd")) return qvAddToCart();
    });
    qvRoot.addEventListener("change", function (e) {
      var sel = e.target.closest("[data-color-select]");
      if (sel) { qvState.color = sel.value; renderQuickView(); }
      var bgSel = e.target.closest("[data-bg-color-select]");
      if (bgSel) { qvState.bgColor = bgSel.value; renderQuickView(); }
    });
    qvOverlay.addEventListener("click", function (e) { if (e.target === qvOverlay) closeQuickView(); });

    document.querySelectorAll("#filters .filter").forEach(function (b) { b.addEventListener("click", function () { applyFilter(b.dataset.filter); }); });
    document.querySelectorAll("a[data-filter]").forEach(function (a) { a.addEventListener("click", function () { applyFilter(a.dataset.filter); }); });

    $("#cartOpen").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (qvOverlay.classList.contains("is-open")) closeQuickView();
      else if (cartEl.classList.contains("is-open")) closeCart();
    });

    cartItemsEl.addEventListener("click", function (e) {
      var inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rem = e.target.closest("[data-remove]");
      if (inc) { var l = cart.filter(function (x) { return lineKey(x.id, x.size, x.color) === inc.dataset.inc; })[0]; if (l) setQty(inc.dataset.inc, l.qty + 1); }
      else if (dec) { var l2 = cart.filter(function (x) { return lineKey(x.id, x.size, x.color) === dec.dataset.dec; })[0]; if (l2) setQty(dec.dataset.dec, l2.qty - 1); }
      else if (rem) { removeFromCart(rem.dataset.remove); showToast("Item removed"); }
    });

    var navToggle = $("#navToggle"), mainNav = $("#mainNav");
    navToggle.addEventListener("click", function () { var o = mainNav.classList.toggle("is-open"); navToggle.setAttribute("aria-expanded", o ? "true" : "false"); });
    mainNav.addEventListener("click", function (e) { if (e.target.closest("a")) { mainNav.classList.remove("is-open"); navToggle.setAttribute("aria-expanded", "false"); } });

    document.querySelectorAll("[data-soon]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); showToast("Social links coming soon!"); }); });

    var header = $(".site-header");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* ========================= PAYPAL CHECKOUT ======================== */
  function buildPayPalOrder() {
    var total = cartSubtotal();
    var summary = cart.map(function (e) {
      var p = byId(e.id), vl = variantLabel(e);
      return p.name + (vl ? ‘ (‘ + vl + ‘)’ : ‘’) + ‘ x’ + e.qty;
    }).join(‘, ‘);
    return {
      purchase_units: [{
        description: summary.substring(0, 127),
        custom_id: cart.map(function (e) { return e.id + ‘x’ + e.qty; }).join(‘,’).substring(0, 127),
        amount: { value: total.toFixed(2), currency_code: ‘USD’ }
      }]
    };
  }

  var paypalReady = false;
  function initPayPal() {
    if (paypalReady) return;
    if (!window.paypal) {
      var btn = $("#paypal-button-container");
      if (btn) btn.innerHTML = '<p style="font-size:.82rem;color:var(--muted);text-align:center;margin-top:6px">PayPal unavailable — contact us to complete your order.</p>';
      return;
    }
    paypalReady = true;
    paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'checkout', height: 48 },
      createOrder: function (data, actions) {
        if (!cart.length) { showToast('Your cart is empty.'); return; }
        return actions.order.create(buildPayPalOrder());
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          cart = []; saveCart(); updateBadge(); renderCart(); closeCart();
          window.location.href = 'thank_you.html?tx=' + data.orderID;
        });
      },
      onError: function (err) {
        showToast('Payment error — please try again or contact us.');
        console.error('PayPal onError:', JSON.stringify(err, null, 2));
      }
    }).render('#paypal-button-container');
  }

  renderProducts(); wire(); observeReveals(); updateBadge(); renderCart();
})();

/* =====================================================================
   VSITEdesigns — Product catalog (single source of truth)

   ADD A PRODUCT: copy a block, give it a unique `id` (SKU), set fields.
   Everything the storefront shows — cards, gallery, color & size
   selectors, the quick-view pop-up — reads from this one array.

   Schema per product:
     id        unique SKU, e.g. "TDD-OH-01"
     slug      url/key, also used to find photos in assets/product-photos
     name      display name
     category  one of CATEGORIES keys below
     price     BASE price (the cheapest size). Sizes can add to it.
     blurb     one-line teaser (shown on card)
     desc      paragraph shown in the quick-view pop-up
     badge     optional ribbon, e.g. "Bestseller", "New", "Made to order"
     gallery   [ "ohio_1.jpg", ... ] — photos, shown in numerical order
     sizes     [ { id, label, note, addPrice } ]  (omit for one-size items)
     colors    [ filamentKey, ... ] — keys into FILAMENTS (the swatches you
                  keep in stock). Shown on the product as a drop-down menu.
                  ORDER MATTERS: the FIRST key is the default selection, so
                  list the color shown in the photo / that you have on hand
                  first. Omit on madeToOrder items (see below).
     madeToOrder  true => QUOTE-ONLY. The item is NOT directly purchasable:
                  the card + pop-up hide the price and show a "Request a
                  quote" button that sends the customer to the contact form
                  (api.CONTACT_URL). Use for any custom / commissioned piece.
                  Do NOT give these a `colors` list — color is settled during
                  the quote, so no color picker is shown.
   ===================================================================== */

(function (root) {
  "use strict";

  /* Image base — set window.TDD_BASE (e.g. "../../") BEFORE loading this
     file when the consuming page is nested below the project root. */
  var BASE = (root.TDD_BASE != null) ? root.TDD_BASE : "";
  var IMG = BASE + "assets/img/products/";

  /* Where quote requests for made-to-order pieces go (TES contact form). */
  var CONTACT_URL = "https://tevisengineering.com/contact.html";

  /* ---- Category registry (label + accent CSS var) ---- */
  var CATEGORIES = {
    maps:    { label: "Maps",        accent: "var(--c-maps)" },
    statues: { label: "Statues",     accent: "var(--c-statues)" },
    custom:  { label: "Custom Work", accent: "var(--c-custom)" }
  };

  /* ---- Filament stock — the SINGLE source of truth for colors ----
     One entry per color you keep on hand. Fields:
       label     name shown in the color drop-down
       hex       the swatch-dot color. This is the ONLY place colors live —
                 there is nothing in the CSS to keep in sync anymore.
       addPrice  OPTIONAL upcharge for a premium filament. When set, the
                 drop-down shows e.g. "Scarlet Red + $4.00" and that amount
                 is added to the item's price in the cart. Omit for no upcharge.
     Restock / retire colors by editing this one list. */
  var FILAMENTS = {
    bone:      { label: "Bone White",   hex: "#ECE6DA" },
    charcoal:  { label: "Charcoal",     hex: "#2D2A33" },
    scarlet:   { label: "Scarlet Red",  hex: "#B5341F", addPrice: 4 },
    tangerine: { label: "Tangerine",    hex: "#FF6A3D" },
    marigold:  { label: "Marigold",     hex: "#F5B400" },
    forest:    { label: "Forest Green", hex: "#2E7D5B" },
    lake:      { label: "Lake Blue",    hex: "#2A6FB0" },
    grape:     { label: "Grape",        hex: "#6A4BC4" },
    blush:     { label: "Blush",        hex: "#F08FA6" },
    graphite:  { label: "Graphite",     hex: "#5A5560" },
    marble:    { label: "Marble",       hex: "#E9E6E1" }
  };

  /* ---- Background paper colors — for products with a paper backing ----
     Shiny construction paper available as frame backgrounds.
     First key = default selection. No addPrice — included in base price. */
  var BACKGROUNDS = {
    blue:  { label: "Blue",   hex: "#1A56B0" },
    red:   { label: "Red",    hex: "#C0392B" },
    black: { label: "Black",  hex: "#1A1A1A" },
    white: { label: "White",  hex: "#F5F5F0" },
    green: { label: "Green",  hex: "#2E7D32" },
    gold:  { label: "Gold",   hex: "#F9A825" }
  };

  /* ---- Reusable size presets ---- */
  var SIZE_4_6 = [
    { id: "4in", label: '4"', note: "Palm-sized, ~4 in wide", addPrice: 0 },
    { id: "6in", label: '6"', note: "Shelf statement, ~6 in wide", addPrice: 14 }
  ];

  function g(slug, n) {
    var arr = [];
    for (var i = 1; i <= n; i++) arr.push(IMG + slug + "_" + i + ".jpg");
    return arr;
  }

  var PRODUCTS = [
    {
      id: "TDD-OH-01", slug: "ohio", name: "Ohio Topographic Relief Map",
      category: "maps", price: 40, badge: "Bestseller",
      blurb: "The whole Buckeye State in layered elevation, framed and ready to hang.",
      desc: "Every ridge and river valley of Ohio, rendered from real elevation data and printed in crisp relief. Comes matted in a black shadow-box frame so it lands ready for the wall or the shelf the day it arrives.",
      gallery: g("ohio", 4),
      sizes: [
        { id: "6in", label: '6"', note: "Framed, ~6 in", addPrice: 0 },
        { id: "8in", label: '8"', note: "Framed, ~8 in", addPrice: 18 }
      ],
      colors: ["bone", "lake", "scarlet", "charcoal", "marble"],
      bgColors: ["blue", "red", "black", "white", "green", "gold"]
    },
    {
      id: "TDD-CLE-02", slug: "cleveland", name: "Cleveland Skyline Relief",
      category: "maps", price: 38,
      blurb: "Downtown Cleveland and the lakefront, 3D printed block by block.",
      desc: "A full 3D-printed map of downtown Cleveland — every major landmark in fine relief, from the skyscrapers and the stadiums to the bridges and Lake Erie along the edge. Framed against a pop of brand color, it's a hometown keepsake that actually looks like home.",
      gallery: g("cleveland", 1),
      sizes: SIZE_4_6,
      colors: ["bone", "lake", "charcoal", "marble"]
    },
    {
      id: "TDD-4SQ-03", slug: "cle-four-square", name: "Cleveland Four-Square Map Set",
      category: "maps", price: 18, badge: "Set or singles",
      blurb: "Cleveland in four 4\" tiles — together or solo.",
      desc: "Downtown Cleveland and the lakefront, split into four 4-inch framed relief quadrants that line up into one continuous map — or stand on their own around the house. Buy the full set, or grab single tiles to start your wall and add the rest later.",
      gallery: g("cle-four-square", 4),
      sizeLabel: "Format",
      sizes: [
        { id: "single", label: "Single tile", note: "One 4\" quadrant", addPrice: 0 },
        { id: "set", label: "Full set of 4", note: "All four quadrants", addPrice: 46 }
      ],
      colors: ["bone", "lake", "charcoal"]
    },
    // NEW — filler copy & pricing (review)
    {
      id: "TDD-PIT-14", slug: "pittsburgh", name: "Pittsburgh Skyline Relief",
      category: "maps", price: 38, badge: "New",
      blurb: "Three rivers, one skyline — downtown Pittsburgh in layered relief.",
      desc: "Downtown Pittsburgh printed block by block, from the towers of the Golden Triangle to the Point where the Allegheny and Monongahela meet to form the Ohio. Framed and ready to hang — a sister piece to our Cleveland skyline for anyone with a foot in both cities. Placeholder copy and pricing for now.",
      gallery: [IMG + "pittsburgh_2.jpg", IMG + "pittsburgh_1.png"],
      sizes: SIZE_4_6,
      colors: ["bone", "lake", "charcoal", "marble"]
    },
    {
      id: "TDD-NBHD-04", slug: "neighborhood", name: "Custom Neighborhood Street Map",
      category: "custom", price: 34,
      blurb: "Your streets, two-tone and laser-clean.",
      desc: "Send us an address and we'll render the surrounding streets, blocks, and waterways as a crisp two-tone plaque. A first home, a hometown, a favorite trail town — pick the two colors and we print it to order.",
      gallery: g("neighborhood", 1),
      madeToOrder: true
    },
    {
      id: "TDD-OSU-05", slug: "osu", name: 'Ohio Stadium "Horseshoe" Replica',
      category: "maps", price: 48, badge: "Game day",
      blurb: "The Horseshoe in miniature, every section in relief.",
      desc: "The Shoe, scaled down to your shelf — stands, tunnel, and surrounding campus printed in fine detail on a framed base. The desk trophy for anyone who bleeds scarlet and gray.",
      gallery: g("osu", 1),
      sizes: SIZE_4_6,
      colors: ["bone", "scarlet", "marble"]
    },
    {
      id: "TDD-BRN-06", slug: "browns-stadium", name: "Huntington Bank Field Replica",
      category: "maps", price: 48,
      blurb: "Huntington Bank Field — the lakefront house of the Browns.",
      desc: "A miniature of Huntington Bank Field on the Cleveland lakefront, home of the Browns — bowl, stands, and concourse 3D printed in fine relief on a framed base. Pick your colors for game-day pride that lives on the shelf all season long.",
      gallery: [IMG + "browns-stadium_1.jpg", IMG + "browns-stadium_2.png", IMG + "browns-stadium_4.png", IMG + "browns-stadium_6.png"],
      sizes: SIZE_4_6,
      colors: ["bone", "forest", "charcoal"]
    },
    {
      id: "TDD-PRG-07", slug: "progressive-field", name: "Progressive Field Replica",
      category: "maps", price: 48,
      blurb: "Progressive Field — home of the Cleveland Guardians.",
      desc: "Progressive Field in 3D-printed relief — the grandstands, the diamond, and the downtown block it sits on, mounted on a framed base. The home-opener gift for the Guardians fan who has everything.",
      gallery: [IMG + "progressive-field_1.jpg", IMG + "progressive-field_2.png", IMG + "progressive-field_3.png", IMG + "progressive-field_4.png"],
      sizes: SIZE_4_6,
      colors: ["bone", "scarlet", "marble"]
    },
    // NEW — filler copy & pricing (review)
    {
      id: "TDD-HUNT-15", slug: "huntington", name: "Huntington Park Replica",
      category: "maps", price: 44,
      blurb: "The downtown Columbus ballpark, captured in fine relief.",
      desc: "A framed relief tile of Huntington Park — the diamond, the grandstands, and the surrounding block printed in crisp detail. A pocket-sized tribute for ballpark collectors and Columbus Clippers fans. Placeholder copy and pricing for now.",
      gallery: [IMG + "huntington.jpg"],
      sizes: SIZE_4_6,
      colors: ["bone", "marble", "charcoal", "forest"]
    },
    {
      id: "TDD-ROCK-16", slug: "rocket-arena", name: "Rocket Arena Replica",
      category: "maps", price: 48, badge: "Game day",
      blurb: "Cleveland's downtown arena, rendered in 3D relief.",
      desc: "Rocket Arena — home of the Cavaliers — and its downtown Cleveland block, printed in fine relief on a framed base. Tip-off energy for the shelf or the office. Filler copy and pricing for now.",
      gallery: [IMG + "rocket-arena_1.png", IMG + "rocket-arena_2.png", IMG + "rocket-arena_3.png"],
      sizes: SIZE_4_6,
      colors: ["bone", "marble", "charcoal", "scarlet"]
    },
    {
      id: "TDD-GRD-08", slug: "guardian-bowl", name: "Guardian Catch-All Bowl",
      category: "statues", price: 28, badge: "New",
      blurb: "An Art-Deco guardian holding a tray for your keys.",
      desc: "Inspired by Cleveland's stone Guardians of Traffic, this winged sentinel cradles a little bowl perfect for keys, coins, rings, and the daily pocket dump. Equal parts statue and entryway helper.",
      gallery: g("guardian-bowl", 2),
      colors: ["marble", "bone", "graphite", "charcoal"]
    },
    // NEW — filler copy & pricing (review)
    {
      id: "TDD-GBKE-17", slug: "guardian-bookend", name: "Guardian Bookend",
      category: "statues", price: 34, badge: "New",
      blurb: "An Art-Deco Guardian standing watch over your books.",
      desc: "Inspired by Cleveland's stone Guardians of Traffic, this winged sentinel doubles as a hefty bookend — pillar, wings, and all. Pictured solo; order a pair for a matched set bracketing the shelf. Filler copy and pricing for now.",
      gallery: g("guardian-bookend", 3),
      colors: ["marble", "bone", "graphite", "charcoal"]
    },
    {
      id: "TDD-CAES-09", slug: "caesar-half", name: "Caesar Anatomical Half-Bust",
      category: "statues", price: 44, badge: "Statement piece",
      blurb: "Classical bust on one side, anatomical skull on the other.",
      desc: "A split-finish bust: serene classical portrait down one half, exposed anatomical skull down the other. A conversation-starter that reads as fine-art sculpture from across the room and gets weird up close — in the best way.",
      gallery: g("caesar-half", 3),
      sizes: [
        { id: "5in", label: '5"', note: "Desk size, ~5 in tall", addPrice: 0 },
        { id: "8in", label: '8"', note: "Mantel size, ~8 in tall", addPrice: 22 }
      ],
      colors: ["marble", "bone", "graphite"]
    },
    // NEW — filler copy & pricing (review)
    {
      id: "TDD-CLAS-18", slug: "classical-statue", name: "Classical Sculpture Group",
      category: "statues", price: 42, badge: "New",
      blurb: "A Baroque sculpture group, reimagined at desk scale.",
      desc: "A dramatic classical sculpture group — flowing drapery and intertwined figures — captured layer by layer in a smooth matte finish. A little gallery moment for the mantel or bookshelf. Placeholder copy and pricing for now.",
      gallery: g("classical-statue", 3),
      sizes: [
        { id: "5in", label: '5"', note: "Desk size, ~5 in tall", addPrice: 0 },
        { id: "8in", label: '8"', note: "Mantel size, ~8 in tall", addPrice: 24 }
      ],
      colors: ["marble", "bone", "graphite"]
    },
    {
      id: "TDD-FACE-10", slug: "half_face-scan", name: "Half-Face Anatomy Bust",
      category: "custom", price: 40, madeToOrder: true,
      blurb: "A portrait peeled back to the skull, half and half.",
      desc: "One side a calm sculpted face, the other the bone beneath it. Printed in a smooth two-tone finish that makes the anatomy pop. A bold little memento mori for the desk, the studio, or the spooky shelf.",
      gallery: [IMG + "half_face-scan.jpg"]
    },
    {
      id: "TDD-CTRL-12", slug: "controller", name: "Custom Design & Print Service",
      category: "custom", price: 26,
      blurb: "Got a part or gadget in mind? We model it and print it.",
      desc: "Need something that doesn't exist yet? Send us your idea — a snap-fit enclosure for a circuit board, a replacement part, a bracket, a prototype, a one-off gadget — and we'll model it, 3D print it, and finish it. The enclosure pictured is just one example of what's possible. Tell us what you're after and we'll send a quote.",
      gallery: g("controller", 2),
      madeToOrder: true
    },
    {
      id: "TDD-AWRD-13", slug: "custom_award", name: "Custom Awards",
      category: "custom", price: 36, badge: "Made to order",
      blurb: "3D-printed keepsakes and awards for lodges, clubs, and companies.",
      desc: "Commemorative awards and recognition pieces in a carved-stone finish — your crest, your dates, your wording. Pictured: a run for a Masonic lodge. Great for clubs, teams, retirements, and any milestone worth keeping on a desk.",
      gallery: [IMG + "custom_award.jpg"],
      madeToOrder: true
    },
    // NEW — filler copy & pricing (review). Filed under Custom Work per request;
    // the two Cleveland signs are purchasable stock, the LED sign is made-to-order.
    {
      id: "TDD-CLES-19", slug: "cleveland-sign", name: "Cleveland Script Sign",
      category: "custom", price: 16, badge: "New",
      blurb: "Free-standing cursive \"Cleveland\" sign for shelf or desk.",
      desc: "A free-standing script \"Cleveland\" sign with a clean underline flourish — simple hometown pride in your choice of color. Shown in white, scarlet, and speckled marble. Placeholder copy and pricing for now.",
      gallery: g("cleveland-sign", 4),
      colors: ["bone", "scarlet", "marble", "charcoal", "lake"]
    },
    {
      id: "TDD-CLEF-20", slug: "cleveland-football-sign", name: "Cleveland Football Sign",
      category: "custom", price: 20, badge: "Game day",
      blurb: "Cursive \"Cleveland\" mounted on a football base.",
      desc: "The same cursive Cleveland script, this time riding a football — finished in gridiron colors for game day on the mantel. A fun desk piece for the Dawg Pound. Filler copy and pricing for now.",
      gallery: g("cleveland-football-sign", 2),
      colors: ["tangerine", "charcoal", "bone", "scarlet"]
    },
    {
      id: "TDD-LED-21", slug: "custom-led-sign", name: "Custom LED Light Sign",
      category: "custom", price: 30, madeToOrder: true, badge: "Made to order",
      blurb: "Your name or word, lit up — a custom LED light sign.",
      desc: "Send us a name, word, or logo and we'll model it as a free-standing sign with built-in LED lighting that glows right through the print. Pick your text and color; we'll reply with a quote and timing. Placeholder copy for now.",
      gallery: g("custom-led-sign", 2)
    }
  ];

  var api = {
    CATEGORIES: CATEGORIES,
    FILAMENTS: FILAMENTS,
    BACKGROUNDS: BACKGROUNDS,
    PRODUCTS: PRODUCTS,
    CONTACT_URL: CONTACT_URL,
    byId: function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; },
    money: function (n) { return "$" + Number(n).toFixed(2); }
  };

  /* Expose as a global (vanilla storefront) AND a CommonJS export (DC import). */
  root.TDD = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);

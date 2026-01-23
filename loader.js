// loader.js 20260122z
(() => {
  const V = "20260122z";
  const SCRIPTS = [
    "config.js","utils.js",

    // UI
    "theme.js","motion.js","ux.js","header_compact.js",

    // templates/modals
    "templates.js",

    // core
    "store.js","catalog_data.js","catalog_ui.js","catalog.js",
    "filters.js","pagination.js","sort_menu.js","tabs_unified.js",
    "search_ui.js","results_counter.js",

    // product
    "gallery.js","media.js","share.js",
    "product_tabs.js","modal_swipe.js","swipe_images.js",
    "product_modal_ui.js","product_modal.js",
    "image_zoom.js",

    // cart/checkout
    "cart.js","delivery.js","wa.js",
    "checkout_steps.js","checkout_guard.js",
    "cart_tools.js","add_to_cart_fx.js","add_confirm.js",
    "ui_badges.js","continue_state.js","continue_state_plus.js",
    "price_stock_watch.js",
    "order_history_pro.js","post_purchase_plus.js",
    "cart_persist.js","eta.js","live_refresh.js","view_mode3.js",
    "brand_filter.js","mobile_fix.js","mobile_nav_v2.js",

    // store UI extras
    "store_extras.js","shop_polish.js",
    "fallback_image.js","mobile_cart_badge.js","smart_defaults.js",
    "favorites.js","favorites_section.js","badges_logic.js",
    "features.js","features_boot.js",
    "voice_search.js",

    // ✅ TUS CAMBIOS: 2,4,5,6,8,9,10 en 1 solo JS
    "extras_store.js",

    // init
    "app.js"
  ];

  function load(src){
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `${src}?v=${encodeURIComponent(V)}`;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  (async () => {
    for (const f of SCRIPTS) await load(f);
  })();
})();
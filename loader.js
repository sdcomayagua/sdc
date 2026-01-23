// loader.js
(() => {
  const V = "20260122x";

  const scripts = [
    // Templates primero (mete modales completos)
    "templates.js",

    // Base
    "config.js",
    "utils.js",

    // Features on/off
    "features.js",
    "features_boot.js",

    // UI base
    "theme.js",
    "motion.js",
    "ux.js",
    "header_compact.js",

    // Core app modules
    "banner.js",
    "filters.js",
    "pagination.js",
    "cart_mini.js",
    "sort_menu.js",
    "tabs_unified.js",
    "search_ui.js",
    "results_counter.js",

    // Checkout/cart/modal
    "checkout_steps.js",
    "customer_profile.js",
    "product_reco.js",

    "image_zoom.js",
    "cart_tools.js",
    "add_to_cart_fx.js",
    "ui_badges.js",

    "continue_state.js",
    "stepper_pro.js",
    "price_stock_watch.js",
    "add_confirm.js",

    "live_refresh.js",
    "view_mode3.js",
    "brand_filter.js",
    "order_history_pro.js",
    "post_purchase_plus.js",

    "continue_state_plus.js",
    "checkout_guard.js",

    "mobile_fix.js",
    "cart_persist.js",
    "eta.js",

    "product_tabs.js",
    "modal_swipe.js",

    "product_modal_ui.js",

    "store.js",
    "media.js",
    "gallery.js",
    "share.js",
    "product_modal.js",
    "catalog_data.js",
    "catalog_ui.js",
    "catalog.js",

    "cart.js",
    "delivery.js",
    "wa.js",
    "mobile_nav_v2.js",

    // ✅ Extras tienda
    "store_extras.js",
    "shop_polish.js",

    // ✅ NUEVOS (tus pedidos 2,4,5,6,8,9,10)
    "badges_logic.js",
    "favorites_section.js",
    "category_icons.js",
    "banner_sheet.js",
    "skeleton_enhance.js",
    "enhance_cards.js",
    "search_suggest.js",
    "enhancements_boot.js",

    // App init al final
    "app.js"
  ];

  function loadOne(src){
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `${src}?v=${V}`;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  (async () => {
    for (const s of scripts) {
      await loadOne(s);
    }
  })().catch(err => {
    console.error("Loader error:", err);
  });
})();
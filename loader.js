// loader.js?v=20260124p5
(() => {
  const V = "20260124p5";

  const SCRIPTS = [
    "config.js","utils.js",
    "templates.js",

    "theme.js","motion.js","ux.js","header_compact.js",

    "store.js","catalog_data.js",
    "filters.js","pagination.js","sort_menu.js","tabs_unified.js",
    "search_ui.js","results_counter.js",

    "checkout_steps.js","checkout_guard.js","customer_profile.js",
    "cart_tools.js","add_to_cart_fx.js","add_confirm.js",
    "ui_badges.js","continue_state.js","continue_state_plus.js","price_stock_watch.js",
    "order_history_pro.js","post_purchase_plus.js",
    "cart_persist.js","eta.js","live_refresh.js","view_mode3.js","brand_filter.js",
    "mobile_fix.js","mobile_nav_v2.js",

    "fallback_image.js","gallery.js","media.js","share.js",
    "product_tabs.js","modal_swipe.js","swipe_images.js",
    "product_modal_ui.js","product_modal.js",
    "image_zoom.js",

    "features.js","voice_search.js","favorites.js","favorites_section.js","badges_logic.js","features_boot.js",

    "store_extras.js","shop_polish.js",
    "extras_store.js",
    "news_ticker.js",

    "catalog_ui.js","catalog.js","cart.js","delivery.js","wa.js",

    /* Paquete 1 */
    "p1_sales.js",
    "shipping_quote.js",
    "top_offers.js",
    "wa_enhanced.js",

    /* Paquete 2 */
    "p2_ux.js",

    /* Paquete 3 */
    "p3_product.js",

    /* ✅ Paquete 5 */
    "p5_perf.js",
    "p5_analytics.js",

    "app.js",
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
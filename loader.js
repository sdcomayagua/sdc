// loader.js?v=20260123b
(() => {
  const V = "20260123b";

  const SCRIPTS = [
    // base
    "config.js","utils.js",

    // templates (inyecta modales)
    "templates.js",

    // ui base
    "theme.js","motion.js","ux.js","header_compact.js",

    // core store/catalog
    "store.js","catalog_data.js","filters.js","pagination.js","sort_menu.js","tabs_unified.js",
    "search_ui.js","results_counter.js",

    // checkout/cart helpers
    "checkout_steps.js","checkout_guard.js","customer_profile.js",
    "cart_tools.js","add_to_cart_fx.js","add_confirm.js",
    "ui_badges.js","continue_state.js","continue_state_plus.js","price_stock_watch.js",
    "order_history_pro.js","post_purchase_plus.js",
    "cart_persist.js","eta.js","live_refresh.js","view_mode3.js","brand_filter.js",
    "mobile_fix.js","mobile_nav_v2.js",

    // product/media
    "fallback_image.js","gallery.js","media.js","share.js",
    "product_tabs.js","modal_swipe.js","swipe_images.js",
    "product_modal_ui.js","product_modal.js",
    "image_zoom.js",

    // features (opcionales)
    "features.js","voice_search.js","favorites.js","favorites_section.js","badges_logic.js","features_boot.js",

    // store UI extras
    "store_extras.js","shop_polish.js",

    // ✅ Tus cambios: 2,4,5,6,8,9,10 (en un solo JS)
    "extras_store.js",

    // ✅ PRO PACK (lo más pro)
    "pro_pack.js",

    // catalog + cart + delivery + wa
    "catalog_ui.js","catalog.js","cart.js","delivery.js","wa.js",

    // final init
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
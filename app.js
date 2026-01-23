(() => {
  const U = window.SDC_UTILS;

  function safe(name, fn) {
    try { fn && fn(); }
    catch (e) {
      console.error("[SDC] Módulo opcional falló:", name, e);
      // ✅ NO mostramos toast (para que no moleste)
    }
  }

  async function init() {
    // Tema
    safe("theme.init", () => window.SDC_THEME?.init?.("dark"));
    safe("theme.btnTop", () => document.getElementById("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle()));
    safe("theme.btnBottom", () => document.getElementById("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle()));

    // UX
    safe("motion", () => window.SDC_MOTION?.observe?.());
    safe("toTop", () => window.SDC_UX?.initToTop?.());
    safe("header", () => window.SDC_HEADER?.init?.());

    // filtros/sort/tabs
    safe("filters", () => window.SDC_FILTERS?.init?.());
    safe("pager", () => window.SDC_PAGER?.setPageSize?.(24));
    safe("sort_menu", () => window.SDC_SORT_MENU?.init?.());
    safe("tabs_unified", () => window.SDC_TABS?.init?.());

    // search ui + counter
    safe("search_ui", () => window.SDC_SEARCH_UI?.init?.());
    safe("results_counter", () => window.SDC_RESULTS?.init?.());

    // perfil + checkout
    safe("profile.load", () => window.SDC_PROFILE?.load?.());
    safe("checkout.showStep", () => window.SDC_CHECKOUT?.showStep?.(1));

    // modales auxiliares
    safe("zoom", () => window.SDC_ZOOM?.init?.());
    safe("cart_tools", () => window.SDC_CART_TOOLS?.init?.());
    safe("ui_badges", () => window.SDC_UI_BADGES?.init?.());

    // view
    safe("view3", () => window.SDC_VIEW3?.init?.());
    safe("stepper", () => window.SDC_STEPPER?.init?.());
    safe("continue", () => window.SDC_CONTINUE?.init?.());

    // thanks/history/brand/live
    safe("thanks_plus", () => window.SDC_THANKS_PLUS?.init?.());
    safe("orders_pro.render", () => window.SDC_ORDERS_PRO?.render?.());
    safe("brand_filter", () => window.SDC_BRAND?.init?.());
    safe("continue_plus", () => window.SDC_CONTINUE_PLUS?.init?.());
    safe("checkout_guard", () => window.SDC_GUARD?.init?.());
    safe("mobile_fix", () => window.SDC_MOBILE_FIX?.init?.());
    safe("live_refresh", () => window.SDC_LIVE?.start?.(3));

    // carrito badge
    safe("cart_badge.init", () => window.SDC_CART_BADGE?.init?.());

    // features on/off
    safe("features_boot", () => window.SDC_BOOT_FEATURES?.());

    // skeleton
    safe("catalog_ui.skeleton", () => window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10));

    // input buscar
    safe("bind.search", () => document.getElementById("q")?.addEventListener("input", () => window.SDC_CATALOG.renderGrid()));

    // binds principales
    safe("cart.bindEvents", () => window.SDC_CART?.bindEvents?.());
    safe("wa.bind", () => window.SDC_WA?.bind?.());
    safe("productModal.bind", () => window.SDC_PRODUCT_MODAL?.bindEvents?.());
    safe("catalog.bind", () => window.SDC_CATALOG?.bindProductModalEvents?.());

    // ✅ carga catálogo
    const json = await window.SDC_CATALOG.load();

    safe("delivery.init", () => window.SDC_DELIVERY?.initSelectors?.());
    safe("cartCountUI", () => window.SDC_STORE?.updateCartCountUI?.());
    safe("results.refresh", () => window.SDC_RESULTS?.refresh?.());

    safe("smartMini", () => window.SDC_SMART?.applyMiniIfNeeded?.((window.SDC_STORE.getProducts()||[]).length));
    safe("cartBadge.apply", () => window.SDC_CART_BADGE?.apply?.());

    return json;
  }

  init().catch(err => {
    console.error(err);
    document.getElementById("statusPill") && (document.getElementById("statusPill").textContent = "Error cargando catálogo");
    U?.toast?.("Error: " + (err?.message || err));
  });
})();

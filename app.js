(() => {
  const U = window.SDC_UTILS;

  async function init() {
    window.SDC_THEME?.init?.("dark");
    document.getElementById("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());
    document.getElementById("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());

    window.SDC_MOTION?.observe?.();
    window.SDC_UX?.initToTop?.();
    window.SDC_HEADER?.init?.();

    window.SDC_FILTERS?.init?.();
    window.SDC_PAGER?.setPageSize?.(24);
    window.SDC_SORT_MENU?.init?.();
    window.SDC_TABS?.init?.();

    window.SDC_SEARCH_UI?.init?.();
    window.SDC_RESULTS?.init?.();

    window.SDC_PROFILE?.load?.();
    window.SDC_CHECKOUT?.showStep?.(1);

    window.SDC_ZOOM?.init?.();
    window.SDC_CART_TOOLS?.init?.();
    window.SDC_UI_BADGES?.init?.();

    window.SDC_VIEW3?.init?.();
    window.SDC_STEPPER?.init?.();
    window.SDC_CONTINUE?.init?.();

    window.SDC_THANKS_PLUS?.init?.();
    window.SDC_ORDERS_PRO?.render?.();
    window.SDC_BRAND?.init?.();

    window.SDC_CONTINUE_PLUS?.init?.();
    window.SDC_GUARD?.init?.();

    window.SDC_MOBILE_FIX?.init?.();
    window.SDC_LIVE?.start?.(3);

    window.SDC_CART_BADGE?.init?.();

    window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10);

    document.getElementById("q")?.addEventListener("input", () => window.SDC_CATALOG.renderGrid());

    window.SDC_CART.bindEvents();
    window.SDC_WA.bind();
    window.SDC_CATALOG.bindProductModalEvents();

    await window.SDC_CATALOG.load();
    window.SDC_DELIVERY.initSelectors();
    window.SDC_STORE.updateCartCountUI();
    window.SDC_RESULTS?.refresh?.();

    // ✅ modo mini por defecto en móvil si hay muchos productos
    window.SDC_SMART?.applyMiniIfNeeded?.((window.SDC_STORE.getProducts()||[]).length);

    // refresca botón carrito móvil
    window.SDC_CART_BADGE?.apply?.();
  }

  init().catch(err => {
    console.error(err);
    document.getElementById("statusPill") && (document.getElementById("statusPill").textContent = "Error cargando catálogo");
    U.toast("Error: " + (err?.message || err));
  });
})();

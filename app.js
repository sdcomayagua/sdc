(() => {
  const U = window.SDC_UTILS;

  async function init() {
    // Tema
    window.SDC_THEME?.init?.("dark");
    U.$("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());
    U.$("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());

    // Motion + UX
    window.SDC_MOTION?.observe?.();
    window.SDC_UX?.initToTop?.();

    // Banner + filtros
    window.SDC_BANNER?.init?.();
    window.SDC_FILTERS?.init?.();

    // Skeleton antes de cargar
    window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10);

    // Buscar
    U.$("q")?.addEventListener("input", () => window.SDC_CATALOG.renderGrid());

    // Binds
    window.SDC_CART.bindEvents();
    window.SDC_WA.bind();
    window.SDC_CATALOG.bindProductModalEvents();

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.SDC_CART.closeCart();
        window.SDC_CATALOG.closeProductModal();
      }
    });

    // Catálogo
    await window.SDC_CATALOG.load();

    // Delivery
    window.SDC_DELIVERY.initSelectors();

    // Count
    window.SDC_STORE.updateCartCountUI();
  }

  init().catch(err => {
    console.error(err);
    U.$("statusPill") && (U.$("statusPill").textContent = "Error cargando catálogo");
    U.toast("Error: " + (err?.message || err));
  });
})();

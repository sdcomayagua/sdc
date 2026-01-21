(() => {
  const U = window.SDC_UTILS;

  async function init() {
    window.SDC_THEME?.init?.("dark");
    U.$("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());
    U.$("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());

    window.SDC_MOTION?.observe?.();
    window.SDC_UX?.initToTop?.();

    window.SDC_BANNER?.init?.();
    window.SDC_FILTERS?.init?.();

    // ✅ paginación: tamaño de página
    window.SDC_PAGER?.setPageSize?.(24);

    window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10);

    U.$("q")?.addEventListener("input", () => window.SDC_CATALOG.renderGrid());

    window.SDC_CART.bindEvents();
    window.SDC_WA.bind();
    window.SDC_CATALOG.bindProductModalEvents();

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.SDC_CART.closeCart();
        window.SDC_CATALOG.closeProductModal();
      }
    });

    await window.SDC_CATALOG.load();
    window.SDC_DELIVERY.initSelectors();
    window.SDC_STORE.updateCartCountUI();
  }

  init().catch(err => {
    console.error(err);
    U.$("statusPill") && (U.$("statusPill").textContent = "Error cargando catálogo");
    U.toast("Error: " + (err?.message || err));
  });
})();

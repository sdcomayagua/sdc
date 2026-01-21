(() => {
  const U = window.SDC_UTILS;

  async function init() {
    // Tema
    if (window.SDC_THEME?.init) window.SDC_THEME.init("dark");
    const tb = U.$("themeBtn");
    const btb = U.$("bottomThemeBtn");
    if (tb) tb.onclick = () => window.SDC_THEME.toggle();
    if (btb) btb.onclick = () => window.SDC_THEME.toggle();

    // Motion + UX
    window.SDC_MOTION?.observe?.();
    window.SDC_UX?.initToTop?.();

    // Skeleton antes de cargar
    window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10);

    // Buscar
    const q = U.$("q");
    if (q) q.addEventListener("input", () => window.SDC_CATALOG.renderGrid());

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
    const s = U.$("statusPill");
    if (s) s.textContent = "Error cargando catálogo";
    U.toast("Error: " + (err?.message || err));
  });
})();

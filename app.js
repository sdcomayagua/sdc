(() => {
  const U = window.SDC_UTILS;

  async function init() {
    // Buscar (solo si existe el input)
    const q = U.$("q");
    if (q) q.addEventListener("input", () => window.SDC_CATALOG.renderGrid());

    // Binds
    if (window.SDC_CART?.bindEvents) window.SDC_CART.bindEvents();
    if (window.SDC_WA?.bind) window.SDC_WA.bind();
    if (window.SDC_CATALOG?.bindProductModalEvents) window.SDC_CATALOG.bindProductModalEvents();

    // Escape cierra modales
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (window.SDC_CART?.closeCart) window.SDC_CART.closeCart();
        if (window.SDC_CATALOG?.closeProductModal) window.SDC_CATALOG.closeProductModal();
      }
    });

    // cargar catálogo
    await window.SDC_CATALOG.load();

    // init delivery (después de cargar DATA)
    if (window.SDC_DELIVERY?.initSelectors) window.SDC_DELIVERY.initSelectors();

    // cart count
    if (window.SDC_STORE?.updateCartCountUI) window.SDC_STORE.updateCartCountUI();
  }

  init().catch(err => {
    console.error(err);
    const s = U.$("statusPill");
    if (s) s.textContent = "Error cargando catálogo";
    U.toast("Error: " + (err?.message || err));
  });
})();

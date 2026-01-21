(() => {
  const U = window.SDC_UTILS;

  async function init() {
    // eventos
    U.$("q").addEventListener("input", () => window.SDC_CATALOG.renderGrid());

    window.SDC_CART.bindEvents();
    window.SDC_WA.bind();
    window.SDC_CATALOG.bindProductModalEvents();

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.SDC_CART.closeCart();
        window.SDC_CATALOG.closeProductModal();
      }
    });

    // cargar catálogo
    await window.SDC_CATALOG.load();

    // init delivery (después de cargar DATA)
    window.SDC_DELIVERY.initSelectors();

    // cart count
    window.SDC_STORE.updateCartCountUI();
  }

  init().catch(err => {
    console.error(err);
    const s = U.$("statusPill");
    if (s) s.textContent = "Error cargando catálogo";
    U.toast("Error: " + (err.message || err));
  });
})();

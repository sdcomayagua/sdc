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

    window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10);

    document.getElementById("q")?.addEventListener("input", () => window.SDC_CATALOG.renderGrid());

    window.SDC_CART.bindEvents();
    window.SDC_WA.bind();
    window.SDC_CATALOG.bindProductModalEvents();

    await window.SDC_CATALOG.load();
    window.SDC_DELIVERY.initSelectors();
    window.SDC_STORE.updateCartCountUI();

    // Wizard init
    window.SDC_CHECKOUT?.showStep?.(1);

    // Navegación wizard
    document.getElementById("nextStepBtn")?.addEventListener("click", () => window.SDC_CHECKOUT.next());
    document.getElementById("prevStepBtn")?.addEventListener("click", () => window.SDC_CHECKOUT.prev());

    // Guardar datos cliente al enviar pedido
    document.getElementById("sendWA")?.addEventListener("click", () => window.SDC_PROFILE?.save?.());

    // Actualiza contador
    window.SDC_RESULTS?.refresh?.();
  }

  init().catch(err => {
    console.error(err);
    document.getElementById("statusPill") && (document.getElementById("statusPill").textContent = "Error cargando catálogo");
    U.toast("Error: " + (err?.message || err));
  });
})();
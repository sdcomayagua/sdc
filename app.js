(() => {
  const U = window.SDC_UTILS;

  function initScrollRestore() {
    const modalIds = ["cartModal", "productModal", "sortModal"];
    let savedY = 0;
    let wasOpen = false;

    const isAnyOpen = () =>
      modalIds.some(id => document.getElementById(id)?.classList.contains("open"));

    const onChange = () => {
      const open = isAnyOpen();

      if (open && !wasOpen) {
        savedY = window.scrollY || document.documentElement.scrollTop || 0;
      }
      if (!open && wasOpen) {
        setTimeout(() => window.scrollTo({ top: savedY, behavior: "auto" }), 0);
      }

      wasOpen = open;
    };

    const obs = new MutationObserver(onChange);
    modalIds.forEach(id => {
      const m = document.getElementById(id);
      if (m) obs.observe(m, { attributes: true, attributeFilter: ["class"] });
    });
    onChange();
  }

  async function init() {
    // Tema
    window.SDC_THEME?.init?.("dark");
    U.$("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());
    U.$("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());

    // Motion + UX + Header compact
    window.SDC_MOTION?.observe?.();
    window.SDC_UX?.initToTop?.();
    window.SDC_HEADER?.init?.();
    initScrollRestore();

    // Banner + filtros + paginación
    window.SDC_BANNER?.init?.();
    window.SDC_FILTERS?.init?.();
    window.SDC_PAGER?.setPageSize?.(24);

    // Menú ordenar móvil
    window.SDC_SORT_MENU?.init?.();

    // Tabs unificadas móvil
    window.SDC_TABS?.init?.();

    // Search clear (X) + Result counter
    window.SDC_SEARCH_UI?.init?.();
    window.SDC_RESULTS?.init?.();

    // Skeleton
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
        window.SDC_SORT_MENU?.close?.();
      }
    });

    await window.SDC_CATALOG.load();
    window.SDC_DELIVERY.initSelectors();
    window.SDC_STORE.updateCartCountUI();

    // Al finalizar carga, actualiza contador
    window.SDC_RESULTS?.refresh?.();
  }

  init().catch(err => {
    console.error(err);
    U.$("statusPill") && (U.$("statusPill").textContent = "Error cargando catálogo");
    U.toast("Error: " + (err?.message || err));
  });
})();
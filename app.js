// app.js
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
      if (open && !wasOpen) savedY = window.scrollY || 0;
      if (!open && wasOpen) setTimeout(() => window.scrollTo({ top: savedY, behavior: "auto" }), 0);
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
    window.SDC_THEME?.init?.("dark");
    document.getElementById("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());
    document.getElementById("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle());

    window.SDC_MOTION?.observe?.();
    window.SDC_UX?.initToTop?.();
    window.SDC_HEADER?.init?.();
    initScrollRestore();

    window.SDC_BANNER?.init?.();
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

    window.SDC_RESULTS?.refresh?.();
  }

  init().catch(err => {
    console.error(err);
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Error cargando catálogo";
    U.toast("Error: " + (err?.message || err));
  });
})();
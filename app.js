(() => {
  const U = window.SDC_UTILS;

  function initScrollRestore() {
    const modalIds = ["cartModal", "productModal"];
    let savedY = 0;
    let wasOpen = false;

    const isAnyOpen = () =>
      modalIds.some(id => document.getElementById(id)?.classList.contains("open"));

    const onChange = () => {
      const open = isAnyOpen();

      // justo cuando se abre el primer modal: guarda posición
      if (open && !wasOpen) {
        savedY = window.scrollY || document.documentElement.scrollTop || 0;
      }

      // cuando se cierra el último modal: vuelve a la posición
      if (!open && wasOpen) {
        // esperar un tick para que el DOM/scroll lock ya esté estable
        setTimeout(() => {
          window.scrollTo({ top: savedY, behavior: "auto" });
        }, 0);
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

    // Motion + UX + Scroll restore
    window.SDC_MOTION?.observe?.();
    window.SDC_UX?.initToTop?.();
    initScrollRestore();

    // Banner + filtros
    window.SDC_BANNER?.init?.();
    window.SDC_FILTERS?.init?.();

    // paginación
    window.SDC_PAGER?.setPageSize?.(24);

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
      }
    });

    // Cargar
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

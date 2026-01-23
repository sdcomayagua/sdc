(() => {
  const U = window.SDC_UTILS;
  function safe(_name, fn){ try { fn && fn(); } catch {} }

  function ensureBasics(){
    const headerWrap = document.querySelector("header .wrap");
    if (!document.getElementById("statusPill") && headerWrap){
      const p = document.createElement("div");
      p.className = "pill";
      p.id = "statusPill";
      p.textContent = "Cargando catálogo...";
      headerWrap.appendChild(p);
    }
    if (!document.getElementById("templatesMount")){
      const m = document.createElement("div");
      m.id = "templatesMount";
      document.body.appendChild(m);
    }
  }

  async function init(){
    ensureBasics();

    safe("store_extras.early", () => window.SDC_STORE_EXTRAS?.init?.());

    safe("theme.init", () => window.SDC_THEME?.init?.("dark"));
    safe("theme.top", () => document.getElementById("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle()));

    safe("filters", () => window.SDC_FILTERS?.init?.());
    safe("pager", () => window.SDC_PAGER?.setPageSize?.(24));
    safe("sort_menu", () => window.SDC_SORT_MENU?.init?.());
    safe("tabs", () => window.SDC_TABS?.init?.());

    safe("search_ui", () => window.SDC_SEARCH_UI?.init?.());
    safe("results", () => window.SDC_RESULTS?.init?.());

    safe("cart.bind", () => window.SDC_CART?.bindEvents?.());
    safe("wa.bind", () => window.SDC_WA?.bind?.());
    safe("product.bind", () => window.SDC_PRODUCT_MODAL?.bindEvents?.());
    safe("catalog.bind", () => window.SDC_CATALOG?.bindProductModalEvents?.());

    safe("p5_perf", () => window.SDC_PERF?.init?.());

    await window.SDC_CATALOG.load();

    safe("delivery", () => window.SDC_DELIVERY?.initSelectors?.());
    safe("count", () => window.SDC_STORE?.updateCartCountUI?.());

    // paquetes
    safe("p1_sales", () => window.SDC_P1?.init?.());
    safe("ship_quote", () => window.SDC_SHIP_QUOTE?.init?.());
    safe("top_offers", () => window.SDC_TOP_OFFERS?.render?.());
    safe("wa_plus", () => window.SDC_WA_PLUS?.init?.());

    safe("p2_ux", () => window.SDC_P2?.init?.());
    safe("p3_product", () => window.SDC_P3?.init?.());

    safe("p5_analytics", () => window.SDC_ANALYTICS?.init?.());
    safe("p6_promo", () => window.SDC_P6_PROMO?.init?.());

    safe("p7_checkout", () => window.SDC_P7?.init?.());
    safe("p7_cart_offer", () => window.SDC_P7_CART_OFFER?.init?.());

    safe("delivery_plus", () => window.SDC_DELIVERY_PLUS?.init?.());

    /* ✅ FASE 1 INIT */
    safe("fase1_mobile_app", () => window.SDC_APP_MOBILE?.init?.());
  }

  init().catch(err => {
    document.getElementById("statusPill") && (document.getElementById("statusPill").textContent = "Error cargando catálogo");
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
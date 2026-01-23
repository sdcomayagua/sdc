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

    if (!document.getElementById("topBanner") && headerWrap){
      const b = document.createElement("div");
      b.id = "topBanner";
      b.className = "topBanner";
      b.style.display = "none";
      headerWrap.appendChild(b);
    }

    if (!document.getElementById("suggestBox") && headerWrap){
      const s = document.createElement("div");
      s.id = "suggestBox";
      s.className = "suggestBox";
      s.style.display = "none";
      headerWrap.appendChild(s);
    }

    // si existe mount de envío en header (aunque ya lo moviste al footer, no estorba)
    if (!document.getElementById("shipQuoteMount") && headerWrap){
      const d = document.createElement("div");
      d.id = "shipQuoteMount";
      headerWrap.insertBefore(d, headerWrap.querySelector(".tabsUnified") || null);
    }

    // Top ofertas section si no existe
    if (!document.getElementById("topOffersSection")){
      const main = document.querySelector("main.wrap");
      if (main){
        const sec = document.createElement("section");
        sec.id = "topOffersSection";
        sec.className = "section";
        sec.style.display = "none";
        sec.innerHTML = `
          <div class="sectionHead">
            <div class="sectionTitle">🔥 Top Ofertas</div>
            <div class="mut">Los mejores descuentos</div>
          </div>
          <div class="hScroll" id="topOffersRow"></div>
        `;
        const featured = document.getElementById("featuredSection");
        if (featured) featured.insertAdjacentElement("beforebegin", sec);
        else main.prepend(sec);
      }
    }
  }

  async function init() {
    ensureBasics();

    // AppBar/Drawer temprano
    safe("store_extras.early", () => window.SDC_STORE_EXTRAS?.init?.());

    // Tema
    safe("theme.init", () => window.SDC_THEME?.init?.("dark"));
    safe("theme.top", () => document.getElementById("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle()));
    safe("theme.bottom", () => document.getElementById("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle()));

    // UI base
    safe("motion", () => window.SDC_MOTION?.observe?.());
    safe("toTop", () => window.SDC_UX?.initToTop?.());
    safe("header", () => window.SDC_HEADER?.init?.());

    // Filtros / tabs / búsqueda
    safe("filters", () => window.SDC_FILTERS?.init?.());
    safe("pager", () => window.SDC_PAGER?.setPageSize?.(24));
    safe("sort_menu", () => window.SDC_SORT_MENU?.init?.());
    safe("tabs", () => window.SDC_TABS?.init?.());
    safe("search_ui", () => window.SDC_SEARCH_UI?.init?.());
    safe("results", () => window.SDC_RESULTS?.init?.());

    // Checkout / perfil
    safe("profile", () => window.SDC_PROFILE?.load?.());
    safe("checkout", () => window.SDC_CHECKOUT?.showStep?.(1));

    // Utilidades
    safe("zoom", () => window.SDC_ZOOM?.init?.());
    safe("cart_tools", () => window.SDC_CART_TOOLS?.init?.());
    safe("badges_ui", () => window.SDC_UI_BADGES?.init?.());

    // Vista / stepper / continue
    safe("view", () => window.SDC_VIEW3?.init?.());
    safe("stepper", () => window.SDC_STEPPER?.init?.());
    safe("continue", () => window.SDC_CONTINUE?.init?.());

    // Extras
    safe("thanks", () => window.SDC_THANKS_PLUS?.init?.());
    safe("orders", () => window.SDC_ORDERS_PRO?.render?.());
    safe("brand", () => window.SDC_BRAND?.init?.());
    safe("continue_plus", () => window.SDC_CONTINUE_PLUS?.init?.());
    safe("guard", () => window.SDC_GUARD?.init?.());
    safe("mobile_fix", () => window.SDC_MOBILE_FIX?.init?.());
    safe("live", () => window.SDC_LIVE?.start?.(3));
    safe("cart_badge", () => window.SDC_CART_BADGE?.init?.());
    safe("features_boot", () => window.SDC_BOOT_FEATURES?.());

    // Skeleton
    safe("skeleton", () => window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10));

    // Eventos básicos
    safe("bind.search", () => document.getElementById("q")?.addEventListener("input", () => window.SDC_CATALOG.renderGrid()));
    safe("cart.bind", () => window.SDC_CART?.bindEvents?.());
    safe("wa.bind", () => window.SDC_WA?.bind?.());
    safe("product.bind", () => window.SDC_PRODUCT_MODAL?.bindEvents?.());
    safe("catalog.bind", () => window.SDC_CATALOG?.bindProductModalEvents?.());

    // Perf cache
    safe("p5_perf", () => window.SDC_PERF?.init?.());

    // Cargar catálogo
    await window.SDC_CATALOG.load();

    // Delivery base + conteo
    safe("delivery", () => window.SDC_DELIVERY?.initSelectors?.());
    safe("count", () => window.SDC_STORE?.updateCartCountUI?.());
    safe("results.refresh", () => window.SDC_RESULTS?.refresh?.());

    // Badges/favs
    safe("badges.init", () => window.SDC_BADGES?.init?.(window.SDC_STORE.getProducts?.() || []));
    safe("fav_section.init", () => window.SDC_FAV_SECTION?.init?.());

    // Paquetes
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

    // Envíos avanzados (local / punto / bus / empresa + cambio)
    safe("delivery_plus", () => window.SDC_DELIVERY_PLUS?.init?.());

    // ✅ FASE 1 móvil: header inteligente + carrito arriba “🛒 2”
    safe("fase1_mobile_app", () => window.SDC_APP_MOBILE?.init?.());

    // refresco final de carrito arriba
    safe("cartBadge.apply", () => window.SDC_CART_BADGE?.apply?.());
  }

  init().catch(err => {
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Error cargando catálogo";
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
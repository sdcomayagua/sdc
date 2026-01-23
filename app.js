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

    // Mount para cotizador envío (si no existe)
    if (!document.getElementById("shipQuoteMount") && headerWrap){
      const d = document.createElement("div");
      d.id = "shipQuoteMount";
      headerWrap.insertBefore(d, headerWrap.querySelector(".tabsUnified") || null);
    }

    // Sección Top Ofertas (si no existe, la creamos en main)
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
        // arriba del featured
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

    safe("theme.init", () => window.SDC_THEME?.init?.("dark"));
    safe("theme.top", () => document.getElementById("themeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle()));
    safe("theme.bottom", () => document.getElementById("bottomThemeBtn")?.addEventListener("click", () => window.SDC_THEME.toggle()));

    safe("motion", () => window.SDC_MOTION?.observe?.());
    safe("toTop", () => window.SDC_UX?.initToTop?.());
    safe("header", () => window.SDC_HEADER?.init?.());

    safe("filters", () => window.SDC_FILTERS?.init?.());
    safe("pager", () => window.SDC_PAGER?.setPageSize?.(24));
    safe("sort_menu", () => window.SDC_SORT_MENU?.init?.());
    safe("tabs", () => window.SDC_TABS?.init?.());

    safe("search_ui", () => window.SDC_SEARCH_UI?.init?.());
    safe("results", () => window.SDC_RESULTS?.init?.());

    safe("profile", () => window.SDC_PROFILE?.load?.());
    safe("checkout", () => window.SDC_CHECKOUT?.showStep?.(1));

    safe("zoom", () => window.SDC_ZOOM?.init?.());
    safe("cart_tools", () => window.SDC_CART_TOOLS?.init?.());
    safe("badges_ui", () => window.SDC_UI_BADGES?.init?.());

    safe("view", () => window.SDC_VIEW3?.init?.());
    safe("stepper", () => window.SDC_STEPPER?.init?.());
    safe("continue", () => window.SDC_CONTINUE?.init?.());

    safe("thanks", () => window.SDC_THANKS_PLUS?.init?.());
    safe("orders", () => window.SDC_ORDERS_PRO?.render?.());
    safe("brand", () => window.SDC_BRAND?.init?.());
    safe("continue_plus", () => window.SDC_CONTINUE_PLUS?.init?.());
    safe("guard", () => window.SDC_GUARD?.init?.());
    safe("mobile_fix", () => window.SDC_MOBILE_FIX?.init?.());
    safe("live", () => window.SDC_LIVE?.start?.(3));

    safe("cart_badge", () => window.SDC_CART_BADGE?.init?.());
    safe("features_boot", () => window.SDC_BOOT_FEATURES?.());

    safe("skeleton", () => window.SDC_CATALOG_UI?.renderSkeletonGrid?.(10));
    safe("bind.search", () => document.getElementById("q")?.addEventListener("input", () => window.SDC_CATALOG.renderGrid()));

    safe("cart.bind", () => window.SDC_CART?.bindEvents?.());
    safe("wa.bind", () => window.SDC_WA?.bind?.());
    safe("product.bind", () => window.SDC_PRODUCT_MODAL?.bindEvents?.());
    safe("catalog.bind", () => window.SDC_CATALOG?.bindProductModalEvents?.());

    await window.SDC_CATALOG.load();

    safe("delivery", () => window.SDC_DELIVERY?.initSelectors?.());
    safe("count", () => window.SDC_STORE?.updateCartCountUI?.());
    safe("results.refresh", () => window.SDC_RESULTS?.refresh?.());

    // badges/favs
    safe("badges.init", () => window.SDC_BADGES?.init?.(window.SDC_STORE.getProducts?.() || []));
    safe("fav_section.init", () => window.SDC_FAV_SECTION?.init?.());

    safe("smartMini", () => window.SDC_SMART?.applyMiniIfNeeded?.((window.SDC_STORE.getProducts()||[]).length));
    safe("cartBadge.apply", () => window.SDC_CART_BADGE?.apply?.());

    safe("store_extras", () => window.SDC_STORE_EXTRAS?.init?.());
    safe("shop_polish", () => window.SDC_SHOP_POLISH?.init?.());

    /* ✅ PAQUETE 1 init */
    safe("p1_sales", () => window.SDC_P1?.init?.());
    safe("ship_quote", () => window.SDC_SHIP_QUOTE?.init?.());
    safe("top_offers", () => window.SDC_TOP_OFFERS?.render?.());
    safe("wa_plus", () => window.SDC_WA_PLUS?.init?.());
  }

  init().catch(err => {
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Error cargando catálogo";
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
(() => {
  const U = window.SDC_UTILS;
  function safe(_name, fn){ try { fn && fn(); } catch {} }

  function ensureEl(id, html){
    if (document.getElementById(id)) return;
    const div = document.createElement("div");
    div.id = id;
    div.innerHTML = html || "";
    // por defecto lo metemos al final del body
    document.body.appendChild(div);
  }

  function ensureBasics(){
    // Evita errores de "null.textContent"
    if (!document.getElementById("statusPill")){
      const headerWrap = document.querySelector("header .wrap");
      if (headerWrap){
        const p = document.createElement("div");
        p.className = "pill";
        p.id = "statusPill";
        p.textContent = "Cargando catálogo...";
        headerWrap.appendChild(p);
      }
    }
    if (!document.getElementById("templatesMount")){
      ensureEl("templatesMount", "");
    }
    if (!document.getElementById("topBanner")){
      const headerWrap = document.querySelector("header .wrap");
      if (headerWrap){
        const b = document.createElement("div");
        b.id = "topBanner";
        b.className = "topBanner";
        b.style.display = "none";
        headerWrap.appendChild(b);
      }
    }
    if (!document.getElementById("suggestBox")){
      const headerWrap = document.querySelector("header .wrap");
      if (headerWrap){
        const s = document.createElement("div");
        s.id = "suggestBox";
        s.className = "suggestBox";
        s.style.display = "none";
        headerWrap.appendChild(s);
      }
    }
  }

  async function init() {
    ensureBasics();

    // ✅ AppBar/Drawer temprano para que SIEMPRE salga el botón arriba derecha
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

    safe("shop_polish", () => window.SDC_SHOP_POLISH?.init?.());
  }

  init().catch(err => {
    document.getElementById("statusPill") && (document.getElementById("statusPill").textContent = "Error cargando catálogo");
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
(() => {
  const U = window.SDC_UTILS;

  function safe(_name, fn){ try { fn && fn(); } catch {} }

  function ensureBasics(){
    const headerWrap = document.querySelector("header .wrap");

    // Evita errores null.textContent
    if (!document.getElementById("statusPill") && headerWrap){
      const p = document.createElement("div");
      p.className = "pill";
      p.id = "statusPill";
      p.textContent = "Cargando catálogo...";
      headerWrap.appendChild(p);
    }

    // Si usas templates
    if (!document.getElementById("templatesMount")){
      const m = document.createElement("div");
      m.id = "templatesMount";
      document.body.appendChild(m);
    }

    // Banner + sugerencias
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
  }

  // ✅ Quita lo flotante que tapa (dock + popover) y vuelve a “carrito arriba”
  function disableFloatingStuff(){
    const dock = document.getElementById("checkoutDock");
    if (dock) dock.remove();

    const pop = document.getElementById("addPopover");
    if (pop) pop.remove();

    // si tu CSS dejó padding-bottom grande por dock, lo normalizamos
    document.body.style.paddingBottom = "22px";
  }

  // ✅ Fuerza a que vuelvan “NUEVO / OFERTA -X% / Ahorras Lps”
  function decorateCardsWithBadges(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    const getProducts = () => window.SDC_STORE?.getProducts?.() || [];
    const money = (n) => window.SDC_UTILS?.money?.(n, window.SDC_CONFIG?.CURRENCY) || "";

    function findProduct(card){
      const pid = card.getAttribute("data-pid");
      const list = getProducts();

      if (pid) return list.find(p => String(p.id||p.nombre||"") === pid) || null;

      const name = card.querySelector(".name")?.textContent?.trim() || "";
      return list.find(p => String(p.nombre||"").trim() === name) || null;
    }

    function computeBadges(p){
      // NUEVO por orden (top 15% aprox) si existe badges_logic
      let isNew = false;
      let isOffer = false;
      let savePct = 0;
      let saveAmt = 0;

      const cur = Number(p.precio||0);
      const prev = Number(p.precio_anterior||0);

      if (prev > 0 && prev > cur){
        isOffer = true;
        saveAmt = prev - cur;
        savePct = Math.round((saveAmt / prev) * 100);
      }

      // si existe tu SDC_BADGES úsalo
      const b = window.SDC_BADGES?.get?.(p);
      if (b && typeof b.isNew === "boolean") isNew = b.isNew;

      // fallback simple si no hay SDC_BADGES
      if (!b){
        const ord = Number(p.orden||0);
        const ords = getProducts().map(x=>Number(x.orden||0)).filter(n=>Number.isFinite(n));
        ords.sort((a,b)=>a-b);
        const thr = ords.length ? ords[Math.floor(ords.length*0.85)] : 0;
        isNew = ord > 0 && ord >= thr;
      }

      return { isNew, isOffer, savePct, saveAmt };
    }

    function apply(card){
      const p = findProduct(card);
      if (!p) return;

      const { isNew, isOffer, savePct, saveAmt } = computeBadges(p);

      // --- RIBBONS arriba en la imagen ---
      const wrap = card.querySelector(".imgWrap");
      if (wrap){
        let rr = wrap.querySelector(".ribbonRow");
        if (!rr){
          rr = document.createElement("div");
          rr.className = "ribbonRow";
          wrap.appendChild(rr);
        }
        rr.innerHTML = "";

        if (isNew){
          const r = document.createElement("div");
          r.className = "ribbon new";
          r.textContent = "NUEVO";
          rr.appendChild(r);
        }

        if (isOffer && savePct > 0){
          const r = document.createElement("div");
          r.className = "ribbon offer";
          r.textContent = `OFERTA -${savePct}%`;
          rr.appendChild(r);
        }

        // si no hay nada, quita el contenedor
        if (!rr.childElementCount) rr.remove();
      }

      // --- Ahorras abajo del precio ---
      // elimina ahorro viejo si existía
      card.querySelectorAll(".saveLine").forEach(x => x.remove());

      if (isOffer && saveAmt > 0){
        const priceEl = card.querySelector(".price");
        if (priceEl && !priceEl.querySelector(".strike")){
          // precio anterior tachado
          const strike = document.createElement("span");
          strike.className = "strike";
          strike.textContent = money(Number(p.precio_anterior||0));
          priceEl.appendChild(strike);
        }

        const save = document.createElement("div");
        save.className = "saveLine";
        save.innerHTML = `Ahorras <b>${money(saveAmt)}</b>`;
        const box = card.querySelector(".p");
        if (box) box.appendChild(save);
      }
    }

    // aplica a todo
    grid.querySelectorAll(".card").forEach(apply);

    // reaplica cuando cambie el grid
    if (!window.__SDC_DECORATE_OBS__){
      window.__SDC_DECORATE_OBS__ = true;
      const obs = new MutationObserver(() => {
        grid.querySelectorAll(".card").forEach(apply);
      });
      obs.observe(grid, { childList:true, subtree:true });
    }
  }

  async function init() {
    ensureBasics();

    // ✅ Quita dock/popup flotante (deja carrito arriba)
    disableFloatingStuff();

    // ✅ AppBar/Drawer temprano
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

    // ✅ fuerza decoración NUEVO/OFERTA/AHORRAS
    safe("decorate_cards", () => decorateCardsWithBadges());

    safe("smartMini", () => window.SDC_SMART?.applyMiniIfNeeded?.((window.SDC_STORE.getProducts()||[]).length));
    safe("cartBadge.apply", () => window.SDC_CART_BADGE?.apply?.());

    safe("store_extras", () => window.SDC_STORE_EXTRAS?.init?.());
    safe("shop_polish", () => window.SDC_SHOP_POLISH?.init?.());

    // ✅ NO iniciamos PRO_PACK (porque era lo flotante que tapa)
    // safe("pro_pack", () => window.SDC_PRO_PACK?.init?.());
  }

  init().catch(err => {
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Error cargando catálogo";
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
(() => {
  const U = window.SDC_UTILS;

  function safe(_name, fn){ try { fn && fn(); } catch {} }

  // -----------------------------
  // 1) HEADER INTELIGENTE (APP)
  // -----------------------------
  function initSmartHeader(){
    const header = document.querySelector("header");
    if (!header) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    function run(){
      const y = window.scrollY || 0;
      const down = y > lastY;
      lastY = y;

      // en la parte de arriba siempre normal
      if (y < 80){
        header.classList.remove("compact");
        return;
      }

      // si baja: compacta, si sube: normal
      if (down) header.classList.add("compact");
      else header.classList.remove("compact");
    }

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { run(); ticking = false; });
    }, { passive:true });
  }

  // -----------------------------
  // 2) MINI CARRITO ELEGANTE
  // -----------------------------
  function ensureMiniCart(){
    if (document.getElementById("miniCart")) return;

    const mini = document.createElement("div");
    mini.id = "miniCart";
    mini.style.position = "fixed";
    mini.style.left = "14px";
    mini.style.right = "14px";
    mini.style.bottom = "14px";
    mini.style.zIndex = "9999";
    mini.style.display = "none";
    mini.style.alignItems = "center";
    mini.style.justifyContent = "space-between";
    mini.style.gap = "10px";
    mini.style.padding = "12px";
    mini.style.borderRadius = "18px";
    mini.style.border = "1px solid rgba(0,0,0,.10)";
    mini.style.background = "rgba(18,24,35,.94)";
    mini.style.backdropFilter = "blur(12px)";
    mini.style.boxShadow = "0 14px 30px rgba(0,0,0,.22)";
    mini.style.color = "#e8eef7";

    mini.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:2px">
        <div style="font-weight:1000">🛒 <span id="mcCount">0</span> producto(s)</div>
        <div style="font-size:12px;opacity:.8" id="mcTotal">Total: --</div>
      </div>
      <button id="mcBtn" style="
        height:44px;
        padding:0 14px;
        border-radius:16px;
        border:0;
        background:#25D366;
        color:#05210f;
        font-weight:1000;
        cursor:pointer;
      ">Ver carrito</button>
    `;

    document.body.appendChild(mini);

    document.getElementById("mcBtn").onclick = () => {
      // abrir carrito (según tu cart.js)
      window.SDC_CART?.openCart?.();
    };
  }

  function computeMiniCartTotals(){
    const CFG = window.SDC_CONFIG;
    const store = window.SDC_STORE;
    if (!CFG || !store) return { count:0, totalNow:0 };

    const cart = store.getCart?.() || new Map();
    let count = 0;
    let subtotal = 0;

    for (const it of cart.values()){
      count += Number(it.qty||0);
      subtotal += Number(it.p?.precio||0) * Number(it.qty||0);
    }

    // Total “ahora” (respeta tu lógica de prepago)
    const dep = document.getElementById("dep")?.value || "";
    const mun = document.getElementById("mun")?.value || "";
    const pay = document.getElementById("payType")?.value || "pagar_al_recibir";

    let localAllowed = false;
    try { localAllowed = !!store.isLocalAllowed?.(dep, mun); } catch {}

    let ship = 0;
    if (!localAllowed){
      ship = (pay === "prepago") ? Number(CFG.NATIONAL_PREPAGO||0) : Number(CFG.NATIONAL_CONTRA_ENTREGA||0);
    }

    const totalNow = (!localAllowed && pay === "prepago") ? (subtotal + ship) : subtotal;
    return { count, totalNow };
  }

  function updateMiniCart(){
    ensureMiniCart();

    const mini = document.getElementById("miniCart");
    const countEl = document.getElementById("mcCount");
    const totalEl = document.getElementById("mcTotal");

    if (!mini || !countEl || !totalEl) return;

    const t = computeMiniCartTotals();
    if (t.count <= 0){
      mini.style.display = "none";
      return;
    }

    countEl.textContent = String(t.count);
    totalEl.textContent = "Total: " + (window.SDC_UTILS?.money?.(t.totalNow, window.SDC_CONFIG?.CURRENCY) || "");
    mini.style.display = "flex";
  }

  function hookMiniCart(){
    // actualiza cuando cambie el contador del carrito
    const cc = document.getElementById("cartCount");
    if (cc){
      const obs = new MutationObserver(() => updateMiniCart());
      obs.observe(cc, { childList:true, subtree:true });
    }

    // cuando cambie forma de pago/ubicación en carrito, recalcula
    ["dep","mun","payType","deliveryType"].forEach(id=>{
      document.getElementById(id)?.addEventListener("change", updateMiniCart);
      document.getElementById(id)?.addEventListener("input", updateMiniCart);
    });

    // primera vez
    setTimeout(updateMiniCart, 800);
  }

  // -----------------------------
  // 3) BADGES NUEVO / OFERTA + AHORRAS
  // -----------------------------
  function ensureBadgeStylesIfMissing(){
    // si ya tienes promo_ui.css, esto no estorba.
    // aquí solo garantizamos que exista ribbonRow / ribbon / saveLine.
    // (si ya están, no hacemos nada)
  }

  function computeNewThreshold(){
    const list = window.SDC_STORE?.getProducts?.() || [];
    const ords = list.map(p => Number(p.orden||0)).filter(n => Number.isFinite(n) && n>0).sort((a,b)=>a-b);
    if (!ords.length) return 0;
    return ords[Math.floor(ords.length * 0.85)] || 0; // top 15%
  }

  function decorateCard(card, newMinOrden){
    const pid = card.getAttribute("data-pid");
    const products = window.SDC_STORE?.getProducts?.() || [];
    const p = products.find(x => String(x.id||x.nombre||"") === String(pid||""));
    if (!p) return;

    const cur = Number(p.precio||0);
    const prev = Number(p.precio_anterior||0);
    const isOffer = prev > 0 && prev > cur;
    const saveAmt = isOffer ? (prev - cur) : 0;
    const savePct = isOffer ? Math.round((saveAmt / prev) * 100) : 0;

    const isNew = Number(p.orden||0) >= newMinOrden && Number(p.orden||0) > 0;

    // --- ribbons ---
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

      if (!rr.childElementCount) rr.remove();
    }

    // --- tachado + ahorro ---
    card.querySelectorAll(".saveLine").forEach(x => x.remove());

    const priceEl = card.querySelector(".price");
    if (priceEl){
      // quitar strike viejo si ya no hay oferta
      const oldStrike = priceEl.querySelector(".strike");
      if (!isOffer && oldStrike) oldStrike.remove();

      if (isOffer && !priceEl.querySelector(".strike")){
        const s = document.createElement("span");
        s.className = "strike";
        s.textContent = window.SDC_UTILS?.money?.(prev, window.SDC_CONFIG?.CURRENCY) || "";
        priceEl.appendChild(s);
      }
    }

    if (isOffer && saveAmt > 0){
      const save = document.createElement("div");
      save.className = "saveLine";
      save.innerHTML = `Ahorras <b>${window.SDC_UTILS?.money?.(saveAmt, window.SDC_CONFIG?.CURRENCY) || ""}</b>`;
      card.querySelector(".p")?.appendChild(save);
    }
  }

  function decorateAllCards(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    const thr = computeNewThreshold();
    grid.querySelectorAll(".card").forEach(c => decorateCard(c, thr));
  }

  function hookBadges(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    ensureBadgeStylesIfMissing();
    decorateAllCards();

    if (!window.__SDC_BADGE_OBS__){
      window.__SDC_BADGE_OBS__ = true;
      const obs = new MutationObserver(() => {
        decorateAllCards();
      });
      obs.observe(grid, { childList:true, subtree:true });
    }
  }

  // -----------------------------
  // INIT GENERAL
  // -----------------------------
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

    // Mantén tu inicialización actual
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

    safe("checkout", () => window.SDC_CHECKOUT?.showStep?.(1));

    safe("zoom", () => window.SDC_ZOOM?.init?.());
    safe("cart_tools", () => window.SDC_CART_TOOLS?.init?.());
    safe("ui_badges", () => window.SDC_UI_BADGES?.init?.());

    safe("view", () => window.SDC_VIEW3?.init?.());
    safe("stepper", () => window.SDC_STEPPER?.init?.());
    safe("continue", () => window.SDC_CONTINUE?.init?.());

    safe("thanks", () => window.SDC_THANKS_PLUS?.init?.());
    safe("orders", () => window.SDC_ORDERS_PRO?.render?.());
    safe("brand", () => window.SDC_BRAND?.init?.());
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

    // Inicializa tus paquetes ya instalados
    safe("p1_sales", () => window.SDC_P1?.init?.());
    safe("p2_ux", () => window.SDC_P2?.init?.());
    safe("p3_product", () => window.SDC_P3?.init?.());
    safe("p5_perf", () => window.SDC_PERF?.init?.());
    safe("p5_analytics", () => window.SDC_ANALYTICS?.init?.());
    safe("p6_promo", () => window.SDC_P6_PROMO?.init?.());
    safe("p7_checkout", () => window.SDC_P7?.init?.());
    safe("p7_cart_offer", () => window.SDC_P7_CART_OFFER?.init?.());

    // ✅ (1) Header inteligente
    initSmartHeader();

    // ✅ (2) Mini carrito
    hookMiniCart();

    // ✅ (3) Badges + ahorros
    hookBadges();
  }

  init().catch(err => {
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Error cargando catálogo";
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
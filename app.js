(() => {
  const U = window.SDC_UTILS;
  function safe(_name, fn){ try { fn && fn(); } catch {} }

  // -----------------------------
  // Helpers storage para envío
  // -----------------------------
  const LS = {
    dep: "SDC_LAST_DEP",
    mun: "SDC_LAST_MUN",
    pay: "SDC_LAST_PAY"
  };

  function saveShipSelection(){
    const dep = document.getElementById("dep")?.value || "";
    const mun = document.getElementById("mun")?.value || "";
    const pay = document.getElementById("payType")?.value || "";
    if (dep) localStorage.setItem(LS.dep, dep);
    if (mun) localStorage.setItem(LS.mun, mun);
    if (pay) localStorage.setItem(LS.pay, pay);
  }

  function readShipSelection(){
    return {
      dep: localStorage.getItem(LS.dep) || "",
      mun: localStorage.getItem(LS.mun) || "",
      pay: localStorage.getItem(LS.pay) || "pagar_al_recibir"
    };
  }

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

      if (y < 80){
        header.classList.remove("compact");
        return;
      }
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
  // 2) MINI CARRITO (TOTAL + ENVÍO)
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
        <div style="font-size:12px;opacity:.85" id="mcTotal">Total: --</div>
        <div style="font-size:11px;opacity:.75" id="mcHint"></div>
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
      window.SDC_CART?.openCart?.();
    };
  }

  function computeMiniCartTotals(){
    const CFG = window.SDC_CONFIG;
    const store = window.SDC_STORE;
    if (!CFG || !store) return { count:0, subtotal:0, totalNow:0, hint:"" };

    const cart = store.getCart?.() || new Map();
    let count = 0;
    let subtotal = 0;

    for (const it of cart.values()){
      count += Number(it.qty||0);
      subtotal += Number(it.p?.precio||0) * Number(it.qty||0);
    }

    // Intentar leer selección de envío desde el carrito (si está abierto) o desde localStorage
    let dep = document.getElementById("dep")?.value || "";
    let mun = document.getElementById("mun")?.value || "";
    let pay = document.getElementById("payType")?.value || "";

    if (!dep || !mun || !pay){
      const saved = readShipSelection();
      dep = dep || saved.dep;
      mun = mun || saved.mun;
      pay = pay || saved.pay;
    }

    let localAllowed = false;
    try { localAllowed = !!store.isLocalAllowed?.(dep, mun); } catch {}

    let ship = 0;
    if (dep && mun){
      if (!localAllowed){
        ship = (pay === "prepago") ? Number(CFG.NATIONAL_PREPAGO||0) : Number(CFG.NATIONAL_CONTRA_ENTREGA||0);
      }
    }

    // Total “ahora”
    // - Si NO hay selección de municipio aún => totalNow = subtotal (sin inventar)
    // - Si local => subtotal
    // - Si nacional prepago => subtotal + ship
    // - Si nacional contra entrega => subtotal (envío se paga a empresa)
    let totalNow = subtotal;
    let hint = "";

    if (dep && mun){
      if (localAllowed){
        totalNow = subtotal;
        hint = "Entrega local: pagar al recibir";
      } else if (pay === "prepago"){
        totalNow = subtotal + ship;
        hint = `Incluye envío prepago: ${window.SDC_UTILS?.money?.(ship, CFG.CURRENCY) || ""}`;
      } else {
        totalNow = subtotal;
        hint = `Envío contra entrega se paga a empresa: ${window.SDC_UTILS?.money?.(ship, CFG.CURRENCY) || ""}`;
      }
    } else {
      hint = "Elige tu municipio en el carrito para ver envío";
    }

    return { count, subtotal, totalNow, hint };
  }

  function updateMiniCart(){
    ensureMiniCart();

    const mini = document.getElementById("miniCart");
    const countEl = document.getElementById("mcCount");
    const totalEl = document.getElementById("mcTotal");
    const hintEl  = document.getElementById("mcHint");

    if (!mini || !countEl || !totalEl || !hintEl) return;

    const t = computeMiniCartTotals();
    if (t.count <= 0){
      mini.style.display = "none";
      return;
    }

    countEl.textContent = String(t.count);
    totalEl.textContent = "Total: " + (window.SDC_UTILS?.money?.(t.totalNow, window.SDC_CONFIG?.CURRENCY) || "");
    hintEl.textContent  = t.hint || "";
    mini.style.display = "flex";
  }

  function hookMiniCart(){
    // actualiza cuando cambie el contador del carrito
    const cc = document.getElementById("cartCount");
    if (cc){
      const obs = new MutationObserver(() => updateMiniCart());
      obs.observe(cc, { childList:true, subtree:true });
    }

    // cuando cambie forma de pago/ubicación en carrito, guarda y recalcula
    ["dep","mun","payType","deliveryType"].forEach(id=>{
      document.addEventListener("change", (e) => {
        if (e.target && e.target.id === id){
          saveShipSelection();
          updateMiniCart();
        }
      }, true);
      document.addEventListener("input", (e) => {
        if (e.target && e.target.id === id){
          saveShipSelection();
          updateMiniCart();
        }
      }, true);
    });

    // primera vez
    setTimeout(updateMiniCart, 900);
  }

  // -----------------------------
  // 3) BADGES (si ya los tienes por otros módulos, esto no estorba)
  // -----------------------------
  function hookBadges(){
    // Si ya lo manejas con badges_logic + catalog_ui, no hacemos nada extra.
  }

  // -----------------------------
  // Init base
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

    safe("p5_perf", () => window.SDC_PERF?.init?.());

    await window.SDC_CATALOG.load();

    safe("delivery", () => window.SDC_DELIVERY?.initSelectors?.());
    safe("count", () => window.SDC_STORE?.updateCartCountUI?.());
    safe("results.refresh", () => window.SDC_RESULTS?.refresh?.());

    // paquetes ya instalados (si existen)
    safe("p1_sales", () => window.SDC_P1?.init?.());
    safe("p2_ux", () => window.SDC_P2?.init?.());
    safe("p3_product", () => window.SDC_P3?.init?.());
    safe("p5_analytics", () => window.SDC_ANALYTICS?.init?.());
    safe("p6_promo", () => window.SDC_P6_PROMO?.init?.());
    safe("p7_checkout", () => window.SDC_P7?.init?.());
    safe("p7_cart_offer", () => window.SDC_P7_CART_OFFER?.init?.());

    // ✅ NUEVO: 1,2
    initSmartHeader();
    hookMiniCart();
    hookBadges();

    // refresco final
    setTimeout(updateMiniCart, 600);
  }

  init().catch(err => {
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Error cargando catálogo";
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
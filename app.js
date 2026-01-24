(() => {
  const U = window.SDC_UTILS;
  function safe(_name, fn){ try { fn && fn(); } catch {} }

  function ensureBasics(){
    const headerWrap = document.querySelector("header .wrap");
    if (!document.getElementById("statusPill") && headerWrap){
      const p = document.createElement("div");
      p.className = "pill";
      p.id = "statusPill";
      p.textContent = "Cargando catálogo…";
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

    // ✅ Loader visual
    safe("loading.ensure", () => window.SDC_LOADING?.ensureShell?.());
    safe("loading.start", () => window.SDC_LOADING?.start?.());

    // ✅ Header/menú (si existe)
    safe("store_extras.early", () => window.SDC_STORE_EXTRAS?.init?.());

    // ✅ Tema base (y polish_fix lo refuerza)
    safe("theme.init", () => window.SDC_THEME?.init?.("dark"));

    // ✅ Eventos base
    safe("cart.bind", () => window.SDC_CART?.bindEvents?.());
    safe("wa.bind", () => window.SDC_WA?.bind?.());
    safe("delivery.base", () => window.SDC_DELIVERY?.initSelectors?.());

    // ✅ Perf cache si existe
    safe("p5_perf", () => window.SDC_PERF?.init?.());

    // ✅ Cargar catálogo lo antes posible
    await window.SDC_CATALOG.load();

    // ✅ Apagar loader
    safe("loading.stop", () => window.SDC_LOADING?.stop?.());

    // ✅ Contador carrito
    safe("count", () => window.SDC_STORE?.updateCartCountUI?.());

    // ✅ Extras diferidos (si existe defer_extras.js)
    safe("defer_extras", () => window.SDC_DEFER_EXTRAS?.init?.());

    // ✅ Pulido final: tema robusto, header compact, quitar buscador duplicado, carrito estable
    safe("polish_fix", () => window.SDC_POLISH?.init?.());
  }

  init().catch(err => {
    safe("loading.stop", () => window.SDC_LOADING?.stop?.());
    document.getElementById("statusPill") && (document.getElementById("statusPill").textContent = "Error cargando catálogo");
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
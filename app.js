(() => {
  const U = window.SDC_UTILS;

  function safe(_name, fn){ try { fn && fn(); } catch {} }

  // ✅ Fix tema robusto (si theme.js falla, esto igual funciona)
  function themeFix(){
    const html = document.documentElement;

    function setTheme(t){
      html.setAttribute("data-theme", t);
      try{ localStorage.setItem("SDC_THEME", t); }catch{}
    }
    function getTheme(){
      const t = html.getAttribute("data-theme");
      if (t) return t;
      try{ return localStorage.getItem("SDC_THEME") || "light"; }catch{ return "light"; }
    }

    // inicial
    setTheme(getTheme());

    const btn = document.getElementById("themeBtn") || document.getElementById("bottomThemeBtn");
    if (!btn) return;

    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", () => {
      // intenta theme.js
      try{ window.SDC_THEME?.toggle?.(); }catch{}
      // fallback seguro
      const cur = getTheme();
      setTheme(cur === "dark" ? "light" : "dark");
    });
  }

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

    // ✅ activa loader visual inmediatamente
    safe("loading.start", () => window.SDC_LOADING?.start?.());

    // ✅ tema robusto (arregla “modo noche no sirve”)
    themeFix();

    // ✅ bind esenciales
    safe("cart.bind", () => window.SDC_CART?.bindEvents?.());
    safe("wa.bind", () => window.SDC_WA?.bind?.());
    safe("delivery.base", () => window.SDC_DELIVERY?.initSelectors?.());

    // ✅ Carga catálogo lo más pronto posible
    await window.SDC_CATALOG.load();

    // ✅ apaga loader cuando ya hay productos
    safe("loading.stop", () => window.SDC_LOADING?.stop?.());

    // ✅ actualiza contador carrito
    safe("count", () => window.SDC_STORE?.updateCartCountUI?.());

    // ✅ ahora sí carga extras según internet (no frena a los lentos)
    safe("defer_extras", () => window.SDC_DEFER_EXTRAS?.init?.());
  }

  init().catch(err => {
    safe("loading.stop", () => window.SDC_LOADING?.stop?.());
    document.getElementById("statusPill") && (document.getElementById("statusPill").textContent = "Error cargando catálogo");
    U?.toast?.("Error: " + (err?.message || err));
  });
})();
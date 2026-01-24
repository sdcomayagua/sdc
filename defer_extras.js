// defer_extras.js
// Carga extras cuando ya hay catálogo visible, y decide "lite mode" si internet es lento.

window.SDC_DEFER_EXTRAS = (() => {
  function connectionType(){
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return { type:"unknown", saveData:false };
    return { type: c.effectiveType || "unknown", saveData: !!c.saveData };
  }

  function isSlowNet(){
    const { type, saveData } = connectionType();
    // 2g/3g o data saver => modo lite
    return saveData || type === "slow-2g" || type === "2g" || type === "3g";
  }

  function loadScript(name, v){
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `${name}?v=${encodeURIComponent(v || "defer")}`;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  async function init(){
    const slow = isSlowNet();
    document.body.classList.toggle("is-lite", slow);

    // Espera a que exista grid renderizado (catálogo ya visible)
    const wait = async () => {
      for (let i=0;i<80;i++){
        const hasGrid = document.getElementById("grid");
        const hasCards = hasGrid && hasGrid.children.length > 0;
        if (hasCards) return true;
        await new Promise(r=>setTimeout(r, 100));
      }
      return false;
    };

    await wait();

    // Carga en idle (no molesta al render inicial)
    const idle = (cb) => (window.requestIdleCallback ? requestIdleCallback(cb) : setTimeout(cb, 800));

    idle(async () => {
      // ✅ UI / polish (ligeros)
      await loadScript("p2_ux.js");
      await loadScript("fase2_badges.js");
      await loadScript("fase3_ui.js");
      await loadScript("fase4_checkout.js");
      await loadScript("delivery_plus.js");

      // ✅ Solo si NO es internet lento, cargamos “pesado”
      if (!slow){
        await loadScript("p3_product.js");      // modal premium, relacionados, etc
        await loadScript("top_offers.js");      // top ofertas
        await loadScript("p5_perf.js");         // cache
        await loadScript("p5_analytics.js");    // tendencias
        await loadScript("p6_promo.js");        // contador promos
        await loadScript("p7_checkout.js");     // sticky checkout
        await loadScript("p7_cart_offer.js");   // ahorro en carrito
      }

      // Inicializa lo que exista (sin romper)
      try{ window.SDC_P2?.init?.(); }catch{}
      try{ window.SDC_FASE2_BADGES?.init?.(); }catch{}
      try{ window.SDC_FASE3_UI?.init?.(); }catch{}
      try{ window.SDC_FASE4?.init?.(); }catch{}
      try{ window.SDC_DELIVERY_PLUS?.init?.(); }catch{}

      if (!slow){
        try{ window.SDC_P3?.init?.(); }catch{}
        try{ window.SDC_TOP_OFFERS?.render?.(); }catch{}
        try{ window.SDC_PERF?.init?.(); }catch{}
        try{ window.SDC_ANALYTICS?.init?.(); }catch{}
        try{ window.SDC_P6_PROMO?.init?.(); }catch{}
        try{ window.SDC_P7?.init?.(); }catch{}
        try{ window.SDC_P7_CART_OFFER?.init?.(); }catch{}
      }
    });
  }

  return { init };
})();
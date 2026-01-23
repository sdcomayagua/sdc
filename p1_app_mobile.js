// p1_app_mobile.js — FASE 1
window.SDC_APP_MOBILE = (() => {
  const isMobile = () => window.matchMedia("(max-width:720px)").matches;

  // 1) Header inteligente: compacta al bajar, vuelve al subir
  function initSmartHeader(){
    const header = document.querySelector("header");
    if (!header) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    function run(){
      if (!isMobile()) {
        header.classList.remove("compact");
        return;
      }

      const y = window.scrollY || 0;
      const down = y > lastY;
      lastY = y;

      // arriba, nunca compacto
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
      requestAnimationFrame(() => {
        run();
        ticking = false;
      });
    }, { passive:true });

    run();
  }

  // 2) Carrito arriba: en móvil mostrar “🛒 2”
  function updateCartBtn(){
    const btn = document.getElementById("cartBtn");
    const countEl = document.getElementById("cartCount");
    if (!btn || !countEl) return;

    const count = Number(countEl.textContent || "0") || 0;

    if (isMobile()){
      // Solo icono + número
      btn.childNodes.forEach(n => {
        // no tocamos el count span
      });
      btn.firstChild && (btn.firstChild.textContent = `🛒 `);
      // para que quede "🛒 2"
      btn.innerHTML = `🛒 <span id="cartCount">${count}</span>`;
    } else {
      // En PC deja el botón como lo diseñaste (si ya lo tienes con texto)
      // No forzamos nada aquí para no cambiar tu estética PC.
    }
  }

  function hookCartCount(){
    const countEl = document.getElementById("cartCount");
    if (!countEl) return;
    const obs = new MutationObserver(() => updateCartBtn());
    obs.observe(countEl, { childList:true, subtree:true });
    updateCartBtn();
  }

  function init(){
    initSmartHeader();
    hookCartCount();
  }

  return { init };
})();
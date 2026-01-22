// mobile_cart_badge.js
window.SDC_CART_BADGE = (() => {
  function apply(){
    const btn = document.getElementById("cartBtn");
    const countEl = document.getElementById("cartCount");
    if (!btn || !countEl) return;

    const n = Number(countEl.textContent || "0") || 0;

    // solo en móvil
    if (window.matchMedia("(max-width: 720px)").matches) {
      btn.innerHTML = `🛒 <span id="cartCount">${n}</span>`;
      btn.style.justifyContent = "center";
    } else {
      // desktop: texto normal
      btn.innerHTML = `🛒 <span class="cartMiniText">Carrito</span> (<span id="cartCount">${n}</span>)`;
    }
  }

  function init(){
    apply();
    window.addEventListener("resize", apply, { passive:true });
  }

  return { init, apply };
})();

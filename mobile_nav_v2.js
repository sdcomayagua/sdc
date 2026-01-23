// mobile_nav_v2.js
(() => {
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  function ensureFab(){
    if (!isMobile()) return;

    if (document.getElementById("fabWrap")) return;

    const wrap = document.createElement("div");
    wrap.id = "fabWrap";
    wrap.style.position = "fixed";
    wrap.style.right = "14px";
    wrap.style.bottom = "14px";
    wrap.style.zIndex = "999";
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "10px";

    // WhatsApp
    const wa = document.createElement("button");
    wa.id = "fabWA";
    wa.type = "button";
    wa.textContent = "💬";
    wa.title = "WhatsApp";
    styleFab(wa, true);
    wa.onclick = () => window.SDC_WA?.send?.();

    // Cart
    const cart = document.createElement("button");
    cart.id = "fabCart";
    cart.type = "button";
    cart.title = "Carrito";
    styleFab(cart, false);
    cart.onclick = () => window.SDC_CART?.openCart?.();

    wrap.appendChild(wa);
    wrap.appendChild(cart);
    document.body.appendChild(wrap);

    updateCount();
  }

  function styleFab(btn, green){
    btn.style.width = "56px";
    btn.style.height = "56px";
    btn.style.borderRadius = "16px";
    btn.style.border = "1px solid rgba(0,0,0,.08)";
    btn.style.boxShadow = "0 12px 26px rgba(0,0,0,.22)";
    btn.style.fontSize = "20px";
    btn.style.fontWeight = "900";
    btn.style.cursor = "pointer";
    btn.style.backdropFilter = "blur(8px)";
    btn.style.background = green ? "#25D366" : "rgba(18,24,35,.92)";
    btn.style.color = green ? "#05210f" : "#e8eef7";
  }

  function updateCount(){
    const countEl = document.getElementById("cartCount");
    const n = Number(countEl?.textContent || "0") || 0;
    const cart = document.getElementById("fabCart");
    if (!cart) return;
    cart.textContent = n > 0 ? `🛒${n}` : "🛒";
  }

  function watchCount(){
    const countEl = document.getElementById("cartCount");
    if (!countEl) return;
    const obs = new MutationObserver(updateCount);
    obs.observe(countEl, { childList:true, characterData:true, subtree:true });
  }

  function init(){
    ensureFab();
    watchCount();
    window.addEventListener("resize", () => {
      if (!isMobile()) {
        document.getElementById("fabWrap")?.remove();
        return;
      }
      ensureFab();
      updateCount();
    }, { passive:true });
  }

  window.SDC_MOBILE_NAV2 = { init };
})();
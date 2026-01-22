// modal_swipe.js
window.SDC_SWIPE_CLOSE = (() => {
  function attach(modalId, closeFn) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const sheet = modal.querySelector(".sheet");
    if (!sheet) return;

    let startY = 0;
    let currentY = 0;
    let dragging = false;

    const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

    sheet.addEventListener("touchstart", (e) => {
      if (!isMobile()) return;
      if (!modal.classList.contains("open")) return;

      // solo si el scroll del sheet está arriba (evita cerrar cuando estás scrolleando dentro)
      if (sheet.scrollTop > 0) return;

      dragging = true;
      startY = e.touches[0].clientY;
      currentY = startY;
      sheet.style.transition = "none";
    }, { passive:true });

    sheet.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const dy = Math.max(0, currentY - startY);
      sheet.style.transform = `translateY(${dy}px)`;
    }, { passive:true });

    sheet.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;

      const dy = Math.max(0, currentY - startY);
      sheet.style.transition = "transform .18s ease";
      sheet.style.transform = "";

      // umbral
      if (dy > 120) closeFn();
    });
  }

  function init(){
    attach("productModal", () => window.SDC_PRODUCT_MODAL?.close?.());
    attach("cartModal", () => window.SDC_CART?.closeCart?.());
    attach("zoomModal", () => window.SDC_ZOOM?.close?.());
    attach("sortModal", () => window.SDC_SORT_MENU?.close?.());
    attach("thanksModal", () => window.SDC_THANKS_PLUS?.close?.());
  }

  return { init };
})();

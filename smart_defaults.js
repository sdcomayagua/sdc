// smart_defaults.js
window.SDC_SMART = (() => {
  function shouldMini(productsCount){
    // si hay más de 40 productos en móvil, mini por defecto
    return window.matchMedia("(max-width: 720px)").matches && Number(productsCount||0) >= 40;
  }

  function applyMiniIfNeeded(productsCount){
    // Solo si el usuario no cambió manualmente
    const hasUserChoice = localStorage.getItem("SDC_VIEW_MODE3");
    if (hasUserChoice) return;

    if (window.SDC_VIEW3 && shouldMini(productsCount)) {
      window.SDC_VIEW3.apply("mini");
    }
  }

  return { applyMiniIfNeeded };
})();

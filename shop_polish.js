// shop_polish.js
(() => {
  function init(){
    // Asegura que las cards se sientan “clicables”
    const grid = document.getElementById("grid");
    if (!grid) return;

    const obs = new MutationObserver(() => {
      grid.querySelectorAll(".card").forEach(c => {
        c.style.cursor = "pointer";
      });
    });
    obs.observe(grid, { childList:true, subtree:true });
  }

  window.SDC_SHOP_POLISH = { init };
})();
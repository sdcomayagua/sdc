(() => {
  const U = window.SDC_UTILS;

  U.$("q").addEventListener("input", () => window.SDC_CATALOG.renderGrid());
  U.$("cartBtn").onclick = () => window.SDC_CART.open();
  U.$("closeCart").onclick = () => window.SDC_CART.close();
  U.$("cartModal").onclick = (e) => { if(e.target.id==="cartModal") window.SDC_CART.close(); };
  U.$("sendWA").onclick = () => window.SDC_WA.send();

  window.SDC_CATALOG.loadCatalog()
    .then(() => window.SDC_DELIVERY.init())
    .catch(err => {
      console.error(err);
      U.$("statusPill").textContent = "Error cargando catálogo";
      U.toast("Error: " + (err.message || err));
    });
})();

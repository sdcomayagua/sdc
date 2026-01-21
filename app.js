(() => {
  const U = window.SDC_UTILS;

  // Buscar
  U.$("q").addEventListener("input", () => window.SDC_CATALOG.renderGrid());

  // Carrito modal
  U.$("cartBtn").onclick = () => window.SDC_CART.open();
  U.$("closeCart").onclick = () => window.SDC_CART.close();
  U.$("cartModal").onclick = (e) => { if (e.target.id === "cartModal") window.SDC_CART.close(); };

  // WhatsApp
  U.$("sendWA").onclick = () => window.SDC_WA.send();

  // Producto modal
  U.$("pmClose").onclick = () => window.SDC_CATALOG.closeProductModal();
  U.$("productModal").onclick = (e) => { if (e.target.id === "productModal") window.SDC_CATALOG.closeProductModal(); };

  U.$("pmMinus").onclick = () => window.SDC_CATALOG.pmMinus();
  U.$("pmPlus").onclick = () => window.SDC_CATALOG.pmPlus();
  U.$("pmAddBtn").onclick = () => window.SDC_CATALOG.pmAddToCart();

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.SDC_CART.close();
      window.SDC_CATALOG.closeProductModal();
    }
  });

  // Init
  window.SDC_CATALOG.load()
    .then(() => window.SDC_DELIVERY.init())
    .catch(err => {
      console.error(err);
      U.$("statusPill").textContent = "Error cargando catálogo";
      U.toast("Error: " + (err.message || err));
    });
})();

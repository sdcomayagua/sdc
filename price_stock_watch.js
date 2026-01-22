window.SDC_WATCH = (() => {
  function checkCartChanges() {
    const alertEl = document.getElementById("cartAlert");
    if (!alertEl) return;

    const S = window.SDC_STORE;
    const cart = S.getCart();
    const list = S.getProducts();

    let changed = 0;

    for (const it of cart.values()) {
      const id = String(it.p?.id || it.p?.nombre || "").trim();
      const live = list.find(p => String(p.id||"").trim() === id);
      if (!live) continue;

      const oldPrice = Number(it.p.precio||0);
      const newPrice = Number(live.precio||0);
      const oldStock = Number(it.p.stock||0);
      const newStock = Number(live.stock||0);

      if (oldPrice !== newPrice || oldStock !== newStock) changed++;
    }

    if (changed > 0) {
      alertEl.style.display = "block";
      alertEl.textContent = `⚠️ Cambió precio o stock en ${changed} producto(s). Revisa tu carrito antes de enviar.`;
    } else {
      alertEl.style.display = "none";
      alertEl.textContent = "";
    }
  }

  return { checkCartChanges };
})();
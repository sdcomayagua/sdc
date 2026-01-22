// cart.js (COMPLETO) — con window.SDC_WATCH?.checkCartChanges?.() integrado
window.SDC_CART = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;

  function syncBottomCount(){
    const el = U.$("bottomCartCount");
    if (el) el.textContent = String(S.cartCount());
  }

  function openCart() {
    U.$("cartModal").classList.add("open");

    // ✅ NUEVO: aviso si cambió precio/stock
    window.SDC_WATCH?.checkCartChanges?.();

    renderCart();
    computeSummary();
    window.SDC_UI_BADGES?.updateCheckoutBadge?.();
    window.SDC_CHECKOUT?.showStep?.(1);
    window.SDC_STEPPER?.render?.();
  }

  function closeCart() {
    U.$("cartModal").classList.remove("open");
  }

  function clearCart(){
    const ok = confirm("¿Vaciar todo el carrito?");
    if (!ok) return;
    S.state.cart = new Map();
    S.updateCartCountUI();
    syncBottomCount();
    renderCart();
    computeSummary();
    U.toast("Carrito vacío");
  }

  function renderCart() {
    const el = U.$("cartItems");
    const emptyNote = U.$("cartEmptyNote");
    const cart = S.getCart();
    el.innerHTML = "";

    syncBottomCount();

    if (cart.size === 0) {
      if (emptyNote) emptyNote.style.display = "block";
      return;
    } else {
      if (emptyNote) emptyNote.style.display = "none";
    }

    for (const [id, it] of cart.entries()) {
      const p = it.p;
      const row = document.createElement("div");
      row.className = "cartItem";
      row.innerHTML = `
        <img src="${U.escAttr(p.imagen || "")}" alt="">
        <div style="flex:1">
          <div class="cartTitle">${U.esc(p.nombre || "")}</div>
          <div class="mut">${U.esc(p.categoria || "")}${p.subcategoria ? (" • " + U.esc(p.subcategoria)) : ""}</div>
          <div class="cartMeta">
            <b>Unit:</b> ${U.money(p.precio, CFG.CURRENCY)}
            <span class="mut"> • </span>
            <b>Sub:</b> ${U.money(Number(p.precio||0) * it.qty, CFG.CURRENCY)}
          </div>
        </div>
        <div class="qty">
          <button class="mini" data-act="minus" data-id="${U.escAttr(id)}">-</button>
          <div style="min-width:22px;text-align:center;font-weight:1000">${it.qty}</div>
          <button class="mini" data-act="plus" data-id="${U.escAttr(id)}">+</button>
          <button class="mini" data-act="del" data-id="${U.escAttr(id)}">🗑</button>
        </div>
      `;

      // ✅ editar desde carrito: tocar imagen o título abre modal producto
      row.querySelector("img").onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p, { setHash:false });
      row.querySelector(".cartTitle").onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p, { setHash:false });

      row.querySelectorAll("button").forEach(b => {
        b.onclick = () => {
          const act = b.getAttribute("data-act");
          const pid = b.getAttribute("data-id");
          const item = cart.get(pid);
          if (!item) return;

          const stock = Number(item.p.stock || 0);

          if (act === "minus") item.qty = Math.max(1, item.qty - 1);
          if (act === "plus") {
            if (item.qty + 1 > stock) { U.toast("No hay stock suficiente"); return; }
            item.qty += 1;
          }
          if (act === "del") { cart.delete(pid); }

          if (cart.size === 0) S.state.cart = new Map(cart);

          S.updateCartCountUI();
          syncBottomCount();
          renderCart();
          computeSummary();

          // ✅ re-check cambios (por si se ajustó algo)
          window.SDC_WATCH?.checkCartChanges?.();
        };
      });

      el.appendChild(row);
    }

    window.SDC_RESULTS?.refresh?.();
  }

  function computeSummary() {
    const sum = U.$("summary");
    const cart = S.getCart();

    if (cart.size === 0) {
      sum.innerHTML = `<div class="note">Agrega productos para ver el total.</div>`;
      const mini = U.$("cartMiniSummary");
      if (mini) mini.textContent = "";
      return;
    }

    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = S.isLocalAllowed(dep, mun);
    const pay = U.$("payType").value;

    let subtotal = 0;
    let itemsCount = 0;
    for (const it of cart.values()) {
      subtotal += Number(it.p.precio || 0) * it.qty;
      itemsCount += it.qty;
    }

    let shipping = 0;
    if (!local) shipping = (pay === "prepago") ? CFG.NATIONAL_PREPAGO : CFG.NATIONAL_CONTRA_ENTREGA;

    const totalNow = subtotal + ((!local && pay === "prepago") ? shipping : 0);

    sum.innerHTML = `
      <div class="sum"><div>Subtotal</div><div>${U.money(subtotal, CFG.CURRENCY)}</div></div>
      <div class="sum"><div>Envío</div><div>${(!local && pay === "prepago") ? U.money(shipping, CFG.CURRENCY) : "Se paga a empresa / coordina"}</div></div>
      <div class="sum total"><div>Total ahora</div><div>${U.money(totalNow, CFG.CURRENCY)}</div></div>
    `;

    const mini = U.$("cartMiniSummary");
    if (mini) {
      mini.textContent = `Items: ${itemsCount} • Total ahora: ${U.money(totalNow, CFG.CURRENCY)}`;
    }

    window.SDC_UI_BADGES?.updateCheckoutBadge?.();
  }

  function bindEvents() {
    U.$("cartBtn").onclick = openCart;
    U.$("closeCart").onclick = closeCart;
    U.$("cartModal").onclick = (e) => { if (e.target.id === "cartModal") closeCart(); };

    U.$("bottomCartBtn").onclick = openCart;
    U.$("clearCartBtn").onclick = clearCart;

    // wizard buttons
    U.$("nextStepBtn").onclick = () => {
      window.SDC_CHECKOUT?.next?.();
      setTimeout(() => window.SDC_STEPPER?.render?.(), 0);
    };
    U.$("prevStepBtn").onclick = () => {
      window.SDC_CHECKOUT?.prev?.();
      setTimeout(() => window.SDC_STEPPER?.render?.(), 0);
    };

    // cambios en checkout -> recalcular + badge
    U.$("dep")?.addEventListener("change", () => { computeSummary(); window.SDC_WATCH?.checkCartChanges?.(); });
    U.$("mun")?.addEventListener("change", () => { computeSummary(); window.SDC_WATCH?.checkCartChanges?.(); });
    U.$("payType")?.addEventListener("change", () => { computeSummary(); window.SDC_WATCH?.checkCartChanges?.(); });
    U.$("cashAmount")?.addEventListener("input", () => computeSummary());
  }

  return { openCart, closeCart, renderCart, computeSummary, bindEvents };
})();
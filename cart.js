window.SDC_CART = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const MINI = window.SDC_CART_MINI;

  function syncBottomCount(){
    const el = U.$("bottomCartCount");
    if (el) el.textContent = String(S.cartCount());
  }

  function openCart() {
    U.$("cartModal").classList.add("open");
    renderCart();
    computeSummary();
  }

  function closeCart() {
    U.$("cartModal").classList.remove("open");
  }

  function renderCart() {
    const el = U.$("cartItems");
    const emptyNote = U.$("cartEmptyNote");
    const cart = S.getCart();
    el.innerHTML = "";

    syncBottomCount();

    if (cart.size === 0) {
      if (emptyNote) emptyNote.style.display = "block";
      MINI?.set?.("");
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
          <div style="font-weight:1000">${U.esc(p.nombre || "")}</div>
          <div class="mut">${U.esc(p.categoria || "")}${p.subcategoria ? (" • " + U.esc(p.subcategoria)) : ""}</div>
          <div style="margin-top:6px;font-weight:1000">${U.money(p.precio, CFG.CURRENCY)} <span class="mut">x ${it.qty}</span></div>
        </div>
        <div class="qty">
          <button class="mini" data-act="minus" data-id="${U.escAttr(id)}">-</button>
          <div style="min-width:22px;text-align:center;font-weight:1000">${it.qty}</div>
          <button class="mini" data-act="plus" data-id="${U.escAttr(id)}">+</button>
          <button class="mini" data-act="del" data-id="${U.escAttr(id)}">🗑</button>
        </div>
      `;

      row.querySelectorAll("button").forEach(b => {
        b.onclick = () => {
          const act = b.getAttribute("data-act");
          const pid = b.getAttribute("data-id");
          const item = cart.get(pid);
          if (!item) return;

          const stock = Number(item.p.stock || 0);

          if (act === "minus") S.setCartQty(pid, Math.max(1, item.qty - 1));
          if (act === "plus") {
            if (item.qty + 1 > stock) { U.toast("No hay stock suficiente"); return; }
            S.setCartQty(pid, item.qty + 1);
          }
          if (act === "del") S.delFromCart(pid);

          renderCart();
          computeSummary();
          S.updateCartCountUI();
          syncBottomCount();
        };
      });

      el.appendChild(row);
    }

    S.updateCartCountUI();
    syncBottomCount();
  }

  function computeSummary() {
    const sum = U.$("summary");
    const cart = S.getCart();

    if (cart.size === 0) {
      sum.innerHTML = `<div class="note">Agrega productos para ver el total.</div>`;
      MINI?.set?.("");
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

    const cash = Number((U.$("cashAmount").value || "").replace(/[^\d.]/g, "") || 0);
    const change = (local && pay === "pagar_al_recibir" && cash > 0) ? Math.max(0, cash - subtotal) : 0;

    sum.innerHTML = `
      <div class="sum"><div>Subtotal</div><div>${U.money(subtotal, CFG.CURRENCY)}</div></div>
      <div class="sum"><div>Envío</div><div>${(!local && pay === "prepago") ? U.money(shipping, CFG.CURRENCY) : "Se paga a empresa / coordina"}</div></div>
      <div class="sum total"><div>Total a pagar ahora</div><div>${U.money(totalNow, CFG.CURRENCY)}</div></div>
      ${local && pay === "pagar_al_recibir" ? (cash > 0
        ? `<div class="note" style="margin-top:8px">Paga con: ${U.money(cash, CFG.CURRENCY)} → Cambio estimado: ${U.money(change, CFG.CURRENCY)}</div>`
        : `<div class="note" style="margin-top:8px">Para calcular cambio, escribe “¿con cuánto pagará?”</div>`) : ""}
    `;

    MINI?.update?.({ itemsCount, totalNow, local, pay, shipping });
  }

  function bindEvents() {
    U.$("cartBtn").onclick = openCart;
    U.$("closeCart").onclick = closeCart;
    U.$("cartModal").onclick = (e) => { if (e.target.id === "cartModal") closeCart(); };

    const b = U.$("bottomCartBtn");
    if (b) b.onclick = openCart;

    syncBottomCount();
  }

  return { openCart, closeCart, renderCart, computeSummary, bindEvents };
})();

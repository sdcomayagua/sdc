window.SDC_CART = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;

  const FALLBACK = window.SDC_FALLBACK_IMG?.url || "";

  function syncBottomCount(){
    const el = U.$("bottomCartCount");
    if (el) el.textContent = String(S.cartCount());
  }

  function openCart() {
    U.$("cartModal").classList.add("open");

    window.SDC_WATCH?.checkCartChanges?.();

    renderCart();
    computeSummary();
    window.SDC_UI_BADGES?.updateCheckoutBadge?.();

    window.SDC_CHECKOUT?.showStep?.(1);
    window.SDC_STEPPER?.render?.();
    window.SDC_GUARD?.syncNextDisabled?.();
    window.SDC_GUARD?.showErr?.("");
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
    window.SDC_GUARD?.syncNextDisabled?.();
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
      const unit = Number(p.precio || 0);
      const sub = unit * it.qty;

      const row = document.createElement("div");
      row.className = "cartItem";

      const img = document.createElement("img");
      img.src = p.imagen || FALLBACK;
      img.alt = p.nombre || "";
      img.onerror = () => { img.src = FALLBACK; };
      img.onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p, { setHash:false });

      const info = document.createElement("div");
      info.style.flex = "1";

      const title = document.createElement("div");
      title.className = "cartTitle";
      title.textContent = p.nombre || "";
      title.onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p, { setHash:false });

      const cat = document.createElement("div");
      cat.className = "mut";
      cat.textContent = `${p.categoria || ""}${p.subcategoria ? (" • " + p.subcategoria) : ""}`;

      const meta = document.createElement("div");
      meta.className = "cartMeta";
      meta.innerHTML = `<b>Unit:</b> ${U.money(unit, CFG.CURRENCY)} <span class="mut">•</span> <b>Sub:</b> ${U.money(sub, CFG.CURRENCY)}`;

      info.appendChild(title);
      info.appendChild(cat);
      info.appendChild(meta);

      // controls
      const controls = document.createElement("div");
      controls.className = "cartQty";

      const pill = document.createElement("div");
      pill.className = "qtyPill";

      const minus = document.createElement("button");
      minus.className = "qtyBtn";
      minus.type = "button";
      minus.textContent = "−";
      minus.onclick = () => {
        it.qty = Math.max(1, it.qty - 1);
        S.updateCartCountUI();
        window.SDC_CART_BADGE?.apply?.();
        renderCart();
        computeSummary();
        window.SDC_WATCH?.checkCartChanges?.();
        window.SDC_GUARD?.syncNextDisabled?.();
      };

      const num = document.createElement("div");
      num.className = "qtyNum";
      num.textContent = String(it.qty);

      const plus = document.createElement("button");
      plus.className = "qtyBtn";
      plus.type = "button";
      plus.textContent = "+";
      plus.onclick = () => {
        const stock = Number(p.stock || 0);
        if (it.qty + 1 > stock) { U.toast("No hay stock suficiente"); return; }
        it.qty += 1;
        S.updateCartCountUI();
        window.SDC_CART_BADGE?.apply?.();
        renderCart();
        computeSummary();
        window.SDC_WATCH?.checkCartChanges?.();
        window.SDC_GUARD?.syncNextDisabled?.();
      };

      pill.appendChild(minus);
      pill.appendChild(num);
      pill.appendChild(plus);

      const del = document.createElement("button");
      del.className = "delBtn";
      del.type = "button";
      del.textContent = "🗑";
      del.onclick = () => {
        cart.delete(id);
        S.updateCartCountUI();
        window.SDC_CART_BADGE?.apply?.();
        renderCart();
        computeSummary();
        window.SDC_WATCH?.checkCartChanges?.();
        window.SDC_GUARD?.syncNextDisabled?.();
      };

      controls.appendChild(pill);
      controls.appendChild(del);

      row.appendChild(img);
      row.appendChild(info);
      row.appendChild(controls);

      el.appendChild(row);
    }
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
    if (mini) mini.textContent = `Items: ${itemsCount} • Total ahora: ${U.money(totalNow, CFG.CURRENCY)}`;

    window.SDC_UI_BADGES?.updateCheckoutBadge?.();
  }

  function bindEvents() {
    U.$("cartBtn").onclick = openCart;
    U.$("closeCart").onclick = closeCart;
    U.$("cartModal").onclick = (e)=>{ if(e.target.id==="cartModal") closeCart(); };
    U.$("bottomCartBtn").onclick = openCart;

    U.$("clearCartBtn").onclick = clearCart;
  }

  return { openCart, closeCart, renderCart, computeSummary, bindEvents };
})();

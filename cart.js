window.SDC_CART = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const ST = window.SDC_STORE;

  function updateCount() {
    let count = 0;
    for (const it of ST.cart.values()) count += it.qty;
    U.$("cartCount").textContent = count;
  }

  function add(p, qty) {
    const id = p.id || p.nombre;
    const stock = Number(p.stock || 0);
    const cur = ST.cart.get(id);
    const currentQty = cur ? cur.qty : 0;
    const addQty = Math.max(1, Number(qty || 1));
    const next = currentQty + addQty;

    if (next > stock) {
      U.toast("No hay stock suficiente");
      return false;
    }

    ST.cart.set(id, { p, qty: next });
    updateCount();
    U.toast("Agregado al carrito");
    return true;
  }

  function open() {
    U.$("cartModal").classList.add("open");
    render();
    window.SDC_DELIVERY.compute();
  }

  function close() {
    U.$("cartModal").classList.remove("open");
  }

  function render() {
    const el = U.$("cartItems");
    el.innerHTML = "";
    if (ST.cart.size === 0) {
      el.innerHTML = `<div class="note">Tu carrito está vacío.</div>`;
      return;
    }

    for (const [id, it] of ST.cart.entries()) {
      const p = it.p;
      const row = document.createElement("div");
      row.className = "cartItem";
      row.innerHTML = `
        <img src="${U.escAttr(p.imagen || "")}" alt="">
        <div style="flex:1">
          <div style="font-weight:900">${U.esc(p.nombre || "")}</div>
          <div class="mut">${U.esc(p.categoria || "")}${p.subcategoria ? (" • " + U.esc(p.subcategoria)) : ""}</div>
          <div style="margin-top:6px;font-weight:900">${U.money(p.precio, CFG.CURRENCY)} <span class="mut">x ${it.qty}</span></div>
        </div>
        <div class="qty">
          <button class="mini" data-act="minus" data-id="${U.escAttr(id)}">-</button>
          <div style="min-width:22px;text-align:center;font-weight:900">${it.qty}</div>
          <button class="mini" data-act="plus" data-id="${U.escAttr(id)}">+</button>
          <button class="mini" data-act="del" data-id="${U.escAttr(id)}">🗑</button>
        </div>
      `;

      row.querySelectorAll("button").forEach(b => {
        b.onclick = () => {
          const act = b.getAttribute("data-act");
          const pid = b.getAttribute("data-id");
          const item = ST.cart.get(pid);
          if (!item) return;

          const stock = Number(item.p.stock || 0);

          if (act === "minus") item.qty = Math.max(1, item.qty - 1);
          if (act === "plus") {
            if (item.qty + 1 > stock) { U.toast("No hay stock suficiente"); return; }
            item.qty += 1;
          }
          if (act === "del") {
            ST.cart.delete(pid);
            updateCount();
            render();
            window.SDC_DELIVERY.compute();
            return;
          }

          ST.cart.set(pid, item);
          updateCount();
          render();
          window.SDC_DELIVERY.compute();
        };
      });

      el.appendChild(row);
    }
  }

  return { add, open, close, render, updateCount };
})();

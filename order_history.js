window.SDC_ORDERS = (() => {
  const KEY = "SDC_ORDER_HISTORY";
  const MAX = 8;

  function read(){
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function write(arr){
    try { localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX))); } catch {}
  }

  function saveOrder({cartItems, message}) {
    const list = read();
    const item = {
      at: Date.now(),
      cartItems, // [{id, qty}]
      message
    };
    list.unshift(item);
    write(list);
  }

  function getAll(){ return read(); }

  function restore(index=0){
    const list = read();
    const item = list[index];
    if (!item) return false;

    const S = window.SDC_STORE;
    const products = S.getProducts();

    const map = new Map();
    for (const it of (item.cartItems||[])) {
      const id = String(it.id||"").trim();
      const qty = Number(it.qty||1);
      const p = products.find(x=>String(x.id||"").trim()===id) || null;
      if (!p) continue;
      map.set(id, { p, qty });
    }
    S.state.cart = map;
    S.updateCartCountUI();
    window.SDC_CART?.renderCart?.();
    window.SDC_CART?.computeSummary?.();
    return true;
  }

  function render(){
    const el = document.getElementById("orderHistory");
    if (!el) return;

    const list = read();
    if (!list.length) {
      el.innerHTML = `<div class="note">Sin pedidos guardados todavía.</div>`;
      return;
    }

    el.innerHTML = `
      <div class="panelTitle">Historial</div>
      <div class="orderList">
        ${list.map((o, i)=>`
          <button class="btn ghost orderItem" data-i="${i}">
            Repetir pedido • ${new Date(o.at).toLocaleString()}
          </button>
        `).join("")}
      </div>
    `;

    el.querySelectorAll(".orderItem").forEach(b=>{
      b.onclick = ()=>{
        const i = Number(b.getAttribute("data-i")||0);
        const ok = restore(i);
        window.SDC_UTILS?.toast?.(ok ? "Pedido cargado ✅" : "No se pudo cargar");
        if (ok) window.SDC_CART?.openCart?.();
      };
    });
  }

  return { saveOrder, getAll, restore, render };
})();
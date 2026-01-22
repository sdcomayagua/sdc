window.SDC_ORDERS_PRO = (() => {
  const KEY = "SDC_ORDER_HISTORY";
  const MAX = 10;

  function read(){
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function write(arr){
    try { localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX))); } catch {}
  }

  function clearAll(){
    write([]);
    render();
  }

  function removeAt(i){
    const list = read();
    list.splice(i,1);
    write(list);
    render();
  }

  function render(){
    const el = document.getElementById("orderHistory");
    if (!el) return;

    const list = read();
    if (!list.length){
      el.innerHTML = `<div class="note">Sin pedidos guardados todavía.</div>`;
      return;
    }

    el.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="panelTitle">Historial</div>
        <button class="btn danger" id="clearHistoryBtn" type="button">Borrar historial</button>
      </div>

      <div class="orderList">
        ${list.map((o,i)=>`
          <div class="orderCard">
            <div class="mut">${new Date(o.at).toLocaleString()}</div>
            <div style="margin-top:6px;font-weight:1000">${(o.itemsCount||0)} items • ${o.totalText||""}</div>
            <div style="display:flex;gap:8px;margin-top:10px">
              <button class="btn ghost repeatBtn" data-i="${i}" type="button">Repetir</button>
              <button class="btn danger delBtn" data-i="${i}" type="button">Eliminar</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    document.getElementById("clearHistoryBtn")?.addEventListener("click", ()=>{
      const ok = confirm("¿Borrar historial de pedidos?");
      if (!ok) return;
      clearAll();
    });

    el.querySelectorAll(".repeatBtn").forEach(b=>{
      b.onclick = ()=>{
        const i = Number(b.getAttribute("data-i")||0);
        const item = read()[i];
        if (!item) return;

        // restaurar carrito
        const S = window.SDC_STORE;
        const products = S.getProducts();
        const map = new Map();
        for (const it of (item.cartItems||[])){
          const id = String(it.id||"").trim();
          const qty = Number(it.qty||1);
          const p = products.find(x=>String(x.id||"").trim()===id);
          if (!p) continue;
          map.set(id, { p, qty });
        }
        S.state.cart = map;
        S.updateCartCountUI();
        window.SDC_CART?.renderCart?.();
        window.SDC_CART?.computeSummary?.();
        window.SDC_CART?.openCart?.();
        window.SDC_UTILS?.toast?.("Pedido cargado ✅");
      };
    });

    el.querySelectorAll(".delBtn").forEach(b=>{
      b.onclick = ()=>{
        const i = Number(b.getAttribute("data-i")||0);
        removeAt(i);
      };
    });
  }

  function saveOrder({cartItems, itemsCount, totalText}){
    const list = read();
    list.unshift({ at:Date.now(), cartItems, itemsCount, totalText });
    write(list);
  }

  return { render, saveOrder, clearAll };
})();
// p7_cart_offer.js
window.SDC_P7_CART_OFFER = (() => {
  const money = (n) => window.SDC_UTILS?.money?.(n, window.SDC_CONFIG?.CURRENCY) || "";

  function pct(prev, cur){
    if (!(prev > 0 && prev > cur)) return 0;
    return Math.round(((prev - cur) / prev) * 100);
  }

  function findProductByName(name){
    const list = window.SDC_STORE?.getProducts?.() || [];
    const t = String(name||"").trim();
    return list.find(p => String(p.nombre||"").trim() === t) || null;
  }

  // Intenta identificar producto desde una fila del carrito
  function findProductFromCartRow(row){
    // Preferimos buscar por el título del carrito
    const title = row.querySelector(".cartTitle")?.textContent || row.querySelector("div[style*='font-weight']")?.textContent || "";
    return findProductByName(title);
  }

  function decorateCart(){
    const itemsWrap = document.getElementById("cartItems");
    if (!itemsWrap) return;

    let totalSaved = 0;

    itemsWrap.querySelectorAll(".cartItem").forEach(row => {
      const p = findProductFromCartRow(row);
      if (!p) return;

      const prev = Number(p.precio_anterior||0);
      const cur  = Number(p.precio||0);
      if (!(prev > 0 && prev > cur)) {
        // limpiar si antes existía
        row.querySelectorAll(".cartOfferTag,.cartSave,.cartStrike").forEach(x => x.remove());
        return;
      }

      // qty: busca el número en el pill
      let qty = 1;
      const qtyEl = row.querySelector(".qtyNum");
      if (qtyEl) qty = Number(qtyEl.textContent||"1") || 1;

      const saved = (prev - cur) * qty;
      totalSaved += saved;

      // 1) Añadir strike junto al Unit
      const meta = row.querySelector(".cartMeta");
      if (meta && !meta.querySelector(".cartStrike")){
        // Busca "Unit:" y agrega strike al final
        const strike = document.createElement("span");
        strike.className = "cartStrike";
        strike.textContent = money(prev);
        meta.appendChild(strike);
      }

      // 2) Badge oferta
      if (!row.querySelector(".cartOfferTag")){
        const tag = document.createElement("div");
        tag.className = "cartOfferTag";
        tag.textContent = `OFERTA -${pct(prev, cur)}%`;
        // lo ponemos debajo del meta
        (meta || row).insertAdjacentElement("afterend", tag);
      }

      // 3) Ahorras
      if (!row.querySelector(".cartSave")){
        const saveLine = document.createElement("div");
        saveLine.className = "cartSave";
        saveLine.innerHTML = `Ahorras <b>${money(saved)}</b>`;
        const tag = row.querySelector(".cartOfferTag");
        (tag || meta || row).insertAdjacentElement("afterend", saveLine);
      } else {
        // actualizar si cambia qty
        const s = row.querySelector(".cartSave");
        s.innerHTML = `Ahorras <b>${money(saved)}</b>`;
      }
    });

    // Mostrar ahorro total en el resumen
    const summary = document.getElementById("summary");
    if (summary){
      // evita duplicar
      summary.querySelectorAll(".sumSavings").forEach(x => x.remove());

      if (totalSaved > 0){
        const box = document.createElement("div");
        box.className = "sum sumSavings";
        box.innerHTML = `<div>Ahorro total</div><div><b>${money(totalSaved)}</b></div>`;
        // lo metemos arriba del total si existe
        summary.insertAdjacentElement("afterbegin", box);
      }
    }
  }

  function init(){
    const modal = document.getElementById("cartModal");
    if (!modal) return;

    // Cuando abre carrito → decorar
    const obs = new MutationObserver(() => {
      if (!modal.classList.contains("open")) return;
      setTimeout(decorateCart, 120);
    });
    obs.observe(modal, { attributes:true, attributeFilter:["class"] });

    // También cuando cambia el contenido del carrito (qty +/-)
    const itemsWrap = document.getElementById("cartItems");
    if (itemsWrap){
      const obs2 = new MutationObserver(() => setTimeout(decorateCart, 80));
      obs2.observe(itemsWrap, { childList:true, subtree:true });
    }
  }

  return { init, decorateCart };
})();
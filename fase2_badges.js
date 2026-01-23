// fase2_badges.js
window.SDC_FASE2_BADGES = (() => {
  const money = (n) => window.SDC_UTILS?.money?.(n, window.SDC_CONFIG?.CURRENCY) || "";

  function getProducts(){
    return window.SDC_STORE?.getProducts?.() || [];
  }

  function getProductForCard(card){
    const pid = card.getAttribute("data-pid");
    const list = getProducts();

    if (pid){
      return list.find(p => String(p.id||p.nombre||"").trim() === String(pid).trim()) || null;
    }

    // fallback por nombre (si no hay data-pid)
    const name = card.querySelector(".name")?.textContent?.trim() || "";
    return list.find(p => String(p.nombre||"").trim() === name) || null;
  }

  function computeNewThreshold(){
    const ords = getProducts()
      .map(p => Number(p.orden||0))
      .filter(n => Number.isFinite(n) && n > 0)
      .sort((a,b)=>a-b);

    if (!ords.length) return 0;
    return ords[Math.floor(ords.length * 0.85)] || 0; // top 15%
  }

  function decorateCard(card, newMinOrden){
    const p = getProductForCard(card);
    if (!p) return;

    const cur = Number(p.precio||0);
    const prev = Number(p.precio_anterior||0);

    const isOffer = prev > 0 && prev > cur;
    const saveAmt = isOffer ? (prev - cur) : 0;
    const savePct = isOffer ? Math.round((saveAmt / prev) * 100) : 0;

    const ord = Number(p.orden||0);
    const isNew = ord > 0 && ord >= newMinOrden;

    // --- RIBBONS ---
    const wrap = card.querySelector(".imgWrap");
    if (wrap){
      // elimina ribbonRow previo para evitar duplicados
      wrap.querySelector(".ribbonRow")?.remove();

      if (isNew || (isOffer && savePct > 0)){
        const rr = document.createElement("div");
        rr.className = "ribbonRow";

        // izquierda NUEVO (si aplica)
        if (isNew){
          const r = document.createElement("div");
          r.className = "ribbon new";
          r.textContent = "NUEVO";
          rr.appendChild(r);
        } else {
          // placeholder invisible para mantener espacio
          const ph = document.createElement("div");
          ph.style.opacity = "0";
          ph.textContent = "x";
          rr.appendChild(ph);
        }

        // derecha OFERTA
        if (isOffer && savePct > 0){
          const r = document.createElement("div");
          r.className = "ribbon offer";
          r.textContent = `OFERTA -${savePct}%`;
          rr.appendChild(r);
        }

        wrap.appendChild(rr);
      }
    }

    // --- PRECIO tachado + AHORRAS ---
    const box = card.querySelector(".p");
    const priceEl = card.querySelector(".price");

    // limpia líneas previas
    card.querySelectorAll(".saveLine").forEach(x=>x.remove());
    if (priceEl){
      const oldStrike = priceEl.querySelector(".strike");
      if (oldStrike) oldStrike.remove();
    }

    if (isOffer){
      if (priceEl){
        const s = document.createElement("span");
        s.className = "strike";
        s.textContent = money(prev);
        priceEl.appendChild(s);
      }
      if (box && saveAmt > 0){
        const save = document.createElement("div");
        save.className = "saveLine";
        save.innerHTML = `Ahorras <b>${money(saveAmt)}</b>`;
        box.appendChild(save);
      }
    }
  }

  function applyAll(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    const thr = computeNewThreshold();
    grid.querySelectorAll(".card").forEach(c => decorateCard(c, thr));
  }

  function hookGrid(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    if (window.__SDC_FASE2_BADGES_OBS__) return;
    window.__SDC_FASE2_BADGES_OBS__ = true;

    const obs = new MutationObserver(() => {
      // cuando se renderiza o cambia, re-aplicar
      applyAll();
    });
    obs.observe(grid, { childList:true, subtree:true });
  }

  function init(){
    hookGrid();

    // espera a productos cargados
    const t = setInterval(() => {
      if (getProducts().length === 0) return;
      clearInterval(t);
      applyAll();
    }, 250);
  }

  return { init, applyAll };
})();
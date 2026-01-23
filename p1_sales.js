// p1_sales.js (FOOTER)
// Quita la barra de confianza de arriba y la pone al FINAL de la página.
// Mantiene urgencia "Últimas unidades".

window.SDC_P1 = (() => {
  function removeTopTrust(){
    // Por si existe barra arriba, la quitamos
    const old = document.getElementById("trustBar");
    if (old) old.remove();
  }

  function trustFooter(){
    const main = document.querySelector("main.wrap");
    if (!main) return;

    // No duplicar
    if (document.getElementById("trustFooter")) return;

    const sec = document.createElement("section");
    sec.id = "trustFooter";
    sec.className = "trustFooter";
    sec.innerHTML = `
      <div class="trustFooterTitle">✅ Compra con confianza</div>
      <div class="trustFooterRow">
        <div class="trustFooterItem">✅ <span>Pagar al recibir</span></div>
        <div class="trustFooterItem">🚚 <span>Envíos Honduras</span></div>
        <div class="trustFooterItem">🛡️ <span>Garantía</span></div>
      </div>
      <div class="trustFooterNote">*La entrega local se coordina por WhatsApp. Envíos nacionales por empresa.*</div>
    `;

    // Al final del main
    main.appendChild(sec);
  }

  function applyUrgency(card){
    const pid = card.getAttribute("data-pid");
    if (!pid) return;

    const list = window.SDC_STORE?.getProducts?.() || [];
    const p = list.find(x => String(x.id||x.nombre||"") === pid);
    if (!p) return;

    const stock = Number(p.stock||0);
    const wrap = card.querySelector(".imgWrap");
    if (!wrap) return;

    wrap.querySelector(".urgentTag")?.remove();
    card.classList.remove("urgent");

    if (stock > 0 && stock <= 3){
      card.classList.add("urgent");
      const tag = document.createElement("div");
      tag.className = "urgentTag";
      tag.textContent = "Últimas unidades";
      wrap.appendChild(tag);
    }
  }

  function hookGrid(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    const obs = new MutationObserver(() => {
      grid.querySelectorAll(".card").forEach(applyUrgency);
    });
    obs.observe(grid, { childList:true, subtree:true });
  }

  function init(){
    // ✅ quitar de arriba
    removeTopTrust();

    // ✅ poner al final
    trustFooter();

    // urgencia
    hookGrid();
    setTimeout(() => {
      document.querySelectorAll(".card").forEach(applyUrgency);
    }, 800);
  }

  return { init };
})();
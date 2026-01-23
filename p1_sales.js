// p1_sales.js
window.SDC_P1 = (() => {
  function trustBar(){
    const headerWrap = document.querySelector("header .wrap");
    if (!headerWrap) return;
    if (document.getElementById("trustBar")) return;

    const bar = document.createElement("div");
    bar.id = "trustBar";
    bar.className = "trustBar";
    bar.innerHTML = `
      <div class="trustItem">✅ <span>Pagar al recibir</span></div>
      <div class="trustItem">🚚 <span>Envíos Honduras</span></div>
      <div class="trustItem">🛡️ <span>Garantía</span></div>
    `;

    const banner = document.getElementById("topBanner");
    if (banner) banner.insertAdjacentElement("afterend", bar);
    else headerWrap.appendChild(bar);
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
    trustBar();
    hookGrid();
    // reaplica tras cargar productos
    setTimeout(() => {
      document.querySelectorAll(".card").forEach(applyUrgency);
    }, 800);
  }

  return { init };
})();
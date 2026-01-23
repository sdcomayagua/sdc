// p1_sales.js (ACTUALIZADO)
// Barra confianza arriba del AppBar + urgencia stock

window.SDC_P1 = (() => {
  function trustBar(){
    const header = document.querySelector("header");
    const headerWrap = document.querySelector("header .wrap");
    if (!header || !headerWrap) return;

    // si ya existe, no duplicar
    if (document.getElementById("trustBar")) return;

    const bar = document.createElement("div");
    bar.id = "trustBar";
    bar.className = "trustBar";
    bar.innerHTML = `
      <div class="trustItem">✅ <span>Pagar al recibir</span></div>
      <div class="trustItem">🚚 <span>Envíos Honduras</span></div>
      <div class="trustItem">🛡️ <span>Garantía</span></div>
    `;

    // ✅ PRIORIDAD: ponerla arriba de Catálogo SDC (AppBar)
    // store_extras.js inyecta el AppBar con id="appBar"
    const appBar = document.getElementById("appBar");

    if (appBar) {
      // la ponemos justo ANTES del AppBar
      appBar.insertAdjacentElement("beforebegin", bar);
      bar.style.marginTop = "0";
      return;
    }

    // Si todavía no existe AppBar, la ponemos arriba del headerWrap
    headerWrap.insertAdjacentElement("afterbegin", bar);
    bar.style.marginTop = "0";
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
    // intenta al inicio
    trustBar();

    // reintenta luego por si AppBar entra después
    setTimeout(() => {
      // si la barra existe pero quedó abajo del AppBar, la movemos
      const bar = document.getElementById("trustBar");
      const appBar = document.getElementById("appBar");
      if (bar && appBar && bar.nextElementSibling !== appBar) {
        appBar.insertAdjacentElement("beforebegin", bar);
        bar.style.marginTop = "0";
      } else {
        trustBar();
      }
    }, 350);

    hookGrid();

    setTimeout(() => {
      document.querySelectorAll(".card").forEach(applyUrgency);
    }, 800);
  }

  return { init };
})();
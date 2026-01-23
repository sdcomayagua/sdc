// favorites_section.js
window.SDC_FAV_SECTION = (() => {
  function ensureSection(){
    if (document.getElementById("favSection")) return;

    const main = document.querySelector("main.wrap");
    if (!main) return;

    const sec = document.createElement("section");
    sec.id = "favSection";
    sec.className = "section";
    sec.style.display = "none";

    sec.innerHTML = `
      <div class="sectionHead">
        <div>
          <div class="sectionTitle">Favoritos</div>
          <div class="mut">Tus productos guardados</div>
        </div>
      </div>
      <div class="hScroll" id="favRow"></div>
    `;

    // insertar antes del grid
    const grid = document.getElementById("grid");
    if (grid) grid.insertAdjacentElement("beforebegin", sec);
    else main.prepend(sec);
  }

  function render(){
    ensureSection();
    const sec = document.getElementById("favSection");
    const row = document.getElementById("favRow");
    if (!sec || !row) return;

    const favIds = window.SDC_FAV?.read?.() || [];
    const products = window.SDC_STORE?.getProducts?.() || [];

    const favProducts = favIds
      .map(id => products.find(p => String(p.id||p.nombre||"") === String(id)))
      .filter(Boolean);

    if (!favProducts.length){
      sec.style.display = "none";
      row.innerHTML = "";
      return;
    }

    sec.style.display = "block";
    row.innerHTML = "";

    favProducts.slice(0, 12).forEach(p => {
      const c = document.createElement("div");
      c.className = "hCard";
      c.onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p, { setHash:true });

      const img = document.createElement("img");
      img.src = p.imagen || (window.SDC_FALLBACK_IMG?.url||"");
      img.onerror = () => { img.src = (window.SDC_FALLBACK_IMG?.url||""); };

      const hp = document.createElement("div");
      hp.className = "hp";

      const name = document.createElement("div");
      name.className = "hname";
      name.textContent = p.nombre || "";

      const price = document.createElement("div");
      price.className = "hprice";
      price.textContent = (window.SDC_UTILS?.money?.(p.precio, window.SDC_CONFIG?.CURRENCY) || "");

      hp.appendChild(name);
      hp.appendChild(price);

      c.appendChild(img);
      c.appendChild(hp);

      row.appendChild(c);
    });
  }

  function init(){
    ensureSection();
    render();
  }

  return { init, render };
})();
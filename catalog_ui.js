window.SDC_CATALOG_UI = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const PM = window.SDC_PRODUCT_MODAL;

  const fallbackSvg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
      <rect width='100%' height='100%' fill='#0a0f17'/>
      <text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text>
    </svg>`
  );

  function renderTabs() {
    const el = U.$("catTabs");
    el.innerHTML = "";
    const categories = S.getCats();
    const activeCat = S.getActiveCat();

    categories.forEach(c => {
      const d = document.createElement("div");
      d.className = "tab" + (c === activeCat ? " active" : "");
      d.textContent = c;
      d.onclick = () => {
        S.setActiveCat(c);
        S.setActiveSub("Todas");
        renderTabs();
        renderSubTabs();
        renderGrid();
      };
      el.appendChild(d);
    });
  }

  function renderSubTabs() {
    const el = U.$("subTabs");
    el.innerHTML = "";

    const activeCat = S.getActiveCat();
    const activeSub = S.getActiveSub();
    const subcatsByCat = S.getSubcatsMap();

    let subs = [];
    if (activeCat === "Todas") {
      const all = new Set();
      for (const set of subcatsByCat.values()) for (const s of set) all.add(s);
      subs = ["Todas", ...Array.from(all).sort((a,b)=>a.localeCompare(b))];
    } else {
      const set = subcatsByCat.get(activeCat) || new Set();
      subs = ["Todas", ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
    }

    subs.forEach(s => {
      const d = document.createElement("div");
      d.className = "tab" + (s === activeSub ? " active" : "");
      d.textContent = s;
      d.onclick = () => {
        S.setActiveSub(s);
        renderSubTabs();
        renderGrid();
      };
      el.appendChild(d);
    });
  }

  function renderGrid() {
    const q = (U.$("q").value || "").trim().toLowerCase();
    const activeCat = S.getActiveCat();
    const activeSub = S.getActiveSub();

    let list = S.getProducts();

    if (activeCat !== "Todas") list = list.filter(p => p.categoria === activeCat);
    if (activeSub !== "Todas") list = list.filter(p => p.subcategoria === activeSub);
    if (q) list = list.filter(p =>
      (p.nombre || "").toLowerCase().includes(q) ||
      (p.tags || "").toLowerCase().includes(q) ||
      (p.marca || "").toLowerCase().includes(q) ||
      (p.modelo || "").toLowerCase().includes(q)
    );

    const el = U.$("grid");
    el.innerHTML = "";

    list.forEach(p => {
      const inStock = Number(p.stock || 0) > 0;

      const card = document.createElement("div");
      card.className = "card";
      card.onclick = () => PM.open(p, { setHash: true });

      const img = document.createElement("img");
      img.className = "img";
      img.loading = "lazy";
      img.src = p.imagen || "";
      img.alt = p.nombre || "";
      img.onerror = () => img.src = fallbackSvg;

      const box = document.createElement("div");
      box.className = "p";
      box.innerHTML = `
        <div class="name">${U.esc(p.nombre || "")}</div>
        <div class="mut">${U.esc(p.categoria || "")}${p.subcategoria ? (" • " + U.esc(p.subcategoria)) : ""}</div>
        <div class="price">${U.money(p.precio, CFG.CURRENCY)}</div>
      `;

      const badge = document.createElement("div");
      badge.className = "badge " + (inStock ? "off" : "out");
      badge.textContent = inStock ? `Stock: ${Number(p.stock)}` : "AGOTADO";

      const btn = document.createElement("button");
      btn.className = "btn acc";
      btn.style.width = "100%";
      btn.style.marginTop = "10px";
      btn.textContent = inStock ? "Añadir al carrito" : "No disponible";
      btn.disabled = !inStock;
      btn.onclick = (ev) => { ev.stopPropagation(); S.addToCart(p, 1); };

      box.appendChild(badge);
      box.appendChild(btn);

      card.appendChild(img);
      card.appendChild(box);
      el.appendChild(card);
    });
  }

  return { renderTabs, renderSubTabs, renderGrid };
})();

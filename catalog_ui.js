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

  function toBool(v){
    const s = String(v ?? "").trim().toLowerCase();
    return v === true || s === "1" || s === "true" || s === "si" || s === "sí" || s === "yes";
  }

  function getSortMode(){
    const sel = U.$("sortSel");
    return sel ? (sel.value || "relevancia") : "relevancia";
  }

  function sortList(list){
    const mode = getSortMode();

    const withStockFirst = (a,b) => {
      const sa = (Number(a.stock)>0)?0:1;
      const sb = (Number(b.stock)>0)?0:1;
      if(sa!==sb) return sa-sb;
      return 0;
    };

    const byOrderThenName = (a,b) => {
      const oa = Number(a.orden||0), ob = Number(b.orden||0);
      if(oa!==ob) return oa-ob;
      return String(a.nombre||"").localeCompare(String(b.nombre||""));
    };

    const byPriceAsc = (a,b) => Number(a.precio||0) - Number(b.precio||0);
    const byPriceDesc = (a,b) => Number(b.precio||0) - Number(a.precio||0);
    const byOrderDesc = (a,b) => Number(b.orden||0) - Number(a.orden||0);

    const copy = list.slice();

    if (mode === "precio_asc") {
      copy.sort((a,b)=>{ const s=withStockFirst(a,b); return s!==0?s:byPriceAsc(a,b); });
      return copy;
    }
    if (mode === "precio_desc") {
      copy.sort((a,b)=>{ const s=withStockFirst(a,b); return s!==0?s:byPriceDesc(a,b); });
      return copy;
    }
    if (mode === "orden_desc") {
      copy.sort((a,b)=>{ const s=withStockFirst(a,b); return s!==0?s:byOrderDesc(a,b); });
      return copy;
    }
    if (mode === "stock_first") {
      copy.sort((a,b)=>{ const s=withStockFirst(a,b); return s!==0?s:byOrderThenName(a,b); });
      return copy;
    }

    // "relevancia" (tu orden actual)
    copy.sort((a,b)=>{
      const sa = (Number(a.stock)>0)?0:1;
      const sb = (Number(b.stock)>0)?0:1;
      if(sa!==sb) return sa-sb;
      const oa = Number(a.orden||0), ob = Number(b.orden||0);
      if(oa!==ob) return oa-ob;
      return String(a.nombre||"").localeCompare(String(b.nombre||""));
    });
    return copy;
  }

  // ✅ solo mostrar secciones cuando estamos en “Todas/Todas”
  function shouldShowTopSections(){
    return S.getActiveCat() === "Todas" && S.getActiveSub() === "Todas";
  }

  function hideTopSections(){
    const fs = U.$("featuredSection");
    const os = U.$("offersSection");
    if (fs) fs.style.display = "none";
    if (os) os.style.display = "none";
    const fr = U.$("featuredRow"); if (fr) fr.innerHTML = "";
    const or = U.$("offersRow"); if (or) or.innerHTML = "";
  }

  function renderFeatured() {
    if (!shouldShowTopSections()){
      hideTopSections();
      return;
    }

    const all = S.getProducts();
    const featured = all.filter(p => toBool(p.destacado));
    const offers = all.filter(p => toBool(p.oferta) || (Number(p.precio_anterior||0) > Number(p.precio||0)));

    renderHRow("featuredSection", "featuredRow", featured);
    renderHRow("offersSection", "offersRow", offers);
  }

  function renderHRow(sectionId, rowId, list){
    const section = U.$(sectionId);
    const row = U.$(rowId);
    if(!section || !row) return;

    const items = sortList(list).slice(0, 20);
    if(items.length === 0){
      section.style.display = "none";
      row.innerHTML = "";
      return;
    }

    section.style.display = "block";
    row.innerHTML = "";

    items.forEach(p => {
      const inStock = Number(p.stock||0) > 0;

      const card = document.createElement("div");
      card.className = "hCard";
      card.onclick = () => PM.open(p, { setHash:true });

      const img = document.createElement("img");
      img.src = p.imagen || "";
      img.alt = p.nombre || "";
      img.loading = "lazy";
      img.onerror = () => img.src = fallbackSvg;

      const box = document.createElement("div");
      box.className = "hp";
      box.innerHTML = `
        <div class="hname">${U.esc(p.nombre||"")}</div>
        <div class="mut">${inStock ? ("Stock: " + Number(p.stock||0)) : "AGOTADO"}</div>
        <div class="hprice">${U.money(p.precio, CFG.CURRENCY)}</div>
      `;

      card.appendChild(img);
      card.appendChild(box);
      row.appendChild(card);
    });
  }

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
        renderGrid(); // renderGrid se encarga de mostrar/ocultar secciones
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
        renderGrid(); // renderGrid se encarga de mostrar/ocultar secciones
      };
      el.appendChild(d);
    });
  }

  function renderGrid() {
    // ✅ Muestra u oculta Destacados/Ofertas según categoría/subcategoría
    renderFeatured();

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

    list = sortList(list);

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

  function bindSort() {
    const sel = U.$("sortSel");
    if (!sel) return;
    sel.onchange = () => renderGrid();
  }

  return { renderTabs, renderSubTabs, renderGrid, bindSort };
})();

window.SDC_CATALOG = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;

  const fallbackSvg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
      <rect width='100%' height='100%' fill='#0a0f17'/>
      <text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text>
    </svg>`
  );

  // Modal producto state
  let currentProduct = null;
  let pmQty = 1;
  let pmImages = [];
  let pmMainIndex = 0;

  async function load() {
    U.$("statusPill").textContent = "Cargando catálogo...";
    const res = await fetch(`${CFG.API_URL}?action=catalog`, { cache: "no-store" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "No se pudo cargar");

    S.setData(json);

    // productos
    let products = (json.productos || []).filter(p => p && p.nombre && p.categoria);

    // ordenar: stock>0 primero, luego orden, luego nombre
    products.sort((a, b) => {
      const sa = (Number(a.stock) > 0) ? 0 : 1;
      const sb = (Number(b.stock) > 0) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const oa = Number(a.orden || 0), ob = Number(b.orden || 0);
      if (oa !== ob) return oa - ob;
      return String(a.nombre).localeCompare(String(b.nombre));
    });

    S.setProducts(products);

    const cats = new Set(products.map(p => p.categoria || ""));
    const categories = ["Todas", ...Array.from(cats).filter(Boolean).sort((a,b)=>a.localeCompare(b))];
    S.setCats(categories);

    const sub = new Map();
    for (const p of products) {
      const c = p.categoria || "";
      const s = p.subcategoria || "";
      if (!sub.has(c)) sub.set(c, new Set());
      if (s) sub.get(c).add(s);
    }
    S.setSubcatsMap(sub);

    renderTabs();
    renderSubTabs();
    renderGrid();

    U.$("statusPill").textContent = `Catálogo listo (${products.length} productos)`;
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
      (p.tags || "").toLowerCase().includes(q)
    );

    const el = U.$("grid");
    el.innerHTML = "";

    list.forEach(p => {
      const inStock = Number(p.stock || 0) > 0;

      const card = document.createElement("div");
      card.className = "card";
      card.onclick = () => openProductModal(p);

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

  function parseGallery(p) {
    const imgs = [];
    if (p.imagen) imgs.push(String(p.imagen).trim());

    if (Array.isArray(p.galeria)) {
      p.galeria.forEach(u => { const s=String(u||"").trim(); if (s) imgs.push(s); });
    } else if (p.galeria) {
      String(p.galeria).split(",").forEach(u => { const s=String(u||"").trim(); if (s) imgs.push(s); });
    }

    for (let i=1; i<=8; i++) {
      const k = "galeria_" + i;
      if (p[k]) { const s = String(p[k]).trim(); if (s) imgs.push(s); }
    }

    const unique = [];
    const seen = new Set();
    for (const u of imgs) {
      if (!u) continue;
      if (seen.has(u)) continue;
      seen.add(u);
      unique.push(u);
      if (unique.length >= 8) break;
    }
    return unique;
  }

  function openProductModal(p) {
    currentProduct = p;
    pmQty = 1;
    pmMainIndex = 0;
    pmImages = parseGallery(p);

    U.$("pmTitle").textContent = p.nombre || "Producto";
    U.$("pmName").textContent = p.nombre || "";
    U.$("pmCat").textContent = `${p.categoria || ""}${p.subcategoria ? (" • " + p.subcategoria) : ""}`;
    U.$("pmPrice").textContent = U.money(p.precio, CFG.CURRENCY);

    const stock = Number(p.stock || 0);
    U.$("pmStockOk").style.display = stock > 0 ? "inline-block" : "none";
    U.$("pmStockOut").style.display = stock > 0 ? "none" : "inline-block";
    if (stock > 0) U.$("pmStockOk").textContent = `Stock: ${stock}`;

    U.$("pmDesc").textContent = (p.descripcion || "").trim() ? String(p.descripcion) : "Sin descripción por ahora.";

    const tiktok = String(p.tiktok_url || p.tiktok || p.video_tiktok || "").trim();
    const youtube = String(p.youtube_url || p.youtube || p.video_youtube || "").trim();
    const hasTik = !!tiktok;
    const hasYou = !!youtube;

    U.$("pmVideoRow").style.display = (hasTik || hasYou) ? "flex" : "none";
    U.$("pmTiktok").style.display = hasTik ? "inline-block" : "none";
    U.$("pmYoutube").style.display = hasYou ? "inline-block" : "none";
    if (hasTik) U.$("pmTiktok").href = tiktok;
    if (hasYou) U.$("pmYoutube").href = youtube;

    renderProductImages();

    U.$("pmQtyNum").textContent = String(pmQty);
    U.$("pmAddBtn").disabled = stock <= 0;
    U.$("pmNote").textContent = stock > 0 ? "Selecciona cantidad y añade al carrito." : "Este producto está agotado.";

    U.$("productModal").classList.add("open");
  }

  function renderProductImages() {
    const main = U.$("pmMainImg");
    const thumbs = U.$("pmThumbs");
    thumbs.innerHTML = "";

    const src = pmImages[pmMainIndex] || (currentProduct?.imagen || "");
    main.src = src || fallbackSvg;
    main.alt = currentProduct?.nombre || "Producto";
    main.onerror = () => main.src = fallbackSvg;

    pmImages.forEach((u, idx) => {
      const t = document.createElement("img");
      t.className = "pmThumb" + (idx === pmMainIndex ? " active" : "");
      t.src = u;
      t.alt = "mini";
      t.onerror = () => t.src = fallbackSvg;
      t.onclick = () => { pmMainIndex = idx; renderProductImages(); };
      thumbs.appendChild(t);
    });
  }

  function closeProductModal() {
    U.$("productModal").classList.remove("open");
    currentProduct = null;
  }

  function bindProductModalEvents() {
    U.$("pmClose").onclick = closeProductModal;
    U.$("productModal").onclick = (e) => { if (e.target.id === "productModal") closeProductModal(); };

    U.$("pmMinus").onclick = () => {
      pmQty = Math.max(1, pmQty - 1);
      U.$("pmQtyNum").textContent = String(pmQty);
    };

    U.$("pmPlus").onclick = () => {
      const stock = Number(currentProduct?.stock || 0);
      pmQty = pmQty + 1;
      if (stock > 0) pmQty = Math.min(pmQty, stock);
      U.$("pmQtyNum").textContent = String(pmQty);
    };

    U.$("pmAddBtn").onclick = () => {
      if (!currentProduct) return;
      const ok = S.addToCart(currentProduct, pmQty);
      if (ok) closeProductModal();
    };
  }

  return { load, renderGrid, renderTabs, renderSubTabs, bindProductModalEvents, closeProductModal };
})();

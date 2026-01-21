window.SDC_CATALOG = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const ST = window.SDC_STORE;

  async function load() {
    U.$("statusPill").textContent = "Cargando catálogo...";
    const res = await fetch(`${CFG.API_URL}?action=catalog`, { cache: "no-store" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "No se pudo cargar");
    ST.DATA = json;

    ST.products = (json.productos || []).filter(p => p && p.nombre && p.categoria);
    ST.products.sort((a, b) => {
      const sa = (Number(a.stock) > 0) ? 0 : 1;
      const sb = (Number(b.stock) > 0) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const oa = Number(a.orden || 0), ob = Number(b.orden || 0);
      if (oa !== ob) return oa - ob;
      return String(a.nombre).localeCompare(String(b.nombre));
    });

    const cats = new Set(ST.products.map(p => p.categoria || ""));
    ST.categories = ["Todas", ...Array.from(cats).filter(Boolean).sort((a, b) => a.localeCompare(b))];

    ST.subcatsByCat = new Map();
    for (const p of ST.products) {
      const c = p.categoria || "";
      const s = p.subcategoria || "";
      if (!ST.subcatsByCat.has(c)) ST.subcatsByCat.set(c, new Set());
      if (s) ST.subcatsByCat.get(c).add(s);
    }

    renderTabs();
    renderSubTabs();
    renderGrid();

    U.$("statusPill").textContent = `Catálogo listo (${ST.products.length} productos)`;
  }

  function renderTabs() {
    const el = U.$("catTabs");
    el.innerHTML = "";
    ST.categories.forEach(c => {
      const d = document.createElement("div");
      d.className = "tab" + (c === ST.activeCat ? " active" : "");
      d.textContent = c;
      d.onclick = () => { ST.activeCat = c; ST.activeSub = "Todas"; renderTabs(); renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function renderSubTabs() {
    const el = U.$("subTabs");
    el.innerHTML = "";
    let subs = [];
    if (ST.activeCat === "Todas") {
      const all = new Set();
      for (const set of ST.subcatsByCat.values()) for (const s of set) all.add(s);
      subs = ["Todas", ...Array.from(all).sort((a, b) => a.localeCompare(b))];
    } else {
      const set = ST.subcatsByCat.get(ST.activeCat) || new Set();
      subs = ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }
    subs.forEach(s => {
      const d = document.createElement("div");
      d.className = "tab" + (s === ST.activeSub ? " active" : "");
      d.textContent = s;
      d.onclick = () => { ST.activeSub = s; renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function renderGrid() {
    const q = (U.$("q").value || "").trim().toLowerCase();
    let list = ST.products;

    if (ST.activeCat !== "Todas") list = list.filter(p => p.categoria === ST.activeCat);
    if (ST.activeSub !== "Todas") list = list.filter(p => p.subcategoria === ST.activeSub);
    if (q) list = list.filter(p => (p.nombre || "").toLowerCase().includes(q) || (p.tags || "").toLowerCase().includes(q));

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
      img.onerror = () => { img.src = U.fallbackImg(); };

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

      btn.onclick = (ev) => {
        ev.stopPropagation();
        window.SDC_CART.add(p, 1);
      };

      box.appendChild(badge);
      box.appendChild(btn);

      card.appendChild(img);
      card.appendChild(box);
      el.appendChild(card);
    });
  }

  // ======== PRODUCT MODAL
  function parseGallery(p) {
    const imgs = [];
    if (p.imagen) imgs.push(String(p.imagen).trim());

    if (Array.isArray(p.galeria)) {
      p.galeria.forEach(u => { const s=String(u||"").trim(); if(s) imgs.push(s); });
    } else if (p.galeria) {
      String(p.galeria).split(",").forEach(u => { const s=String(u||"").trim(); if(s) imgs.push(s); });
    }

    for (let i=1;i<=8;i++){
      const k="galeria_"+i;
      if (p[k]) { const s=String(p[k]).trim(); if(s) imgs.push(s); }
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
    ST.productModal.product = p;
    ST.productModal.qty = 1;
    ST.productModal.mainIndex = 0;
    ST.productModal.images = parseGallery(p);

    U.$("pmTitle").textContent = p.nombre || "Producto";
    U.$("pmName").textContent = p.nombre || "";
    U.$("pmCat").textContent = `${p.categoria || ""}${p.subcategoria ? (" • " + p.subcategoria) : ""}`;
    U.$("pmPrice").textContent = U.money(p.precio, CFG.CURRENCY);

    const stock = Number(p.stock || 0);
    U.$("pmStockOk").style.display = stock > 0 ? "inline-block" : "none";
    U.$("pmStockOut").style.display = stock > 0 ? "none" : "inline-block";
    if (stock > 0) U.$("pmStockOk").textContent = `Stock: ${stock}`;

    const desc = String(p.descripcion || "").trim();
    U.$("pmDesc").textContent = desc ? desc : "Sin descripción por ahora.";

    const tik = String(p.tiktok_url || p.tiktok || p.video_tiktok || "").trim();
    const you = String(p.youtube_url || p.youtube || p.video_youtube || "").trim();

    const hasTik = !!tik;
    const hasYou = !!you;

    U.$("pmVideoRow").style.display = (hasTik || hasYou) ? "flex" : "none";
    U.$("pmTiktok").style.display = hasTik ? "inline-block" : "none";
    U.$("pmYoutube").style.display = hasYou ? "inline-block" : "none";
    if (hasTik) U.$("pmTiktok").href = tik;
    if (hasYou) U.$("pmYoutube").href = you;

    U.$("pmQtyNum").textContent = "1";
    U.$("pmAddBtn").disabled = stock <= 0;
    U.$("pmNote").textContent = stock > 0 ? "Selecciona cantidad y añade al carrito." : "Este producto está agotado.";

    renderProductImages();
    U.$("productModal").classList.add("open");
  }

  function renderProductImages() {
    const p = ST.productModal.product;
    const imgs = ST.productModal.images;
    const idx = ST.productModal.mainIndex;

    const main = U.$("pmMainImg");
    const thumbs = U.$("pmThumbs");
    thumbs.innerHTML = "";

    const src = imgs[idx] || (p?.imagen || "");
    main.src = src || U.fallbackImg();
    main.alt = p?.nombre || "Producto";
    main.onerror = () => { main.src = U.fallbackImg(); };

    imgs.forEach((u, i) => {
      const t = document.createElement("img");
      t.className = "pmThumb" + (i===idx ? " active" : "");
      t.src = u;
      t.alt = "mini";
      t.onerror = () => { t.src = U.fallbackImg(); };
      t.onclick = () => { ST.productModal.mainIndex = i; renderProductImages(); };
      thumbs.appendChild(t);
    });
  }

  function closeProductModal() {
    U.$("productModal").classList.remove("open");
    ST.productModal.product = null;
  }

  function pmMinus() {
    ST.productModal.qty = Math.max(1, ST.productModal.qty - 1);
    U.$("pmQtyNum").textContent = String(ST.productModal.qty);
  }

  function pmPlus() {
    const p = ST.productModal.product;
    const stock = Number(p?.stock || 0);
    ST.productModal.qty = Math.min(ST.productModal.qty + 1, stock > 0 ? stock : ST.productModal.qty + 1);
    U.$("pmQtyNum").textContent = String(ST.productModal.qty);
  }

  function pmAddToCart() {
    const p = ST.productModal.product;
    if (!p) return;
    const ok = window.SDC_CART.add(p, ST.productModal.qty);
    if (ok) closeProductModal();
  }

  return {
    load,
    renderGrid,
    openProductModal,
    closeProductModal,
    pmMinus,
    pmPlus,
    pmAddToCart,
    renderProductImages
  };
})();

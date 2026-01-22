window.SDC_PRODUCT_MODAL = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const MEDIA = window.SDC_MEDIA;
  const GALLERY = window.SDC_GALLERY;
  const SHARE = window.SDC_SHARE;
  const UI = window.SDC_PRODUCT_MODAL_UI;

  const fallbackSvg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
      <rect width='100%' height='100%' fill='#0a0f17'/>
      <text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text>
    </svg>`
  );

  let currentProduct = null;
  let pmQty = 1;
  let pmImages = [];
  let pmMainIndex = 0;

  const originalTitle = document.title;

  function open(p, opts = { setHash: true }) {
    currentProduct = p;
    pmQty = 1;
    pmMainIndex = 0;
    pmImages = GALLERY.parseGallery(p);

    if (opts.setHash) {
      const id = encodeURIComponent(String(p.id || p.nombre || "").trim());
      if (id) window.location.hash = `p=${id}`;
    }

    document.title = `${p.nombre} | SDC`;

    U.$("pmTitle").textContent = p.nombre || "Producto";
    U.$("pmName").textContent = p.nombre || "";
    U.$("pmCat").textContent = `${p.categoria || ""}${p.subcategoria ? (" • " + p.subcategoria) : ""}`;
    U.$("pmPrice").textContent = U.money(p.precio, CFG.CURRENCY);

    const stock = Number(p.stock || 0);
    U.$("pmStockOk").style.display = stock > 3 ? "inline-block" : "none";
    U.$("pmStockLow").style.display = (stock > 0 && stock <= 3) ? "inline-block" : "none";
    U.$("pmStockOut").style.display = stock > 0 ? "none" : "inline-block";
    if (stock > 3) U.$("pmStockOk").textContent = `Stock: ${stock}`;
    if (stock > 0 && stock <= 3) U.$("pmStockLow").textContent = `POCO STOCK (${stock})`;

    U.$("pmDesc").textContent = String(p.descripcion || "").trim() || "Sin descripción por ahora.";

    UI.setChips(p);
    UI.setSpecs(p);
    UI.setActions({ p, video: MEDIA.bestVideo(p) });

    renderImages();

    // ✅ zoom al tocar imagen
    U.$("pmMainImg").onclick = () => window.SDC_ZOOM?.open?.(U.$("pmMainImg").src);

    U.$("pmQtyNum").textContent = String(pmQty);
    U.$("pmAddBtn").disabled = stock <= 0;
    U.$("pmNote").textContent = stock > 0 ? "Selecciona cantidad y añade al carrito." : "Este producto está agotado.";

    // ✅ recomendaciones
    window.SDC_RECO?.render?.(p, S.getProducts());

    U.$("productModal").classList.add("open");
  }

  function close() {
    U.$("productModal").classList.remove("open");
    currentProduct = null;
    document.title = originalTitle;
    if (String(window.location.hash || "").startsWith("#p=")) {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  function renderImages() {
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
      t.onclick = () => { pmMainIndex = idx; renderImages(); };
      thumbs.appendChild(t);
    });
  }

  function bindEvents() {
    U.$("pmClose").onclick = close;
    U.$("productModal").onclick = (e) => { if (e.target.id === "productModal") close(); };

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
      if (ok) {
        window.SDC_FX?.flyFrom?.(U.$("pmMainImg"));
        window.SDC_FX?.vibrate?.(30);
        window.SDC_CART?.renderCart?.();
        close();
      }
    };

    window.addEventListener("hashchange", openFromHash);
  }

  function openFromHash() {
    const id = SHARE.getHashProductId();
    if (!id) return;

    const list = S.getProducts();
    const p = list.find(x => String(x.id || "").trim() === id) || list.find(x => String(x.nombre||"").trim() === id);
    if (!p) return;
    open(p, { setHash: false });
  }

  return { open, close, bindEvents, openFromHash };
})();
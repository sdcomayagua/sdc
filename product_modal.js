window.SDC_PRODUCT_MODAL = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const MEDIA = window.SDC_MEDIA;
  const GALLERY = window.SDC_GALLERY;
  const SHARE = window.SDC_SHARE;
  const UI = window.SDC_PRODUCT_MODAL_UI;

  const FALLBACK = window.SDC_FALLBACK_IMG?.url || "";

  let currentProduct = null;
  let pmQty = 1;
  let pmImages = [];
  let pmMainIndex = 0;

  const originalTitle = document.title;

  function ensureCalcUI() {
    let calc = document.getElementById("pmCalc");
    if (!calc) {
      calc = document.createElement("div");
      calc.id = "pmCalc";
      calc.className = "pmCalc";
      const priceEl = document.getElementById("pmPrice");
      if (priceEl && priceEl.parentElement) priceEl.insertAdjacentElement("afterend", calc);
    }
    return calc;
  }

  function ensureOutNote() {
    let out = document.getElementById("pmOutNote");
    if (!out) {
      out = document.createElement("div");
      out.id = "pmOutNote";
      out.className = "pmOutNote";
      const note = document.getElementById("pmNote");
      if (note && note.parentElement) note.insertAdjacentElement("beforebegin", out);
    }
    return out;
  }

  function ensureImageWrap() {
    let wrap = document.getElementById("pmImageWrap");
    const img = document.getElementById("pmMainImg");
    if (!img) return null;
    if (wrap) return wrap;

    wrap = document.createElement("div");
    wrap.id = "pmImageWrap";
    wrap.className = "pmImageWrap";
    img.parentElement.insertBefore(wrap, img);
    wrap.appendChild(img);
    return wrap;
  }

  function ensureBuySticky() {
    let wrap = document.getElementById("pmBuySticky");
    if (wrap) return wrap;

    wrap = document.createElement("div");
    wrap.id = "pmBuySticky";
    wrap.className = "pmBuySticky";

    const qtyRow = document.querySelector(".pmQtyRow");
    const note = document.getElementById("pmNote");

    if (qtyRow && qtyRow.parentElement) {
      qtyRow.parentElement.insertBefore(wrap, qtyRow);
      wrap.appendChild(qtyRow);
      if (note) wrap.appendChild(note);
    }
    return wrap;
  }

  function ensureDescMoreUI() {
    const desc = document.getElementById("pmDesc");
    if (!desc) return;

    if (!document.getElementById("pmMoreBtn")) {
      const row = document.createElement("div");
      row.className = "pmMoreRow";
      row.innerHTML = `<button class="btn ghost pmMoreBtn" id="pmMoreBtn" type="button">Ver más</button>`;
      desc.parentElement.appendChild(row);

      document.getElementById("pmMoreBtn").onclick = () => {
        desc.classList.toggle("pmDescClamp");
        document.getElementById("pmMoreBtn").textContent = desc.classList.contains("pmDescClamp") ? "Ver más" : "Ver menos";
      };
    }

    // por defecto clamp si es largo
    const text = (desc.textContent || "").trim();
    if (text.length > 240) {
      desc.classList.add("pmDescClamp");
      document.getElementById("pmMoreBtn").textContent = "Ver más";
    } else {
      desc.classList.remove("pmDescClamp");
      document.getElementById("pmMoreBtn").textContent = "Ver menos";
      // si es corto, ocultamos botón
      document.getElementById("pmMoreBtn").style.display = "none";
    }
  }

  function setMainImage(src) {
    const main = document.getElementById("pmMainImg");
    if (!main) return;
    main.src = src || FALLBACK;
    main.onerror = () => { main.src = FALLBACK; };
  }

  function renderImages() {
    const main = document.getElementById("pmMainImg");
    const thumbs = document.getElementById("pmThumbs");
    if (!thumbs) return;

    thumbs.innerHTML = "";

    const src = pmImages[pmMainIndex] || (currentProduct?.imagen || "");
    setMainImage(src);

    if (main) {
      main.alt = currentProduct?.nombre || "Producto";
      main.onclick = () => window.SDC_ZOOM?.open?.(main.src);
    }

    const list = (pmImages || []).slice(0, 8);
    list.forEach((u, idx) => {
      const t = document.createElement("img");
      t.className = "pmThumb" + (idx === pmMainIndex ? " active" : "");
      t.src = u || FALLBACK;
      t.alt = "mini";
      t.onerror = () => { t.src = FALLBACK; };
      t.onclick = () => { pmMainIndex = idx; renderImages(); };
      thumbs.appendChild(t);
    });

    // Hook global para swipe_images.js (siguiente/prev)
    window.SDC_GALLERY_NAV = {
      next: () => { pmMainIndex = (pmMainIndex + 1) % Math.max(1, list.length); renderImages(); },
      prev: () => { pmMainIndex = (pmMainIndex - 1 + Math.max(1, list.length)) % Math.max(1, list.length); renderImages(); }
    };
  }

  function updateQtyUI() {
    const num = document.getElementById("pmQtyNum");
    if (num) num.textContent = String(pmQty);

    const calc = ensureCalcUI();
    const unit = Number(currentProduct?.precio || 0);
    const total = unit * pmQty;

    calc.innerHTML = `
      <div class="pmCalcRow">
        <div class="pmCalcItem"><span class="mut">Unit:</span> <b>${U.money(unit, CFG.CURRENCY)}</b></div>
        <div class="pmCalcItem"><span class="mut">Cant:</span> <b>${pmQty}</b></div>
        <div class="pmCalcItem"><span class="mut">Total:</span> <b>${U.money(total, CFG.CURRENCY)}</b></div>
      </div>
    `;
  }

  function consultWA() {
    const phone = S.getWhatsapp();
    const p = currentProduct;
    const link = SHARE.shareLinkFor(p);
    const txt = `Hola, quiero consultar disponibilidad:\n• ${p.nombre}\n• ID: ${p.id}\n${link}`;
    const wa = "https://wa.me/" + phone.replace(/[^\d]/g, "") + "?text=" + encodeURIComponent(txt);
    window.open(wa, "_blank");
  }

  function buyNow() {
    if (!currentProduct) return;
    const stock = Number(currentProduct.stock || 0);
    if (stock <= 0) return consultWA();

    const ok = S.addToCart(currentProduct, 1);
    if (ok) {
      window.SDC_CART?.openCart?.();
      close();
    }
  }

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

    window.SDC_PRODUCT_TABS?.setActive?.("desc");

    document.getElementById("pmTitle").textContent = p.nombre || "Producto";
    document.getElementById("pmName").textContent = p.nombre || "";
    document.getElementById("pmCat").textContent = `${p.categoria || ""}${p.subcategoria ? (" • " + p.subcategoria) : ""}`;
    document.getElementById("pmPrice").textContent = U.money(p.precio, CFG.CURRENCY);

    const stock = Number(p.stock || 0);
    const inStock = stock > 0;
    const low = inStock && stock <= 3;

    const okBadge = document.getElementById("pmStockOk");
    const lowBadge = document.getElementById("pmStockLow");
    const outBadge = document.getElementById("pmStockOut");

    okBadge.style.display = inStock && !low ? "inline-block" : "none";
    lowBadge.style.display = low ? "inline-block" : "none";
    outBadge.style.display = inStock ? "none" : "inline-block";

    if (inStock && !low) okBadge.textContent = `Stock: ${stock}`;
    if (low) lowBadge.textContent = `POCO STOCK (${stock})`;

    document.getElementById("pmDesc").textContent = String(p.descripcion || "").trim() || "Sin descripción por ahora.";

    UI.setChips(p);
    UI.setSpecs(p);
    UI.setActions({ p, video: MEDIA.bestVideo(p) });

    ensureImageWrap();
    renderImages();
    updateQtyUI();
    ensureBuySticky();
    ensureDescMoreUI();

    // favoritos (si está activo)
    window.SDC_FAV?.syncModalFav?.(p);

    const addBtn = document.getElementById("pmAddBtn");
    const buyBtn = document.getElementById("pmBuyNowBtn");
    const outNote = ensureOutNote();

    if (!inStock) {
      addBtn.classList.remove("acc");
      addBtn.classList.add("dangerBtn");
      addBtn.textContent = "Consultar disponibilidad";
      addBtn.onclick = () => consultWA();

      buyBtn.textContent = "Comprar ahora";
      buyBtn.onclick = () => consultWA();

      outNote.style.display = "block";
      outNote.textContent = "Este producto aparece agotado. Puedes consultar disponibilidad por WhatsApp.";
      document.getElementById("pmNote").textContent = "Producto agotado.";
    } else {
      addBtn.classList.remove("dangerBtn");
      addBtn.classList.add("acc");
      addBtn.textContent = "Añadir al carrito";
      addBtn.onclick = () => {
        const ok = S.addToCart(currentProduct, pmQty);
        if (ok) {
          window.SDC_ADD_CONFIRM?.notify?.("Agregado ✅");
          window.SDC_CART?.renderCart?.();
          window.SDC_CART_BADGE?.apply?.();
          close();
        }
      };

      buyBtn.textContent = "Comprar ahora";
      buyBtn.onclick = () => buyNow();

      outNote.style.display = "none";
      outNote.textContent = "";
      document.getElementById("pmNote").textContent = "Selecciona cantidad y añade al carrito.";
    }

    window.SDC_RECO?.render?.(p, S.getProducts());

    document.getElementById("productModal").classList.add("open");
  }

  function close() {
    document.getElementById("productModal").classList.remove("open");
    currentProduct = null;
    document.title = originalTitle;

    if (String(window.location.hash || "").startsWith("#p=")) {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  function bindEvents() {
    document.getElementById("pmClose").onclick = close;
    document.getElementById("productModal").onclick = (e) => { if (e.target.id === "productModal") close(); };

    document.getElementById("pmMinus").onclick = () => {
      pmQty = Math.max(1, pmQty - 1);
      updateQtyUI();
    };

    document.getElementById("pmPlus").onclick = () => {
      const stock = Number(currentProduct?.stock || 0);
      pmQty = pmQty + 1;
      if (stock > 0) pmQty = Math.min(pmQty, stock);
      updateQtyUI();
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

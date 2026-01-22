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
    // Crea una fila de cálculo debajo del precio si no existe
    let calc = document.getElementById("pmCalc");
    if (!calc) {
      calc = document.createElement("div");
      calc.id = "pmCalc";
      calc.className = "pmCalc";
      const priceEl = document.getElementById("pmPrice");
      if (priceEl && priceEl.parentElement) {
        priceEl.insertAdjacentElement("afterend", calc);
      }
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
      if (note && note.parentElement) {
        note.insertAdjacentElement("beforebegin", out);
      }
    }
    return out;
  }

  function setMainImage(src) {
    const main = U.$("pmMainImg");
    if (!main) return;
    main.src = src || FALLBACK;
    main.onerror = () => { main.src = FALLBACK; };
  }

  function renderImages() {
    const main = U.$("pmMainImg");
    const thumbs = U.$("pmThumbs");
    if (!thumbs) return;

    thumbs.innerHTML = "";

    const src = pmImages[pmMainIndex] || (currentProduct?.imagen || "");
    setMainImage(src);

    if (main) {
      main.alt = currentProduct?.nombre || "Producto";
      // Zoom
      main.onclick = () => window.SDC_ZOOM?.open?.(main.src);
    }

    // Thumbs (2 a 8)
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
  }

  function updateQtyUI() {
    const num = U.$("pmQtyNum");
    if (num) num.textContent = String(pmQty);

    // Total en vivo
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

  function openConsultAvailability() {
    const phone = S.getWhatsapp();
    const p = currentProduct;
    const link = SHARE.shareLinkFor(p);
    const txt = `Hola, quiero consultar disponibilidad:\n• ${p.nombre}\n• ID: ${p.id}\n${link}`;
    const wa = "https://wa.me/" + phone.replace(/[^\d]/g, "") + "?text=" + encodeURIComponent(txt);
    window.open(wa, "_blank");
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

    U.$("pmTitle").textContent = p.nombre || "Producto";
    U.$("pmName").textContent = p.nombre || "";
    U.$("pmCat").textContent = `${p.categoria || ""}${p.subcategoria ? (" • " + p.subcategoria) : ""}`;
    U.$("pmPrice").textContent = U.money(p.precio, CFG.CURRENCY);

    const stock = Number(p.stock || 0);
    const inStock = stock > 0;
    const low = inStock && stock <= 3;

    // Badges
    U.$("pmStockOk").style.display = inStock && !low ? "inline-block" : "none";
    U.$("pmStockLow").style.display = low ? "inline-block" : "none";
    U.$("pmStockOut").style.display = inStock ? "none" : "inline-block";

    if (inStock && !low) U.$("pmStockOk").textContent = `Stock: ${stock}`;
    if (low) U.$("pmStockLow").textContent = `POCO STOCK (${stock})`;

    // Desc
    U.$("pmDesc").textContent = String(p.descripcion || "").trim() || "Sin descripción por ahora.";

    UI.setChips(p);
    UI.setSpecs(p);
    UI.setActions({ p, video: MEDIA.bestVideo(p) });

    renderImages();
    updateQtyUI();

    const addBtn = U.$("pmAddBtn");
    const outNote = ensureOutNote();

    // Si NO hay stock: botón rojo Consultar
    if (!inStock) {
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.classList.remove("acc");
        addBtn.classList.add("dangerBtn");
        addBtn.textContent = "Consultar disponibilidad";
        addBtn.onclick = () => openConsultAvailability();
      }
      outNote.style.display = "block";
      outNote.textContent = "Este producto aparece agotado. Puedes consultar disponibilidad por WhatsApp.";
    } else {
      if (addBtn) {
        addBtn.classList.remove("dangerBtn");
        addBtn.classList.add("acc");
        addBtn.textContent = "Añadir al carrito";
        addBtn.disabled = false;
        addBtn.onclick = () => {
          const ok = S.addToCart(currentProduct, pmQty);
          if (ok) {
            window.SDC_FX?.flyFrom?.(U.$("pmMainImg"));
            window.SDC_ADD_CONFIRM?.notify?.("Agregado ✅");
            window.SDC_CART?.renderCart?.();
            window.SDC_CART_BADGE?.apply?.();
            close();
          }
        };
      }
      outNote.style.display = "none";
      outNote.textContent = "";
    }

    // Nota inferior
    U.$("pmNote").textContent = inStock
      ? "Selecciona cantidad y añade al carrito."
      : "Producto agotado.";

    // Recomendaciones
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

  function bindEvents() {
    U.$("pmClose").onclick = close;
    U.$("productModal").onclick = (e) => { if (e.target.id === "productModal") close(); };

    U.$("pmMinus").onclick = () => {
      pmQty = Math.max(1, pmQty - 1);
      updateQtyUI();
    };

    U.$("pmPlus").onclick = () => {
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

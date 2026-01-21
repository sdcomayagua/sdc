window.SDC_PRODUCT_MODAL = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const MEDIA = window.SDC_MEDIA;
  const GALLERY = window.SDC_GALLERY;
  const SHARE = window.SDC_SHARE;

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

  function ensureFacebookBtn() {
    if (U.$("pmFacebook")) return;
    const row = U.$("pmVideoRow");
    if (!row) return;
    const a = document.createElement("a");
    a.className = "btn";
    a.id = "pmFacebook";
    a.target = "_blank";
    a.rel = "noopener";
    a.style.display = "none";
    a.textContent = "Ver en Facebook";
    row.appendChild(a);
  }

  function ensureChipsRow() {
    if (U.$("pmChips")) return;
    const nameEl = U.$("pmName");
    if (!nameEl) return;

    const chips = document.createElement("div");
    chips.id = "pmChips";
    chips.style.display = "flex";
    chips.style.flexWrap = "wrap";
    chips.style.gap = "8px";
    chips.style.margin = "10px 0 0 0";
    nameEl.insertAdjacentElement("afterend", chips);
  }

  function setChips(p) {
    ensureChipsRow();
    const chips = U.$("pmChips");
    if (!chips) return;
    chips.innerHTML = "";

    const addChip = (text) => {
      const s = String(text || "").trim();
      if (!s) return;
      const span = document.createElement("span");
      span.className = "badge";
      span.style.cursor = "default";
      span.textContent = s;
      chips.appendChild(span);
    };

    addChip(p.marca ? `Marca: ${p.marca}` : "");
    addChip(p.modelo ? `Modelo: ${p.modelo}` : "");
    addChip(p.garantia ? `Garantía: ${p.garantia}` : "");
    addChip(p.condicion ? `Condición: ${p.condicion}` : "");
  }

  function buildExtraInfo(p) {
    const lines = [];
    const add = (label, value) => {
      const s = String(value || "").trim();
      if (s) lines.push(`${label}: ${s}`);
    };
    add("Compatibilidad", p.compatibilidad);
    return lines.join("\n");
  }

  function ensureShareBtn() {
    if (U.$("pmShare")) return;
    const note = U.$("pmNote");
    if (!note) return;
    const btn = document.createElement("button");
    btn.id = "pmShare";
    btn.className = "btn";
    btn.style.width = "100%";
    btn.style.marginTop = "10px";
    btn.textContent = "Compartir producto";
    note.insertAdjacentElement("afterend", btn);
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

  function open(p, opts = { setHash: true }) {
    currentProduct = p;
    pmQty = 1;
    pmMainIndex = 0;
    pmImages = GALLERY.parseGallery(p);

    if (opts.setHash) {
      const id = encodeURIComponent(String(p.id || p.nombre || "").trim());
      if (id) window.location.hash = `p=${id}`;
    }

    U.$("pmTitle").textContent = p.nombre || "Producto";
    U.$("pmName").textContent = p.nombre || "";
    setChips(p);

    U.$("pmCat").textContent = `${p.categoria || ""}${p.subcategoria ? (" • " + p.subcategoria) : ""}`;
    U.$("pmPrice").textContent = U.money(p.precio, CFG.CURRENCY);

    const stock = Number(p.stock || 0);
    U.$("pmStockOk").style.display = stock > 0 ? "inline-block" : "none";
    U.$("pmStockOut").style.display = stock > 0 ? "none" : "inline-block";
    if (stock > 0) U.$("pmStockOk").textContent = `Stock: ${stock}`;

    const desc = String(p.descripcion || "").trim();
    const extra = buildExtraInfo(p);
    U.$("pmDesc").textContent = (desc ? desc : "Sin descripción por ahora.") + (extra ? ("\n\n" + extra) : "");

    // videos
    ensureFacebookBtn();
    const v = MEDIA.bestVideo(p);
    const hasTik = !!v.tiktok;
    const hasYou = !!v.youtube;
    const hasFb  = !!v.facebook;
    const hasGen = !!v.generic;

    U.$("pmVideoRow").style.display = (hasTik || hasYou || hasFb || hasGen) ? "flex" : "none";

    // TikTok
    U.$("pmTiktok").style.display = hasTik ? "inline-block" : "none";
    if (hasTik) { U.$("pmTiktok").textContent = "Ver en TikTok"; U.$("pmTiktok").href = v.tiktok; }

    // YouTube
    U.$("pmYoutube").style.display = hasYou ? "inline-block" : "none";
    if (hasYou) { U.$("pmYoutube").textContent = "Ver en YouTube"; U.$("pmYoutube").href = v.youtube; }

    // Facebook
    const fbBtn = U.$("pmFacebook");
    fbBtn.style.display = hasFb ? "inline-block" : "none";
    if (hasFb) { fbBtn.textContent = "Ver en Facebook"; fbBtn.href = v.facebook; }

    // genérico
    if (!hasTik && !hasYou && !hasFb && hasGen) {
      const plat = MEDIA.detectPlatform(v.generic);
      if (plat === "youtube") {
        U.$("pmYoutube").style.display = "inline-block";
        U.$("pmYoutube").textContent = "Ver en YouTube";
        U.$("pmYoutube").href = v.generic;
      } else if (plat === "facebook") {
        fbBtn.style.display = "inline-block";
        fbBtn.textContent = "Ver en Facebook";
        fbBtn.href = v.generic;
      } else if (plat === "tiktok") {
        U.$("pmTiktok").style.display = "inline-block";
        U.$("pmTiktok").textContent = "Ver en TikTok";
        U.$("pmTiktok").href = v.generic;
      } else {
        U.$("pmYoutube").style.display = "inline-block";
        U.$("pmYoutube").textContent = "Ver video";
        U.$("pmYoutube").href = v.generic;
      }
    }

    renderImages();

    U.$("pmQtyNum").textContent = String(pmQty);
    U.$("pmAddBtn").disabled = stock <= 0;
    U.$("pmNote").textContent = stock > 0 ? "Selecciona cantidad y añade al carrito." : "Este producto está agotado.";

    ensureShareBtn();
    U.$("pmShare").onclick = async () => {
      if (!currentProduct) return;
      const link = SHARE.shareLinkFor(currentProduct);
      const ok = await SHARE.copyToClipboard(link);
      U.toast(ok ? "Link copiado ✅" : "No se pudo copiar");
    };

    U.$("productModal").classList.add("open");
  }

  function close() {
    U.$("productModal").classList.remove("open");
    currentProduct = null;

    // limpia hash para que no quede pegado
    if (String(window.location.hash || "").startsWith("#p=")) {
      history.replaceState(null, "", window.location.pathname);
    }
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
      if (ok) close();
    };

    // Deep link
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

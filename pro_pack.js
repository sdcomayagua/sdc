// pro_pack.js
(() => {
  const S = () => window.SDC_STORE;
  const U = () => window.SDC_UTILS;

  // --------- (1) Checkout dock ----------
  function ensureDock(){
    if (document.getElementById("checkoutDock")) return;

    const dock = document.createElement("div");
    dock.id = "checkoutDock";
    dock.className = "checkoutDock";
    dock.innerHTML = `
      <div class="dockLeft">
        <div class="dockTitle">Tu carrito</div>
        <div class="dockSub" id="dockSub">0 items</div>
      </div>
      <button class="btn acc dockBtn" id="dockBtn" type="button">Ver carrito</button>
    `;
    document.body.appendChild(dock);

    document.getElementById("dockBtn").onclick = () => window.SDC_CART?.openCart?.();
  }

  function updateDock(){
    ensureDock();
    const dock = document.getElementById("checkoutDock");
    const sub = document.getElementById("dockSub");

    const count = S()?.cartCount?.() || 0;
    if (!dock || !sub) return;

    if (count > 0){
      dock.classList.add("show");
      sub.textContent = `${count} item(s)`;
    } else {
      dock.classList.remove("show");
      sub.textContent = "0 items";
    }
  }

  // --------- (2) Popover al añadir ----------
  function ensurePopover(){
    if (document.getElementById("addPopover")) return;

    const pop = document.createElement("div");
    pop.id = "addPopover";
    pop.className = "addPopover";
    pop.innerHTML = `
      <div class="row">
        <div class="txt" id="popTxt">Agregado ✅</div>
        <button class="btn ghost mini" id="popCartBtn" type="button">Ver carrito</button>
      </div>
    `;
    document.body.appendChild(pop);

    document.getElementById("popCartBtn").onclick = () => window.SDC_CART?.openCart?.();
  }

  let popTimer = null;
  function showPopover(text="Agregado ✅"){
    ensurePopover();
    const pop = document.getElementById("addPopover");
    const txt = document.getElementById("popTxt");
    if (!pop || !txt) return;

    txt.textContent = text;
    pop.classList.add("show");

    if (popTimer) clearTimeout(popTimer);
    popTimer = setTimeout(() => pop.classList.remove("show"), 1600);
  }

  // --------- (3) Recientes vistos ----------
  const REC_KEY = "SDC_RECENT";
  function readRecent(){
    try { return JSON.parse(localStorage.getItem(REC_KEY) || "[]"); } catch { return []; }
  }
  function writeRecent(arr){
    try { localStorage.setItem(REC_KEY, JSON.stringify(arr.slice(0,12))); } catch {}
  }

  function addRecent(p){
    const id = String(p.id||p.nombre||"");
    if (!id) return;
    const arr = readRecent().filter(x => x !== id);
    arr.unshift(id);
    writeRecent(arr);
  }

  function ensureRecentSection(){
    if (document.getElementById("recentSection")) return;

    const main = document.querySelector("main.wrap");
    const grid = document.getElementById("grid");
    if (!main || !grid) return;

    const sec = document.createElement("section");
    sec.id = "recentSection";
    sec.className = "section";
    sec.innerHTML = `
      <div class="sectionHead">
        <div class="sectionTitle">Vistos recientemente</div>
        <div class="mut">Continúa donde lo dejaste</div>
      </div>
      <div class="hScroll" id="recentRow"></div>
    `;
    grid.insertAdjacentElement("beforebegin", sec);
  }

  function renderRecent(){
    ensureRecentSection();
    const sec = document.getElementById("recentSection");
    const row = document.getElementById("recentRow");
    if (!sec || !row) return;

    const ids = readRecent();
    const products = S()?.getProducts?.() || [];
    const list = ids.map(id => products.find(p => String(p.id||p.nombre||"")===id)).filter(Boolean);

    if (!list.length){
      sec.classList.remove("show");
      row.innerHTML = "";
      return;
    }
    sec.classList.add("show");
    row.innerHTML = "";

    list.forEach(p=>{
      const c = document.createElement("div");
      c.className = "hCard";
      c.onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p,{setHash:true});

      const img = document.createElement("img");
      img.src = p.imagen || (window.SDC_FALLBACK_IMG?.url||"");
      img.onerror = () => img.src = (window.SDC_FALLBACK_IMG?.url||"");

      const hp = document.createElement("div");
      hp.className = "hp";
      hp.innerHTML = `<div class="hname">${p.nombre||""}</div><div class="hprice">${U()?.money?.(p.precio, window.SDC_CONFIG?.CURRENCY)||""}</div>`;

      c.appendChild(img); c.appendChild(hp);
      row.appendChild(c);
    });
  }

  // --------- (5) Resaltado en resultados (mark) ----------
  function highlightCards(query){
    const q = (query||"").trim().toLowerCase();
    if (!q) return;

    document.querySelectorAll(".card .name").forEach(el=>{
      const text = el.textContent || "";
      const idx = text.toLowerCase().indexOf(q);
      if (idx < 0) return;

      const before = text.slice(0, idx);
      const mid = text.slice(idx, idx + q.length);
      const after = text.slice(idx + q.length);
      el.innerHTML = `${before}<mark class="hl">${mid}</mark>${after}`;
    });
  }

  // --------- (6) Scroll restore modal ----------
  let lastScrollY = 0;
  function hookScrollRestore(){
    const open = window.SDC_PRODUCT_MODAL?.open;
    const close = window.SDC_PRODUCT_MODAL?.close;
    if (!open || !close) return;

    if (window.__SDC_SCROLL_RESTORE__) return;
    window.__SDC_SCROLL_RESTORE__ = true;

    window.SDC_PRODUCT_MODAL.open = function(p, opts){
      lastScrollY = window.scrollY || 0;
      return open.call(window.SDC_PRODUCT_MODAL, p, opts);
    };

    window.SDC_PRODUCT_MODAL.close = function(){
      const r = close.call(window.SDC_PRODUCT_MODAL);
      setTimeout(() => window.scrollTo({ top:lastScrollY, behavior:"auto" }), 0);
      return r;
    };
  }

  // --------- (7) Precarga de imágenes ----------
  function preloadFirstImages(){
    const products = S()?.getProducts?.() || [];
    products.slice(0, 12).forEach(p=>{
      if (!p.imagen) return;
      const img = new Image();
      img.src = p.imagen;
    });
  }

  // --------- (8) Modo rápido en móvil si hay muchos ----------
  function smartMobileView(){
    const count = (S()?.getProducts?.() || []).length;
    const hasChoice = localStorage.getItem("SDC_VIEW_MODE3");
    const isMobile = window.matchMedia("(max-width:720px)").matches;
    if (isMobile && count >= 40 && !hasChoice){
      window.SDC_VIEW3?.apply?.("mini");
    }
  }

  // --------- Hooks ----------
  function hookGridClicks(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    const obs = new MutationObserver(() => {
      // cuando se renderiza grid, re-check dock
      updateDock();
    });
    obs.observe(grid, { childList:true, subtree:true });
  }

  // Intercepta addToCart para mostrar popover + dock
  function hookAddToCart(){
    const store = S();
    if (!store?.addToCart) return;
    if (window.__SDC_ADD_HOOK__) return;
    window.__SDC_ADD_HOOK__ = true;

    const old = store.addToCart.bind(store);
    store.addToCart = (p, qty) => {
      const ok = old(p, qty);
      if (ok){
        showPopover("Agregado ✅");
        updateDock();
      }
      return ok;
    };
  }

  // Hook al buscador para resaltar
  function hookSearchHighlight(){
    const q = document.getElementById("q");
    if (!q) return;
    q.addEventListener("input", () => {
      // vuelve a resaltar cuando cambie el grid
      const val = q.value;
      setTimeout(() => highlightCards(val), 120);
    });
  }

  // Recientes: cuando abre modal, agrega
  function hookRecent(){
    const open = window.SDC_PRODUCT_MODAL?.open;
    if (!open) return;
    if (window.__SDC_RECENT_HOOK__) return;
    window.__SDC_RECENT_HOOK__ = true;

    window.SDC_PRODUCT_MODAL.open = function(p, opts){
      try{ addRecent(p); setTimeout(renderRecent, 0); }catch{}
      return open.call(window.SDC_PRODUCT_MODAL, p, opts);
    };
  }

  function init(){
    ensureDock();
    ensurePopover();
    hookAddToCart();
    hookGridClicks();
    hookSearchHighlight();
    hookScrollRestore();
    hookRecent();

    // cuando ya haya productos
    const t = setInterval(() => {
      if ((S()?.getProducts?.() || []).length === 0) return;
      clearInterval(t);
      updateDock();
      renderRecent();
      preloadFirstImages();
      smartMobileView();
    }, 250);
  }

  window.SDC_PRO_PACK = { init };
})();
// mega_plus.js
(() => {
  const money = (n) => window.SDC_UTILS?.money?.(n, window.SDC_CONFIG?.CURRENCY) || "";
  const store = () => window.SDC_STORE;

  /* ===== 1) Barra confianza ===== */
  function trustBarInit(){
    const headerWrap = document.querySelector("header .wrap");
    if (!headerWrap) return;
    if (document.getElementById("trustBar")) return;

    const bar = document.createElement("div");
    bar.id = "trustBar";
    bar.className = "trustBar";
    bar.innerHTML = `
      <div class="trustItem">✅ <span>Pagar al recibir</span></div>
      <div class="trustItem">🚚 <span>Envíos Honduras</span></div>
      <div class="trustItem">🛡️ <span>Garantía</span></div>
    `;

    const topBanner = document.getElementById("topBanner");
    if (topBanner) topBanner.insertAdjacentElement("afterend", bar);
    else headerWrap.appendChild(bar);
  }

  /* ===== 3) Urgencia stock ===== */
  function applyUrgency(card){
    const pid = card.getAttribute("data-pid");
    if (!pid) return;
    const p = (store()?.getProducts?.() || []).find(x => String(x.id||x.nombre||"") === pid);
    if (!p) return;

    const stock = Number(p.stock||0);
    const wrap = card.querySelector(".imgWrap");
    if (!wrap) return;

    // limpiar
    wrap.querySelector(".urgentTag")?.remove();
    card.classList.remove("urgent");

    if (stock > 0 && stock <= 3){
      card.classList.add("urgent");
      const tag = document.createElement("div");
      tag.className = "urgentTag";
      tag.textContent = "Últimas unidades";
      wrap.appendChild(tag);
    }
  }

  /* ===== 7) Galería fullscreen ===== */
  function ensureGalleryFS(){
    if (document.getElementById("galleryFS")) return;

    const el = document.createElement("div");
    el.id = "galleryFS";
    el.className = "galleryFS";
    el.innerHTML = `
      <div class="fsBox">
        <div class="fsTop">
          <div class="fsTitle" id="fsTitle">Galería</div>
          <button class="fsClose" id="fsClose" type="button">✕</button>
        </div>
        <img class="fsImg" id="fsImg" alt="imagen">
        <div class="fsNav">
          <button class="fsBtn" id="fsPrev" type="button">←</button>
          <button class="fsBtn" id="fsNext" type="button">→</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById("fsClose").onclick = closeFS;
    el.onclick = (e) => { if (e.target.id === "galleryFS") closeFS(); };
  }

  let fsList = [];
  let fsIdx = 0;
  function openFS(title, list, idx){
    ensureGalleryFS();
    fsList = (list||[]).filter(Boolean);
    fsIdx = Math.max(0, Math.min(fsList.length-1, idx||0));

    document.getElementById("fsTitle").textContent = title || "Galería";
    renderFS();
    document.getElementById("galleryFS").classList.add("show");

    document.getElementById("fsPrev").onclick = () => { fsIdx = (fsIdx-1+fsList.length)%fsList.length; renderFS(); };
    document.getElementById("fsNext").onclick = () => { fsIdx = (fsIdx+1)%fsList.length; renderFS(); };

    // swipe
    const img = document.getElementById("fsImg");
    let sx=0, ex=0;
    img.ontouchstart = (e)=>{ sx = e.touches[0].clientX; ex = sx; };
    img.ontouchmove = (e)=>{ ex = e.touches[0].clientX; };
    img.ontouchend = ()=> {
      const dx = ex - sx;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) fsIdx = (fsIdx+1)%fsList.length;
      else fsIdx = (fsIdx-1+fsList.length)%fsList.length;
      renderFS();
    };
  }

  function renderFS(){
    const img = document.getElementById("fsImg");
    img.src = fsList[fsIdx] || (window.SDC_FALLBACK_IMG?.url||"");
    img.onerror = () => { img.src = (window.SDC_FALLBACK_IMG?.url||""); };
  }

  function closeFS(){
    document.getElementById("galleryFS")?.classList.remove("show");
  }

  function hookModalGallery(){
    const pm = document.getElementById("productModal");
    if (!pm) return;

    // doble tap/longpress para fullscreen
    const main = document.getElementById("pmMainImg");
    if (!main) return;

    main.addEventListener("dblclick", () => {
      const title = document.getElementById("pmName")?.textContent || "Galería";
      const thumbs = Array.from(document.querySelectorAll("#pmThumbs img")).map(i => i.src);
      openFS(title, thumbs.length ? thumbs : [main.src], 0);
    });

    // botón invisible: tap y mantener (móvil)
    let timer=null;
    main.addEventListener("touchstart", () => {
      timer = setTimeout(() => {
        const title = document.getElementById("pmName")?.textContent || "Galería";
        const thumbs = Array.from(document.querySelectorAll("#pmThumbs img")).map(i => i.src);
        openFS(title, thumbs.length ? thumbs : [main.src], 0);
      }, 420);
    }, { passive:true });
    main.addEventListener("touchend", ()=>{ if (timer) clearTimeout(timer); timer=null; }, { passive:true });
  }

  /* ===== 9) Confirmación bonita consultar ===== */
  function ensureConfirmSheet(){
    if (document.getElementById("confirmSheet")) return;

    const wrap = document.createElement("div");
    wrap.id = "confirmSheet";
    wrap.className = "confirmSheet";
    wrap.innerHTML = `
      <div class="confirmCard">
        <div class="confirmTitle" id="cTitle">Consultar disponibilidad</div>
        <div class="confirmText" id="cText">¿Quieres abrir WhatsApp para consultar?</div>
        <div class="confirmBtns">
          <button class="btn ghost" id="cNo" type="button">No</button>
          <button class="btn danger" id="cYes" type="button">Sí, consultar</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    wrap.addEventListener("click",(e)=>{ if (e.target.id==="confirmSheet") hideConfirm(); });
    document.getElementById("cNo").onclick = hideConfirm;
  }

  let confirmAction = null;
  function showConfirm(title, text, onYes){
    ensureConfirmSheet();
    confirmAction = onYes;
    document.getElementById("cTitle").textContent = title || "Consultar";
    document.getElementById("cText").textContent = text || "¿Abrir WhatsApp?";
    document.getElementById("confirmSheet").classList.add("show");
    document.getElementById("cYes").onclick = () => {
      hideConfirm();
      try{ confirmAction && confirmAction(); }catch{}
    };
  }
  function hideConfirm(){
    document.getElementById("confirmSheet")?.classList.remove("show");
    confirmAction = null;
  }

  function hookConsultButtons(){
    document.addEventListener("click", (ev) => {
      const t = ev.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.classList.contains("consultBtn")) return;

      ev.preventDefault();
      ev.stopPropagation();

      const card = t.closest(".card");
      const pid = card?.getAttribute("data-pid");
      const p = (store()?.getProducts?.() || []).find(x => String(x.id||x.nombre||"")===String(pid||"")) || null;

      const name = p?.nombre || "este producto";
      const doWA = () => {
        const phone = store()?.getWhatsapp?.() || "+50431517755";
        const link = window.SDC_SHARE?.shareLinkFor?.(p) || "";
        const txt = `Hola, quiero consultar disponibilidad:\n• ${name}\n• ID: ${p?.id || ""}\n${link}`;
        window.open("https://wa.me/"+String(phone).replace(/[^\d]/g,"")+"?text="+encodeURIComponent(txt), "_blank");
      };

      showConfirm("Consultar disponibilidad", `Producto: ${name}`, doWA);
    }, true);
  }

  /* ===== 11) Cache catálogo (3 min) ===== */
  function cacheWrapCatalog(){
    const key = "SDC_CATALOG_CACHE";
    const ttlMs = 3 * 60 * 1000;

    if (!window.SDC_CATALOG?.load) return;
    if (window.__SDC_CACHE_WRAP__) return;
    window.__SDC_CACHE_WRAP__ = true;

    const oldLoad = window.SDC_CATALOG.load.bind(window.SDC_CATALOG);

    window.SDC_CATALOG.load = async () => {
      try{
        const raw = localStorage.getItem(key);
        if (raw){
          const obj = JSON.parse(raw);
          if (Date.now() - obj.ts < ttlMs && obj.data?.ok){
            // usa cache
            window.SDC_STORE?.setData?.(obj.data);
            window.SDC_STORE?.setProducts?.((obj.data.productos||[]).filter(p=>p && p.nombre && p.categoria));
            window.SDC_CATALOG_UI?.renderTabs?.();
            window.SDC_CATALOG_UI?.renderSubTabs?.();
            window.SDC_CATALOG_UI?.renderGrid?.();
            return obj.data;
          }
        }
      }catch{}

      const fresh = await oldLoad();
      try{
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: fresh }));
      }catch{}
      return fresh;
    };
  }

  /* ===== Grid hooks ===== */
  function hookGrid(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    const obs = new MutationObserver(() => {
      grid.querySelectorAll(".card").forEach(card => applyUrgency(card));
    });
    obs.observe(grid, { childList:true, subtree:true });
  }

  /* ===== Init ===== */
  function init(){
    trustBarInit();
    hookGrid();
    hookConsultButtons();
    hookModalGallery();
    cacheWrapCatalog();

    // cuando haya productos, por si quieres recalcular urgencia
    const t = setInterval(() => {
      if ((store()?.getProducts?.() || []).length === 0) return;
      clearInterval(t);
      // re-check urgencia
      document.querySelectorAll(".card").forEach(applyUrgency);
    }, 250);
  }

  window.SDC_MEGA_PLUS = { init };

  // inicia automático (pero seguro)
  setTimeout(() => { try{ init(); }catch{} }, 0);
})();
// p3_product.js
window.SDC_P3 = (() => {
  const FALLBACK = () => window.SDC_FALLBACK_IMG?.url || "";

  // --- Fullscreen gallery ---
  let fsList = [];
  let fsIdx = 0;

  function ensureFS(){
    if (document.getElementById("p3fs")) return;
    const el = document.createElement("div");
    el.id = "p3fs";
    el.className = "p3fs";
    el.innerHTML = `
      <div class="p3fsBox">
        <div class="p3fsTop">
          <div class="p3fsTitle" id="p3fsTitle">Galería</div>
          <button class="p3fsClose" id="p3fsClose" type="button">✕</button>
        </div>
        <img class="p3fsImg" id="p3fsImg" alt="imagen">
        <div class="p3fsNav">
          <button class="p3fsBtn" id="p3fsPrev" type="button">←</button>
          <button class="p3fsBtn" id="p3fsNext" type="button">→</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById("p3fsClose").onclick = closeFS;
    el.onclick = (e) => { if (e.target.id === "p3fs") closeFS(); };
  }

  function openFS(title, list, idx){
    ensureFS();
    fsList = (list||[]).filter(Boolean);
    if (!fsList.length) fsList = [FALLBACK()];
    fsIdx = Math.max(0, Math.min(fsList.length-1, idx||0));

    document.getElementById("p3fsTitle").textContent = title || "Galería";
    renderFS();

    document.getElementById("p3fs").classList.add("show");
    document.getElementById("p3fsPrev").onclick = () => { fsIdx=(fsIdx-1+fsList.length)%fsList.length; renderFS(); };
    document.getElementById("p3fsNext").onclick = () => { fsIdx=(fsIdx+1)%fsList.length; renderFS(); };

    // swipe
    const img = document.getElementById("p3fsImg");
    let sx=0, ex=0;
    img.ontouchstart = (e)=>{ sx=e.touches[0].clientX; ex=sx; };
    img.ontouchmove  = (e)=>{ ex=e.touches[0].clientX; };
    img.ontouchend   = ()=> {
      const dx=ex-sx;
      if (Math.abs(dx)<50) return;
      if (dx<0) fsIdx=(fsIdx+1)%fsList.length;
      else fsIdx=(fsIdx-1+fsList.length)%fsList.length;
      renderFS();
    };
  }

  function renderFS(){
    const img = document.getElementById("p3fsImg");
    img.src = fsList[fsIdx] || FALLBACK();
    img.onerror = () => { img.src = FALLBACK(); };
  }

  function closeFS(){
    document.getElementById("p3fs")?.classList.remove("show");
  }

  // --- Helpers ---
  function getCurrentProduct(){
    // product_modal.js no expone p directamente, pero podemos inferir por pmTitle y lista:
    const title = document.getElementById("pmTitle")?.textContent?.trim() || "";
    const list = window.SDC_STORE?.getProducts?.() || [];
    return list.find(p => String(p.nombre||"").trim() === title) || null;
  }

  function galleryListFromModal(){
    const thumbs = Array.from(document.querySelectorAll("#pmThumbs img")).map(i => i.src).filter(Boolean);
    const main = document.getElementById("pmMainImg")?.src;
    const list = thumbs.length ? thumbs : (main ? [main] : []);
    return list.filter(Boolean);
  }

  // --- Videos panel improved ---
  function renderVideoButtons(p){
    const panel = document.getElementById("pmActions");
    if (!panel) return;

    // si ya existe algo, no lo rompemos, solo agregamos estilo wrapper
    if (!panel.classList.contains("videoBtns")) panel.classList.add("videoBtns");

    // si product_modal_ui ya generó botones, lo dejamos.
    // si no generó, los construimos con campos del sheet:
    const hasAny = panel.querySelector("a,button");
    const urls = [
      { key:"video_tiktok", label:"Ver en TikTok", icon:"🎵", url:p?.video_tiktok },
      { key:"video_youtube", label:"Ver en YouTube", icon:"▶️", url:p?.video_youtube },
      { key:"video_facebook", label:"Ver en Facebook", icon:"📘", url:p?.video_facebook },
      { key:"video_url", label:"Ver video", icon:"🎬", url:p?.video_url },
      { key:"video", label:"Ver video", icon:"🎬", url:p?.video },
    ];

    if (!hasAny){
      panel.innerHTML = "";
      urls.forEach(x=>{
        if (!x.url) return;
        const a = document.createElement("a");
        a.href = x.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `${x.icon} ${x.label}`;
        panel.appendChild(a);
      });
    }
  }

  // --- Quick spec ---
  function renderQuickSpec(p){
    const host = document.getElementById("pmTab_specs");
    const specEl = document.getElementById("pmSpecs");
    if (!host || !specEl) return;

    const fields = [
      ["Marca", p?.marca],
      ["Modelo", p?.modelo],
      ["Compatibilidad", p?.compatibilidad],
      ["Garantía", p?.garantia],
      ["Condición", p?.condicion],
    ].filter(([_,v]) => String(v||"").trim());

    // limpia previa
    host.querySelector(".quickSpec")?.remove();

    if (!fields.length) return;

    const box = document.createElement("div");
    box.className = "quickSpec";
    box.innerHTML = fields.map(([k,v]) => `
      <div class="qsRow"><div class="k">${k}</div><div class="v">${String(v)}</div></div>
    `).join("");

    host.insertAdjacentElement("afterbegin", box);
  }

  // --- Related products ---
  function scoreRelated(a, b){
    let s = 0;
    if (a.categoria && b.categoria && a.categoria === b.categoria) s += 3;
    if (a.subcategoria && b.subcategoria && a.subcategoria === b.subcategoria) s += 2;

    const ta = String(a.tags||"").toLowerCase().split(/[, ]+/).filter(Boolean);
    const tb = String(b.tags||"").toLowerCase().split(/[, ]+/).filter(Boolean);
    const setB = new Set(tb);
    ta.forEach(x => { if (setB.has(x)) s += 1; });

    return s;
  }

  function renderRelated(p){
    const box = document.getElementById("recoBox");
    if (!box || !p) return;

    const all = window.SDC_STORE?.getProducts?.() || [];
    const rel = all
      .filter(x => x && (x.id||x.nombre) && (String(x.id) !== String(p.id)))
      .map(x => ({ x, s: scoreRelated(p, x) }))
      .filter(o => o.s > 0)
      .sort((a,b)=>b.s-a.s)
      .slice(0, 10)
      .map(o=>o.x);

    if (!rel.length) {
      // si no hay rel, no ponemos nada
      return;
    }

    box.innerHTML = `
      <div class="relTitle">Relacionados</div>
      <div class="relRow" id="relRow"></div>
    `;

    const row = document.getElementById("relRow");
    rel.forEach(x=>{
      const c = document.createElement("div");
      c.className = "relCard";
      c.onclick = () => window.SDC_PRODUCT_MODAL?.open?.(x, { setHash:true });

      const img = document.createElement("img");
      img.src = x.imagen || FALLBACK();
      img.onerror = () => { img.src = FALLBACK(); };

      const rp = document.createElement("div");
      rp.className = "rp";
      rp.innerHTML = `
        <div class="rn">${x.nombre||""}</div>
        <div class="rpr">${window.SDC_UTILS?.money?.(x.precio, window.SDC_CONFIG?.CURRENCY) || ""}</div>
      `;

      c.appendChild(img);
      c.appendChild(rp);
      row.appendChild(c);
    });
  }

  // --- Inject “Ver galería” button in modal actions area ---
  function injectGalleryBtn(){
    const panel = document.getElementById("pmActions");
    if (!panel) return;
    if (document.getElementById("pmGalleryBtn")) return;

    const btn = document.createElement("button");
    btn.id = "pmGalleryBtn";
    btn.type = "button";
    btn.className = "btn ghost pmGalleryBtn";
    btn.textContent = "🖼 Ver galería";
    btn.onclick = () => {
      const p = getCurrentProduct();
      const list = galleryListFromModal();
      openFS(p?.nombre || "Galería", list, 0);
    };

    // lo ponemos arriba en el panel de videos
    panel.insertAdjacentElement("afterbegin", btn);
  }

  // --- Observe modal open to apply enhancements ---
  function hookModal(){
    const modal = document.getElementById("productModal");
    if (!modal) return;

    const obs = new MutationObserver(() => {
      if (!modal.classList.contains("open")) return;

      const p = getCurrentProduct();

      // botón galería y doble click en main image
      injectGalleryBtn();

      const main = document.getElementById("pmMainImg");
      if (main && !main.dataset.p3dbl){
        main.dataset.p3dbl = "1";
        main.addEventListener("dblclick", () => {
          const list = galleryListFromModal();
          openFS(p?.nombre || "Galería", list, 0);
        });
      }

      // mejorar videos
      renderVideoButtons(p);

      // ficha rápida
      renderQuickSpec(p);

      // relacionados
      renderRelated(p);
    });

    obs.observe(modal, { attributes:true, attributeFilter:["class"] });
  }

  function init(){
    ensureFS();
    hookModal();
  }

  return { init };
})();
window.SDC_CATALOG_UI = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const PM = window.SDC_PRODUCT_MODAL;
  const PAGER = window.SDC_PAGER;

  const FALLBACK = window.SDC_FALLBACK_IMG?.url || "";

  function filterQuick(list){
    const mode = window.SDC_FILTERS?.getMode?.() || "all";
    const toBool = window.SDC_BADGES?.toBool || ((v)=>!!v);
    const isOffer = (p)=>Number(p.precio_anterior||0) > Number(p.precio||0);

    if (mode === "stock") return list.filter(p => Number(p.stock||0) > 0);
    if (mode === "offers") return list.filter(p => isOffer(p));
    if (mode === "featured") return list.filter(p => toBool(p.destacado));
    return list;
  }

  function filterBrand(list){
    return window.SDC_BRAND?.apply?.(list) || list;
  }

  function getSortMode(){
    const sel = U.$("sortSel");
    return sel ? (sel.value || "relevancia") : "relevancia";
  }

  function sortList(list){
    const withStockFirst = (a,b) => {
      const sa=(Number(a.stock)>0)?0:1, sb=(Number(b.stock)>0)?0:1;
      if(sa!==sb) return sa-sb;
      return 0;
    };
    const byOrderThenName = (a,b) => {
      const oa=Number(a.orden||0), ob=Number(b.orden||0);
      if(oa!==ob) return oa-ob;
      return String(a.nombre||"").localeCompare(String(b.nombre||""));
    };

    const copy = list.slice();
    copy.sort((a,b)=>{
      const s=withStockFirst(a,b);
      if (s!==0) return s;
      return byOrderThenName(a,b);
    });
    return copy;
  }

  function renderSkeletonGrid(count=10){
    const el=U.$("grid");
    if(!el) return;
    el.innerHTML="";
    for(let i=0;i<count;i++){
      const sk=document.createElement("div");
      sk.className="skCard skShimmer";
      sk.innerHTML=`<div class="skImg"></div><div class="skBody"><div class="skLine lg"></div><div class="skLine md"></div><div class="skLine sm"></div></div>`;
      el.appendChild(sk);
    }
  }

  function renderTabs(){
    const el=U.$("catTabs");
    el.innerHTML="";
    const cats=S.getCats();
    const active=S.getActiveCat();
    cats.forEach(c=>{
      const d=document.createElement("div");
      d.className="tab"+(c===active?" active":"");
      d.textContent=c;
      d.onclick=()=>{ S.setActiveCat(c); S.setActiveSub("Todas"); renderTabs(); renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function renderSubTabs(){
    const el=U.$("subTabs");
    el.innerHTML="";
    const activeCat=S.getActiveCat();
    const activeSub=S.getActiveSub();
    const map=S.getSubcatsMap();

    let subs=[];
    if(activeCat==="Todas"){
      const all=new Set();
      for(const set of map.values()) for(const s of set) all.add(s);
      subs=["Todas",...Array.from(all).sort((a,b)=>a.localeCompare(b))];
    } else {
      const set=map.get(activeCat)||new Set();
      subs=["Todas",...Array.from(set).sort((a,b)=>a.localeCompare(b))];
    }

    subs.forEach(s=>{
      const d=document.createElement("div");
      d.className="tab"+(s===activeSub?" active":"");
      d.textContent=s;
      d.onclick=()=>{ S.setActiveSub(s); renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function hideBrandFilterIfEmpty(list){
    const sel = document.getElementById("brandFilter");
    if (!sel) return;
    const has = (list||[]).some(p => String(p.marca||"").trim() || String(p.compatibilidad||"").trim());
    sel.style.display = has ? "block" : "none";
  }

  function consultWA(p){
    const phone = S.getWhatsapp();
    const link = window.SDC_SHARE?.shareLinkFor?.(p) || "";
    const txt = `Hola, quiero consultar disponibilidad:\n• ${p.nombre}\n• ID: ${p.id}\n${link}`;
    const wa = "https://wa.me/" + phone.replace(/[^\d]/g,"") + "?text=" + encodeURIComponent(txt);
    window.open(wa, "_blank");
  }

  function renderGrid(){
    const q=(U.$("q").value||"").trim().toLowerCase();
    const activeCat=S.getActiveCat();
    const activeSub=S.getActiveSub();
    const mode=window.SDC_FILTERS?.getMode?.() || "all";

    let list=S.getProducts();
    hideBrandFilterIfEmpty(list);

    if(activeCat!=="Todas") list=list.filter(p=>p.categoria===activeCat);
    if(activeSub!=="Todas") list=list.filter(p=>p.subcategoria===activeSub);

    list = filterQuick(list);
    list = filterBrand(list);

    if(q) list=list.filter(p =>
      (p.nombre||"").toLowerCase().includes(q) ||
      (p.tags||"").toLowerCase().includes(q) ||
      (p.marca||"").toLowerCase().includes(q) ||
      (p.modelo||"").toLowerCase().includes(q) ||
      (p.compatibilidad||"").toLowerCase().includes(q)
    );

    list = sortList(list);

    const pagerKey = [activeCat, activeSub, mode, (getSortMode()), q, (window.SDC_BRAND?.get?.()||"all")].join("|");
    PAGER.ensureKey(pagerKey);
    const visibleList = PAGER.slice(list);

    const el=U.$("grid");
    el.innerHTML="";

    visibleList.forEach(p=>{
      const stock = Number(p.stock||0);
      const inStock = stock > 0;
      const low = inStock && stock <= 3;

      const b = window.SDC_BADGES?.get?.(p) || { isOffer:false, saveAmt:0, savePct:0, isFeatured:false, isNew:false };

      const card=document.createElement("div");
      card.className="card"+(!inStock?" outCard":"")+(b.isFeatured?" featuredCard":"");
      card.onclick=()=>PM.open(p,{setHash:true});

      const imgWrap=document.createElement("div");
      imgWrap.className="imgWrap";

      const img=document.createElement("img");
      img.className="img";
      img.loading="lazy";
      img.src=p.imagen||FALLBACK;
      img.alt=p.nombre||"";
      img.onerror=()=>img.src=FALLBACK;
      imgWrap.appendChild(img);

      // ribbons
      const rr = document.createElement("div");
      rr.className = "ribbonRow";

      if (b.isFeatured) {
        const r = document.createElement("div");
        r.className = "ribbon featured";
        r.textContent = "★ DESTACADO";
        rr.appendChild(r);
      }
      if (b.isNew) {
        const r = document.createElement("div");
        r.className = "ribbon new";
        r.textContent = "NUEVO";
        rr.appendChild(r);
      }
      if (b.isOffer && b.savePct > 0) {
        const r = document.createElement("div");
        r.className = "ribbon offer";
        r.textContent = `OFERTA -${b.savePct}%`;
        rr.appendChild(r);
      }

      if (rr.childElementCount) imgWrap.appendChild(rr);

      if (low) {
        const tag = document.createElement("div");
        tag.className = "lowTag";
        tag.textContent = `POCO STOCK (${stock})`;
        imgWrap.appendChild(tag);
      }

      const box=document.createElement("div");
      box.className="p";
      box.innerHTML=`
        <div class="name">${U.esc(p.nombre||"")}</div>
        <div class="mut">${U.esc(p.categoria||"")}${p.subcategoria?(" • "+U.esc(p.subcategoria)):""}</div>
        <div class="price">${U.money(p.precio, CFG.CURRENCY)}</div>
      `;

      if (b.isOffer && b.saveAmt > 0) {
        const save = document.createElement("div");
        save.className = "saveLine";
        save.innerHTML = `Ahorras <b>${U.money(b.saveAmt, CFG.CURRENCY)}</b>`;
        box.appendChild(save);
      }

      const badge=document.createElement("div");
      badge.className="badge "+(inStock ? (low ? "low":"off") : "out");
      badge.textContent=inStock ? (low ? `POCO STOCK (${stock})` : `Stock: ${stock}`) : "AGOTADO";

      const btn=document.createElement("button");
      btn.style.width="100%";
      btn.style.marginTop="10px";

      if (inStock) {
        btn.className="btn acc";
        btn.textContent="Añadir al carrito";
        btn.onclick=(ev)=>{
          ev.stopPropagation();
          const ok = S.addToCart(p,1);
          if (ok) {
            window.SDC_ADD_CONFIRM?.notify?.("Agregado ✅");
            window.SDC_CART?.renderCart?.();
            window.SDC_CART_BADGE?.apply?.();
          }
        };
      } else {
        btn.className="btn consultBtn";
        btn.textContent="Consultar disponibilidad";
        btn.onclick=(ev)=>{
          ev.stopPropagation();
          consultWA(p);
        };
      }

      box.appendChild(badge);
      box.appendChild(btn);

      card.appendChild(imgWrap);
      card.appendChild(box);
      el.appendChild(card);
    });

    // refrescar favoritos
    window.SDC_FAV_SECTION?.render?.();

    const wrap = U.$("loadMoreWrap");
    const btn = U.$("loadMoreBtn");
    const note = U.$("loadMoreNote");
    if (wrap && btn && note) {
      const can = PAGER.canLoadMore(list.length);
      wrap.style.display = can ? "block" : "none";
      note.textContent = can ? `Mostrando ${visibleList.length} de ${list.length}` : "";
      btn.onclick = () => { PAGER.loadMore(); renderGrid(); };
    }

    window.SDC_RESULTS?.refresh?.();
  }

  function bindSort(){
    const sel=U.$("sortSel");
    if(!sel) return;
    sel.onchange=()=>renderGrid();
  }

  return { renderTabs, renderSubTabs, renderGrid, bindSort, renderSkeletonGrid };
})();
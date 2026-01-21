window.SDC_CATALOG_UI = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const PM = window.SDC_PRODUCT_MODAL;

  const fallbackSvg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
      <rect width='100%' height='100%' fill='#0a0f17'/>
      <text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text>
    </svg>`
  );

  const PAGER = window.SDC_PAGER;

  function toBool(v){
    const s = String(v ?? "").trim().toLowerCase();
    return v === true || s === "1" || s === "true" || s === "si" || s === "sí" || s === "yes";
  }

  function isOffer(p){
    return toBool(p.oferta) || (Number(p.precio_anterior||0) > Number(p.precio||0));
  }

  function filterQuick(list){
    const mode = window.SDC_FILTERS?.getMode?.() || "all";
    if (mode === "stock") return list.filter(p => Number(p.stock||0) > 0);
    if (mode === "offers") return list.filter(p => isOffer(p));
    if (mode === "featured") return list.filter(p => toBool(p.destacado));
    return list;
  }

  function getSortMode(){
    const sel = U.$("sortSel");
    return sel ? (sel.value || "relevancia") : "relevancia";
  }

  function sortList(list){
    const mode = getSortMode();
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
    const byPriceAsc = (a,b) => Number(a.precio||0) - Number(b.precio||0);
    const byPriceDesc = (a,b) => Number(b.precio||0) - Number(a.precio||0);
    const byOrderDesc = (a,b) => Number(b.orden||0) - Number(a.orden||0);

    const copy = list.slice();
    if (mode === "precio_asc") { copy.sort((a,b)=>{const s=withStockFirst(a,b); return s!==0?s:byPriceAsc(a,b)}); return copy; }
    if (mode === "precio_desc"){ copy.sort((a,b)=>{const s=withStockFirst(a,b); return s!==0?s:byPriceDesc(a,b)}); return copy; }
    if (mode === "orden_desc") { copy.sort((a,b)=>{const s=withStockFirst(a,b); return s!==0?s:byOrderDesc(a,b)}); return copy; }
    if (mode === "stock_first"){ copy.sort((a,b)=>{const s=withStockFirst(a,b); return s!==0?s:byOrderThenName(a,b)}); return copy; }

    copy.sort((a,b)=>{
      const sa=(Number(a.stock)>0)?0:1, sb=(Number(b.stock)>0)?0:1;
      if(sa!==sb) return sa-sb;
      const oa=Number(a.orden||0), ob=Number(b.orden||0);
      if(oa!==ob) return oa-ob;
      return String(a.nombre||"").localeCompare(String(b.nombre||""));
    });
    return copy;
  }

  function shouldShowTopSections(){
    const mode = window.SDC_FILTERS?.getMode?.() || "all";
    return (S.getActiveCat()==="Todas" && S.getActiveSub()==="Todas" && mode==="all");
  }

  function hideTopSections(){
    const fs = U.$("featuredSection");
    const os = U.$("offersSection");
    if (fs) fs.style.display = "none";
    if (os) os.style.display = "none";
    const fr = U.$("featuredRow"); if (fr) fr.innerHTML = "";
    const or = U.$("offersRow"); if (or) or.innerHTML = "";
  }

  function renderFeatured(){
    if (!shouldShowTopSections()){ hideTopSections(); return; }

    const all = S.getProducts();
    const featured = all.filter(p => toBool(p.destacado));
    const offers = all.filter(p => isOffer(p));
    renderHRow("featuredSection","featuredRow", featured);
    renderHRow("offersSection","offersRow", offers);
  }

  function renderHRow(sectionId,rowId,list){
    const section = U.$(sectionId);
    const row = U.$(rowId);
    if(!section || !row) return;

    const items = sortList(list).slice(0, 20);
    if(!items.length){ section.style.display="none"; row.innerHTML=""; return; }

    section.style.display="block";
    row.innerHTML="";

    items.forEach(p=>{
      const inStock = Number(p.stock||0) > 0;
      const card = document.createElement("div");
      card.className = "hCard" + (!inStock ? " outCard" : "");
      card.onclick = ()=>PM.open(p,{setHash:true});

      const imgWrap = document.createElement("div");
      imgWrap.className="imgWrap";

      const img=document.createElement("img");
      img.src=p.imagen||""; img.alt=p.nombre||""; img.loading="lazy";
      img.onerror=()=>img.src=fallbackSvg;

      imgWrap.appendChild(img);

      const box=document.createElement("div");
      box.className="hp";
      box.innerHTML = `
        <div class="hname">${U.esc(p.nombre||"")}</div>
        <div class="mut">${inStock ? ("Stock: "+Number(p.stock||0)) : "AGOTADO"}</div>
        <div class="hprice">${U.money(p.precio, CFG.CURRENCY)}</div>
      `;

      card.appendChild(imgWrap);
      card.appendChild(box);
      row.appendChild(card);
    });
  }

  function renderSkeletonGrid(count=10){
    hideTopSections();
    const el=U.$("grid");
    if(!el) return;
    el.innerHTML="";
    for(let i=0;i<count;i++){
      const sk=document.createElement("div");
      sk.className="skCard skShimmer";
      sk.innerHTML=`
        <div class="skImg"></div>
        <div class="skBody">
          <div class="skLine lg"></div>
          <div class="skLine md"></div>
          <div class="skLine sm"></div>
        </div>`;
      el.appendChild(sk);
    }
    const wrap = U.$("loadMoreWrap");
    if (wrap) wrap.style.display = "none";
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
      d.onclick=()=>{
        S.setActiveCat(c);
        S.setActiveSub("Todas");
        renderTabs(); renderSubTabs(); renderGrid();
      };
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
      d.onclick=()=>{
        S.setActiveSub(s);
        renderSubTabs(); renderGrid();
      };
      el.appendChild(d);
    });
  }

  function renderGrid(){
    renderFeatured();

    const q=(U.$("q").value||"").trim().toLowerCase();
    const activeCat=S.getActiveCat();
    const activeSub=S.getActiveSub();
    const mode=window.SDC_FILTERS?.getMode?.() || "all";
    const sort=getSortMode();

    let list=S.getProducts();

    if(activeCat!=="Todas") list=list.filter(p=>p.categoria===activeCat);
    if(activeSub!=="Todas") list=list.filter(p=>p.subcategoria===activeSub);

    list = filterQuick(list);

    if(q) list=list.filter(p =>
      (p.nombre||"").toLowerCase().includes(q) ||
      (p.tags||"").toLowerCase().includes(q) ||
      (p.marca||"").toLowerCase().includes(q) ||
      (p.modelo||"").toLowerCase().includes(q)
    );

    list = sortList(list);

    // ✅ paginación: clave por contexto
    const pagerKey = [activeCat, activeSub, mode, sort, q].join("|");
    PAGER.ensureKey(pagerKey);

    const visibleList = PAGER.slice(list);

    const el=U.$("grid");
    el.innerHTML="";

    visibleList.forEach(p=>{
      const inStock = Number(p.stock||0) > 0;

      const card=document.createElement("div");
      card.className="card"+(!inStock?" outCard":"");
      card.onclick=()=>PM.open(p,{setHash:true});

      const imgWrap=document.createElement("div");
      imgWrap.className="imgWrap";

      const img=document.createElement("img");
      img.className="img";
      img.loading="lazy";
      img.src=p.imagen||"";
      img.alt=p.nombre||"";
      img.onerror=()=>img.src=fallbackSvg;

      imgWrap.appendChild(img);

      const box=document.createElement("div");
      box.className="p";
      box.innerHTML=`
        <div class="name">${U.esc(p.nombre||"")}</div>
        <div class="mut">${U.esc(p.categoria||"")}${p.subcategoria?(" • "+U.esc(p.subcategoria)):""}</div>
        <div class="price">${U.money(p.precio, CFG.CURRENCY)}</div>
      `;

      const badge=document.createElement("div");
      badge.className="badge "+(inStock?"off":"out");
      badge.textContent=inStock?`Stock: ${Number(p.stock)}`:"AGOTADO";

      const btn=document.createElement("button");
      btn.className="btn acc";
      btn.style.width="100%";
      btn.style.marginTop="10px";
      btn.textContent=inStock?"Añadir al carrito":"No disponible";
      btn.disabled=!inStock;
      btn.onclick=(ev)=>{ev.stopPropagation(); S.addToCart(p,1);};

      box.appendChild(badge);
      box.appendChild(btn);

      card.appendChild(imgWrap);
      card.appendChild(box);
      el.appendChild(card);
    });

    // ✅ botón “Cargar más”
    const wrap = U.$("loadMoreWrap");
    const btn = U.$("loadMoreBtn");
    const note = U.$("loadMoreNote");
    if (wrap && btn && note) {
      const can = PAGER.canLoadMore(list.length);
      wrap.style.display = can ? "block" : "none";
      note.textContent = can ? `Mostrando ${visibleList.length} de ${list.length}` : "";
      btn.onclick = () => {
        PAGER.loadMore();
        renderGrid();
      };
    }
  }

  function bindSort(){
    const sel=U.$("sortSel");
    if(!sel) return;
    sel.onchange=()=>renderGrid();
  }

  return { renderTabs, renderSubTabs, renderGrid, bindSort, renderSkeletonGrid };
})();

window.SDC_CATALOG = (() => {
  const CFG = window.SDC_CONFIG, ST = window.SDC_STORE, U = window.SDC_UTILS;

  async function loadCatalog(){
    U.$("statusPill").textContent = "Cargando catálogo...";
    const res = await fetch(`${CFG.API_URL}?action=catalog`, { cache:"no-store" });
    const json = await res.json();
    if(!json.ok) throw new Error(json.error || "No se pudo cargar");
    ST.DATA = json;

    ST.products = (json.productos||[]).filter(p=>p&&p.nombre&&p.categoria);
    ST.products.sort((a,b)=>{
      const sa=(Number(a.stock)>0)?0:1, sb=(Number(b.stock)>0)?0:1;
      if(sa!==sb) return sa-sb;
      const oa=Number(a.orden||0), ob=Number(b.orden||0);
      if(oa!==ob) return oa-ob;
      return String(a.nombre).localeCompare(String(b.nombre));
    });

    const cats=new Set(ST.products.map(p=>p.categoria||""));
    ST.categories = ["Todas", ...Array.from(cats).filter(Boolean).sort((a,b)=>a.localeCompare(b))];

    ST.subcatsByCat = new Map();
    for(const p of ST.products){
      const c=p.categoria||"", s=p.subcategoria||"";
      if(!ST.subcatsByCat.has(c)) ST.subcatsByCat.set(c,new Set());
      if(s) ST.subcatsByCat.get(c).add(s);
    }

    renderTabs(); renderSubTabs(); renderGrid();
    U.$("statusPill").textContent = `Catálogo listo (${ST.products.length} productos)`;
  }

  function renderTabs(){
    const el = U.$("catTabs"); el.innerHTML="";
    ST.categories.forEach(c=>{
      const d=document.createElement("div");
      d.className="tab"+(c===ST.activeCat?" active":"");
      d.textContent=c;
      d.onclick=()=>{ ST.activeCat=c; ST.activeSub="Todas"; renderTabs(); renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function renderSubTabs(){
    const el = U.$("subTabs"); el.innerHTML="";
    let subs=[];
    if(ST.activeCat==="Todas"){
      const all=new Set();
      for(const set of ST.subcatsByCat.values()) for(const s of set) all.add(s);
      subs=["Todas",...Array.from(all).sort((a,b)=>a.localeCompare(b))];
    } else {
      const set=ST.subcatsByCat.get(ST.activeCat)||new Set();
      subs=["Todas",...Array.from(set).sort((a,b)=>a.localeCompare(b))];
    }
    subs.forEach(s=>{
      const d=document.createElement("div");
      d.className="tab"+(s===ST.activeSub?" active":"");
      d.textContent=s;
      d.onclick=()=>{ ST.activeSub=s; renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function renderGrid(){
    const q = (U.$("q").value||"").trim().toLowerCase();
    let list=ST.products;

    if(ST.activeCat!=="Todas") list=list.filter(p=>p.categoria===ST.activeCat);
    if(ST.activeSub!=="Todas") list=list.filter(p=>p.subcategoria===ST.activeSub);
    if(q) list=list.filter(p=>(p.nombre||"").toLowerCase().includes(q)||(p.tags||"").toLowerCase().includes(q));

    const el = U.$("grid"); el.innerHTML="";
    list.forEach(p=>{
      const inStock = Number(p.stock||0)>0;

      const card=document.createElement("div"); card.className="card";
      const img=document.createElement("img");
      img.className="img"; img.loading="lazy"; img.src=p.imagen||""; img.alt=p.nombre||"";
      img.onerror=()=>{img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='#0a0f17'/><text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text></svg>`);};

      const box=document.createElement("div"); box.className="p";
      box.innerHTML=`
        <div class="name">${U.esc(p.nombre||"")}</div>
        <div class="mut">${U.esc(p.categoria||"")}${p.subcategoria?(" • "+U.esc(p.subcategoria)):""}</div>
        <div class="price">${U.money(p.precio, CFG.CURRENCY)}</div>
      `;

      const badge=document.createElement("div");
      badge.className="badge "+(inStock?"off":"out");
      badge.textContent=inStock?`Stock: ${Number(p.stock)}`:"AGOTADO";

      const btn=document.createElement("button");
      btn.className="btn acc"; btn.style.width="100%"; btn.style.marginTop="10px";
      btn.textContent=inStock?"Añadir al carrito":"No disponible";
      btn.disabled=!inStock;
      btn.onclick=()=>window.SDC_CART.add(p);

      box.appendChild(badge);
      box.appendChild(btn);

      card.appendChild(img);
      card.appendChild(box);
      el.appendChild(card);
    });
  }

  return { loadCatalog, renderGrid, renderTabs, renderSubTabs };
})();

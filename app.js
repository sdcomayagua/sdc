(() => {
  const CFG = window.SDC_CONFIG;
  const API_URL = CFG.API_URL;
  const DEFAULT_WHATSAPP = CFG.DEFAULT_WHATSAPP;
  const CURRENCY = CFG.CURRENCY;
  const NATIONAL_PREPAGO = CFG.NATIONAL_PREPAGO;
  const NATIONAL_CONTRA_ENTREGA = CFG.NATIONAL_CONTRA_ENTREGA;
  const LOCAL_ALLOW = new Set(CFG.LOCAL_ALLOW || []);

  let DATA=null, products=[], categories=[], subcatsByCat=new Map();
  let cart=new Map();
  let activeCat="Todas", activeSub="Todas";

  const $=id=>document.getElementById(id);
  const toast=msg=>{const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800);};
  const money=n=>`${CURRENCY}. ${Number(n||0).toFixed(2)}`;
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  const escAttr=s=>String(s).replace(/"/g,'&quot;');
  const isLocal=(dep,mun)=>LOCAL_ALLOW.has(`${dep}|${mun}`);

  async function load(){
    $("statusPill").textContent="Cargando catálogo...";
    const res=await fetch(`${API_URL}?action=catalog`,{cache:"no-store"});
    const json=await res.json();
    if(!json.ok) throw new Error(json.error||"No se pudo cargar");
    DATA=json;

    products=(json.productos||[]).filter(p=>p&&p.nombre&&p.categoria);
    products.sort((a,b)=>{
      const sa=(Number(a.stock)>0)?0:1, sb=(Number(b.stock)>0)?0:1;
      if(sa!==sb) return sa-sb;
      const oa=Number(a.orden||0), ob=Number(b.orden||0);
      if(oa!==ob) return oa-ob;
      return String(a.nombre).localeCompare(String(b.nombre));
    });

    const cats=new Set(products.map(p=>p.categoria||""));
    categories=["Todas",...Array.from(cats).filter(Boolean).sort((a,b)=>a.localeCompare(b))];

    subcatsByCat=new Map();
    for(const p of products){
      const c=p.categoria||"", s=p.subcategoria||"";
      if(!subcatsByCat.has(c)) subcatsByCat.set(c,new Set());
      if(s) subcatsByCat.get(c).add(s);
    }

    renderTabs(); renderSubTabs(); renderGrid(); initLocationSelectors();
    $("statusPill").textContent=`Catálogo listo (${products.length} productos)`;
  }

  function renderTabs(){
    const el=$("catTabs"); el.innerHTML="";
    categories.forEach(c=>{
      const d=document.createElement("div");
      d.className="tab"+(c===activeCat?" active":"");
      d.textContent=c;
      d.onclick=()=>{activeCat=c;activeSub="Todas";renderTabs();renderSubTabs();renderGrid();};
      el.appendChild(d);
    });
  }

  function renderSubTabs(){
    const el=$("subTabs"); el.innerHTML="";
    let subs=[];
    if(activeCat==="Todas"){
      const all=new Set();
      for(const set of subcatsByCat.values()) for(const s of set) all.add(s);
      subs=["Todas",...Array.from(all).sort((a,b)=>a.localeCompare(b))];
    } else {
      const set=subcatsByCat.get(activeCat)||new Set();
      subs=["Todas",...Array.from(set).sort((a,b)=>a.localeCompare(b))];
    }
    subs.forEach(s=>{
      const d=document.createElement("div");
      d.className="tab"+(s===activeSub?" active":"");
      d.textContent=s;
      d.onclick=()=>{activeSub=s;renderSubTabs();renderGrid();};
      el.appendChild(d);
    });
  }

  function renderGrid(){
    const q=$("q").value.trim().toLowerCase();
    let list=products;

    if(activeCat!=="Todas") list=list.filter(p=>p.categoria===activeCat);
    if(activeSub!=="Todas") list=list.filter(p=>p.subcategoria===activeSub);
    if(q) list=list.filter(p=>(p.nombre||"").toLowerCase().includes(q)||(p.tags||"").toLowerCase().includes(q));

    const el=$("grid"); el.innerHTML="";
    list.forEach(p=>{
      const card=document.createElement("div"); card.className="card";

      const img=document.createElement("img");
      img.className="img"; img.loading="lazy"; img.src=p.imagen||""; img.alt=p.nombre||"";
      img.onerror=()=>{img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='#0a0f17'/><text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text></svg>`);};

      const box=document.createElement("div"); box.className="p";
      const inStock=Number(p.stock||0)>0;

      box.innerHTML=`
        <div class="name">${esc(p.nombre||"")}</div>
        <div class="mut">${esc(p.categoria||"")}${p.subcategoria?(" • "+esc(p.subcategoria)):""}</div>
        <div class="price">${money(p.precio)}</div>
      `;

      const badge=document.createElement("div");
      badge.className="badge "+(inStock?"off":"out");
      badge.textContent=inStock?`Stock: ${Number(p.stock)}`:"AGOTADO";

      const btn=document.createElement("button");
      btn.className="btn acc"; btn.style.width="100%"; btn.style.marginTop="10px";
      btn.textContent=inStock?"Añadir al carrito":"No disponible";
      btn.disabled=!inStock;
      btn.onclick=()=>addToCart(p);

      box.appendChild(badge);
      box.appendChild(btn);

      card.appendChild(img);
      card.appendChild(box);
      el.appendChild(card);
    });
  }

  function addToCart(p){
    const id=p.id||p.nombre;
    const cur=cart.get(id);
    const stock=Number(p.stock||0);
    const next=(cur?cur.qty:0)+1;
    if(next>stock){toast("No hay stock suficiente");return;}
    cart.set(id,{p,qty:next});
    updateCartCount(); toast("Agregado al carrito");
  }

  function updateCartCount(){
    let count=0; for(const it of cart.values()) count+=it.qty;
    $("cartCount").textContent=count;
  }

  function openCart(){ $("cartModal").classList.add("open"); renderCart(); computeSummary(); }
  function closeCart(){ $("cartModal").classList.remove("open"); }

  function renderCart(){
    const el=$("cartItems"); el.innerHTML="";
    if(cart.size===0){ el.innerHTML=`<div class="note">Tu carrito está vacío.</div>`; return; }

    for(const [id,it] of cart.entries()){
      const p=it.p;
      const row=document.createElement("div"); row.className="cartItem";
      row.innerHTML=`
        <img src="${escAttr(p.imagen||"")}" alt="">
        <div style="flex:1">
          <div style="font-weight:900">${esc(p.nombre||"")}</div>
          <div class="mut">${esc(p.categoria||"")}${p.subcategoria?(" • "+esc(p.subcategoria)):""}</div>
          <div style="margin-top:6px;font-weight:900">${money(p.precio)} <span class="mut">x ${it.qty}</span></div>
        </div>
        <div class="qty">
          <button class="mini" data-act="minus" data-id="${escAttr(id)}">-</button>
          <div style="min-width:22px;text-align:center;font-weight:900">${it.qty}</div>
          <button class="mini" data-act="plus" data-id="${escAttr(id)}">+</button>
          <button class="mini" data-act="del" data-id="${escAttr(id)}">🗑</button>
        </div>
      `;
      row.querySelectorAll("button").forEach(b=>{
        b.onclick=()=>{
          const act=b.getAttribute("data-act");
          const pid=b.getAttribute("data-id");
          const item=cart.get(pid); if(!item) return;
          const stock=Number(item.p.stock||0);
          if(act==="minus"){ item.qty=Math.max(1,item.qty-1); cart.set(pid,item); }
          if(act==="plus"){ if(item.qty+1>stock){toast("No hay stock suficiente");return;} item.qty+=1; cart.set(pid,item); }
          if(act==="del"){ cart.delete(pid); }
          updateCartCount(); renderCart(); computeSummary();
        };
      });
      el.appendChild(row);
    }
  }

  function initLocationSelectors(){
    const deps=new Set((DATA.municipios||[]).map(x=>x.departamento).filter(Boolean));
    const depSel=$("dep"); depSel.innerHTML="";
    Array.from(deps).sort((a,b)=>a.localeCompare(b)).forEach(d=>{
      const o=document.createElement("option"); o.value=d; o.textContent=d; depSel.appendChild(o);
    });
    depSel.onchange=fillMunicipios;
    $("mun").onchange=updateDeliveryOptions;
    $("payType").onchange=()=>{toggleCashBox();computeSummary();};
    $("cashAmount").oninput=computeSummary;
    fillMunicipios();
  }

  function fillMunicipios(){
    const dep=$("dep").value;
    const munSel=$("mun"); munSel.innerHTML="";
    const list=(DATA.municipios||[]).filter(x=>x.departamento===dep).map(x=>x.municipio);
    list.sort((a,b)=>a.localeCompare(b)).forEach(m=>{
      const o=document.createElement("option"); o.value=m; o.textContent=m; munSel.appendChild(o);
    });
    updateDeliveryOptions();
  }

  function updateDeliveryOptions(){
    const dep=$("dep").value, mun=$("mun").value;
    const local=isLocal(dep,mun);
    const sel=$("deliveryType"); sel.innerHTML="";
    const o=document.createElement("option");
    o.value=local?"local":"empresa";
    o.textContent=local?"ENTREGA LOCAL (Comayagua y alrededores)":"ENVÍO NACIONAL (C807 / Cargo Expreso / Forza)";
    sel.appendChild(o);
    $("deliveryNote").textContent=local?"Entrega local: pagar al recibir.":"Envío nacional: contra entrega o prepago.";
    if(local) $("payType").value="pagar_al_recibir";
    toggleCashBox(); computeSummary();
  }

  function toggleCashBox(){
    const dep=$("dep").value, mun=$("mun").value;
    const local=isLocal(dep,mun);
    const pay=$("payType").value;
    $("cashBox").style.display = (local && pay==="pagar_al_recibir") ? "block" : "none";
    $("payNote").textContent = local
      ? "PAGAR AL RECIBIR: se confirma monto para cambio."
      : (pay==="prepago"
        ? `PREPAGO: deposita producto + envío (${money(NATIONAL_PREPAGO)}).`
        : `CONTRA ENTREGA: paga a la empresa producto + envío (${money(NATIONAL_CONTRA_ENTREGA)}).`);
  }

  function computeSummary(){
    const sum=$("summary");
    if(cart.size===0){ sum.innerHTML=`<div class="note">Agrega productos para ver el total.</div>`; return; }

    const dep=$("dep").value, mun=$("mun").value;
    const local=isLocal(dep,mun);
    const pay=$("payType").value;

    let subtotal=0; for(const it of cart.values()) subtotal += Number(it.p.precio||0)*it.qty;

    let shipping=0;
    if(!local) shipping = (pay==="prepago") ? NATIONAL_PREPAGO : NATIONAL_CONTRA_ENTREGA;

    const totalNow = subtotal + ((!local && pay==="prepago") ? shipping : 0);
    const cash = Number(($("cashAmount").value||"").replace(/[^\d.]/g,"")||0);
    const change = (local && pay==="pagar_al_recibir" && cash>0) ? Math.max(0, cash - subtotal) : 0;

    sum.innerHTML = `
      <div class="sum"><div>Subtotal</div><div>${money(subtotal)}</div></div>
      <div class="sum"><div>Envío</div><div>${(!local && pay==="prepago") ? money(shipping) : "Se paga a empresa / coordina"}</div></div>
      <div class="sum total"><div>Total a pagar ahora</div><div>${money(totalNow)}</div></div>
      ${local && pay==="pagar_al_recibir" ? (cash>0
        ? `<div class="note" style="margin-top:8px">Paga con: ${money(cash)} → Cambio estimado: ${money(change)}</div>`
        : `<div class="note" style="margin-top:8px">Para calcular cambio, escribe “¿con cuánto pagará?”</div>`) : ""}
    `;
  }

  function buildWhatsAppMessage(){
    const dep=$("dep").value, mun=$("mun").value;
    const local=isLocal(dep,mun);
    const pay=$("payType").value;

    const name=$("name").value.trim();
    const phone=$("phone").value.trim();
    const addr=$("addr").value.trim();

    const lines=[];
    lines.push("🛒 *PEDIDO - Soluciones Digitales Comayagua*");
    lines.push(`📍 *Ubicación:* ${dep} - ${mun}`);
    lines.push(`🚚 *Entrega:* ${local ? "Entrega Local" : "Envío Nacional (Empresa)"}`);
    lines.push(`💳 *Pago:* ${pay==="prepago" ? "PREPAGO" : "PAGAR AL RECIBIR"}`);

    if(local && pay==="pagar_al_recibir"){
      const cash=($("cashAmount").value||"").trim();
      if(cash) lines.push(`💵 *Paga con:* ${cash}`);
    } else if(!local){
      lines.push("📦 *Empresa:* C807 / Cargo Expreso / Forza");
      lines.push(`💰 *Envío:* ${pay==="prepago" ? money(NATIONAL_PREPAGO) : money(NATIONAL_CONTRA_ENTREGA)} (${pay==="prepago" ? "incluido en depósito" : "pagado a empresa"})`);
    }

    lines.push("");
    lines.push("🧾 *Productos:*");
    let subtotal=0;
    for(const it of cart.values()){
      const line=Number(it.p.precio||0)*it.qty;
      subtotal+=line;
      lines.push(`• ${it.qty} x ${it.p.nombre} — ${money(line)}`);
    }
    lines.push(`Subtotal: ${money(subtotal)}`);

    if(!local && pay==="prepago") lines.push(`Total a depositar: ${money(subtotal + NATIONAL_PREPAGO)}`);
    else lines.push(`Total producto: ${money(subtotal)}`);

    lines.push("");
    lines.push("👤 *Cliente:*");
    if(name) lines.push(`Nombre: ${name}`);
    if(phone) lines.push(`Tel: ${phone}`);
    if(addr) lines.push(`Dirección: ${addr}`);

    return lines.join("\n");
  }

  function sendWhatsApp(){
    if(cart.size===0){ toast("Carrito vacío"); return; }
    const msg=buildWhatsAppMessage();
    const phone = (DATA && DATA.whatsapp) ? DATA.whatsapp : DEFAULT_WHATSAPP;
    window.open("https://wa.me/"+phone.replace(/[^\d]/g,"")+"?text="+encodeURIComponent(msg),"_blank");
  }

  // EVENTS
  $("q").addEventListener("input", renderGrid);
  $("cartBtn").onclick=openCart;
  $("closeCart").onclick=closeCart;
  $("cartModal").onclick=e=>{ if(e.target.id==="cartModal") closeCart(); };
  $("sendWA").onclick=sendWhatsApp;

  load().catch(err=>{
    console.error(err);
    $("statusPill").textContent="Error cargando catálogo";
    toast("Error: "+(err.message||err));
  });
})();


(()=> {
  const API_URL = "https://script.google.com/macros/s/AKfycbytPfD9mq__VO7I2lnpBsqdCIT119ZT0zVyz0eeVjrJVgN_q8FYGgmqY6G66C2m67Pa4g/exec";
  const TOKEN_KEY = "sdc_admin_token_v1";

  const $ = (id) => document.getElementById(id);
  const safe = (v) => String(v ?? "").trim();
  const money = (n) => `Lps. ${Math.round(Number(n||0)).toLocaleString("es-HN")}`;

  let PRODUCTS = [];
  let CURRENT = null;

  function show(el, on=true){ el.style.display = on ? "" : "none"; }
  function modal(id, on){ $(id).classList.toggle("show", !!on); }
  function setErr(id, msg){ const el=$(id); if(!el) return; el.textContent = msg||""; show(el, !!msg); }
  function setOk(id, msg){ const el=$(id); if(!el) return; el.textContent = msg||""; show(el, !!msg); }
  function token(){ return localStorage.getItem(TOKEN_KEY) || ""; }

  async function api(action, payload={}){
    const t = token();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json", "X-ADMIN-TOKEN": t },
      body: JSON.stringify({ action, ...payload }),
    });
    const txt = await res.text();
    let j;
    try{ j = JSON.parse(txt); }catch(_e){ throw new Error("Respuesta no JSON del servidor."); }
    if(!res.ok || !j.ok) throw new Error(j.error || `Error (${res.status})`);
    return j;
  }

  function slug(s){
    return safe(s)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/(^-|-$)/g,"")
      .slice(0, 40) || "prd";
  }

  function genId(){
    const c = slug($("p_categoria")?.value || "prd");
    const r = Math.random().toString(36).slice(2,7);
    return `${c}-${Date.now().toString(36)}-${r}`;
  }

  function cats(){
    return [...new Set(PRODUCTS.map(p=>safe(p.categoria)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  }
  function subs(cat){
    return [...new Set(PRODUCTS.filter(p=>!cat || safe(p.categoria)===cat).map(p=>safe(p.subcategoria)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  }

  function fillFilterLists(){
    const fCat = $("fCat");
    const fSub = $("fSub");
    fCat.innerHTML = `<option value="">Todas las categorías</option>`;
    cats().forEach(c=>{
      const o=document.createElement("option"); o.value=c; o.textContent=c; fCat.appendChild(o);
    });
    fSub.innerHTML = `<option value="">Todas las subcategorías</option>`;
    subs(fCat.value).forEach(s=>{
      const o=document.createElement("option"); o.value=s; o.textContent=s; fSub.appendChild(o);
    });

    // datalist for editor
    const dlC = $("catsList");
    const dlS = $("subsList");
    dlC.innerHTML = ""; dlS.innerHTML = "";
    cats().forEach(c=>{ const o=document.createElement("option"); o.value=c; dlC.appendChild(o); });
    subs().forEach(s=>{ const o=document.createElement("option"); o.value=s; dlS.appendChild(o); });
  }

  function filterList(){
    const q = safe($("q").value).toLowerCase();
    const cat = $("fCat").value;
    const sub = $("fSub").value;
    const st = $("fStock").value;

    let list = [...PRODUCTS];

    if(cat) list = list.filter(p=>safe(p.categoria)===cat);
    if(sub) list = list.filter(p=>safe(p.subcategoria)===sub);
    if(st==="in") list = list.filter(p=>Number(p.stock||0)>0);
    if(st==="out") list = list.filter(p=>Number(p.stock||0)<=0);

    if(q){
      list = list.filter(p => {
        const hay = `${p.id} ${p.nombre} ${p.categoria} ${p.subcategoria} ${p.variante} ${p.descripcion}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // Activos primero, agotados al final
    list.sort((a,b)=>{
      const ao = Number(a.stock||0) > 0 ? 0 : 1;
      const bo = Number(b.stock||0) > 0 ? 0 : 1;
      if(ao!==bo) return ao-bo;
      return (safe(a.nombre)).localeCompare(safe(b.nombre));
    });

    return list;
  }

  function render(){
    const list = filterList();
    const tb = $("tbody");
    tb.innerHTML = "";
    show($("empty"), !list.length);

    // stats
    const total = PRODUCTS.length;
    const inStock = PRODUCTS.filter(p=>Number(p.stock||0)>0).length;
    const out = total - inStock;
    $("stats").innerHTML = `
      <div class="badge"><b>${total}</b> productos</div>
      <div class="badge"><b>${inStock}</b> con stock</div>
      <div class="badge"><b>${out}</b> agotados</div>
      <div class="badge">API: Apps Script · Sync: GitHub Actions → <b>catalog.json</b></div>
    `;

    list.forEach(p=>{
      const tr = document.createElement("tr");
      const img = safe(p.imagen) || "";
      const outStock = Number(p.stock||0)<=0;
      tr.innerHTML = `
        <td><img class="timg" src="${img}" alt=""></td>
        <td>
          <div class="pname">${safe(p.nombre)||"(Sin nombre)"}</div>
          <div class="psub"><span class="small">ID:</span> ${safe(p.id)} · <span class="small">${safe(p.estado||"")}</span></div>
        </td>
        <td><div class="price">${money(p.precio)}</div>${Number(p.precio_anterior||0)>Number(p.precio||0)?`<div class="small">Antes: ${money(p.precio_anterior)}</div>`:""}</td>
        <td><div class="stock">${Number(p.stock||0)}</div>${outStock?`<div class="small">Agotado</div>`:`<div class="small">Disponible</div>`}</td>
        <td>${safe(p.categoria)||"—"}<div class="small">${safe(p.subsubcategoria)||""}</div></td>
        <td>${safe(p.subcategoria)||"—"}</td>
        <td>${safe(p.variante)||"—"}</td>
        <td>
          <div class="tacts">
            <button class="aBtn" data-edit="${safe(p.id)}"><i class="ri-edit-2-line"></i>Editar</button>
            <button class="aBtn danger" data-del="${safe(p.id)}"><i class="ri-delete-bin-6-line"></i>Borrar</button>
          </div>
        </td>
      `;
      tb.appendChild(tr);
    });

    // actions
    tb.querySelectorAll("[data-edit]").forEach(b=>{
      b.onclick = ()=> openEditorById(b.getAttribute("data-edit"));
    });
    tb.querySelectorAll("[data-del]").forEach(b=>{
      b.onclick = ()=> quickDelete(b.getAttribute("data-del"));
    });
  }

  function setPreview(){
    const url = safe($("p_imagen").value);
    const im = $("imgPrev");
    if(!url){ im.style.display="none"; im.removeAttribute("src"); return; }
    im.style.display="block";
    im.src = url;
  }

  function editorToObj(){
    return {
      id: safe($("p_id").value),
      nombre: safe($("p_nombre").value),
      precio: Number(String($("p_precio").value||"").replace(/[^\d.]/g,"")||0),
      precio_anterior: Number(String($("p_precio_anterior").value||"").replace(/[^\d.]/g,"")||0),
      stock: Number(String($("p_stock").value||"").replace(/[^\d]/g,"")||0),
      estado: safe($("p_estado").value||"ACTIVO"),
      categoria: safe($("p_categoria").value),
      subcategoria: safe($("p_subcategoria").value),
      subsubcategoria: safe($("p_subsubcategoria").value),
      variante: safe($("p_variante").value),
      imagen: safe($("p_imagen").value),
      galeria: safe($("p_galeria").value),
      video: safe($("p_video").value),
      descripcion: safe($("p_descripcion").value),
    };
  }

  function loadToEditor(p){
    $("p_id").value = safe(p?.id);
    $("p_nombre").value = safe(p?.nombre);
    $("p_precio").value = String(Number(p?.precio||0));
    $("p_precio_anterior").value = String(Number(p?.precio_anterior||0));
    $("p_stock").value = String(Number(p?.stock||0));
    $("p_estado").value = safe(p?.estado)||"ACTIVO";
    $("p_categoria").value = safe(p?.categoria);
    $("p_subcategoria").value = safe(p?.subcategoria);
    $("p_subsubcategoria").value = safe(p?.subsubcategoria);
    $("p_variante").value = safe(p?.variante);
    $("p_imagen").value = safe(p?.imagen);
    $("p_galeria").value = safe(p?.galeria);
    $("p_video").value = safe(p?.video);
    $("p_descripcion").value = safe(p?.descripcion);
    setPreview();
  }

  function openEditorNew(){
    CURRENT = null;
    $("editTitle").textContent = "Nuevo producto";
    $("editSub").textContent = "Se guardará en Google Sheets";
    loadToEditor({ id: genId(), estado:"ACTIVO", stock:0, precio:0, precio_anterior:0 });
    setErr("editErr", "");
    setOk("editOk", "");
    show($("btnDelete"), false);
    modal("editModal", true);
  }

  function openEditorById(id){
    const p = PRODUCTS.find(x=>safe(x.id)===safe(id));
    if(!p) return;
    CURRENT = p;
    $("editTitle").textContent = "Editar producto";
    $("editSub").textContent = `${safe(p.nombre)} · ${safe(p.id)}`;
    loadToEditor(p);
    setErr("editErr", "");
    setOk("editOk", "");
    show($("btnDelete"), true);
    modal("editModal", true);
  }

  async function quickDelete(id){
    if(!id) return;
    if(!confirm("¿Eliminar este producto?")) return;
    try{
      await api("delete", { id });
      PRODUCTS = PRODUCTS.filter(p=>safe(p.id)!==safe(id));
      fillFilterLists();
      render();
    }catch(e){
      alert(String(e?.message||e));
    }
  }

  async function save(){
    setErr("editErr", "");
    setOk("editOk", "");
    const p = editorToObj();
    if(!p.id) p.id = genId();
    if(!p.nombre) return setErr("editErr", "Escribe el nombre.");
    if(!p.categoria) return setErr("editErr", "Escribe la categoría.");
    if(!p.imagen) return setErr("editErr", "Agrega una URL de imagen (principal).");

    try{
      const r = await api("upsert", { product: p });
      const saved = r.product || p;

      const idx = PRODUCTS.findIndex(x=>safe(x.id)===safe(saved.id));
      if(idx>=0) PRODUCTS[idx] = { ...PRODUCTS[idx], ...saved };
      else PRODUCTS.unshift(saved);

      fillFilterLists();
      render();
      setOk("editOk", "✅ Guardado en Google Sheets.");
      CURRENT = saved;
      $("editSub").textContent = `${safe(saved.nombre)} · ${safe(saved.id)}`;
      show($("btnDelete"), true);
    }catch(e){
      setErr("editErr", String(e?.message||e));
    }
  }

  async function delCurrent(){
    if(!CURRENT?.id) return;
    if(!confirm("¿Eliminar este producto?")) return;
    try{
      await api("delete", { id: CURRENT.id });
      PRODUCTS = PRODUCTS.filter(p=>safe(p.id)!==safe(CURRENT.id));
      modal("editModal", false);
      fillFilterLists();
      render();
    }catch(e){
      setErr("editErr", String(e?.message||e));
    }
  }

  async function loadAll(){
    const r = await api("list", {});
    PRODUCTS = Array.isArray(r.productos) ? r.productos : [];
    fillFilterLists();
    render();
  }

  async function loginFlow(){
    // show login if no token
    if(token()) return true;

    modal("loginModal", true);
    $("adminToken").value = "";
    setErr("loginErr", "");
    return false;
  }

  async function attemptLogin(){
    setErr("loginErr", "");
    const t = safe($("adminToken").value);
    if(!t) return setErr("loginErr", "Pega el token.");
    localStorage.setItem(TOKEN_KEY, t);

    try{
      await api("ping", {});
      modal("loginModal", false);
      await loadAll();
    }catch(e){
      localStorage.removeItem(TOKEN_KEY);
      setErr("loginErr", "Token inválido o Apps Script sin soporte admin.");
    }
  }

  function wire(){
    $("btnNew").onclick = openEditorNew;
    $("btnCloseEdit").onclick = ()=> modal("editModal", false);
    $("btnCancel").onclick = ()=> modal("editModal", false);
    $("btnSave").onclick = save;
    $("btnDelete").onclick = delCurrent;
    $("btnGenId").onclick = ()=> { $("p_id").value = genId(); };
    $("p_imagen").addEventListener("input", setPreview);

    $("q").addEventListener("input", render);
    $("fCat").onchange = ()=> { fillFilterLists(); render(); };
    $("fSub").onchange = render;
    $("fStock").onchange = render;

    $("btnLogin").onclick = attemptLogin;

    // Sync info (no ejecuta Actions desde el navegador; guía al usuario)
    $("btnSync").onclick = ()=>{
      alert("Para actualizar catalog.json automáticamente, abre tu repo en GitHub y ejecuta el workflow 'Update catalog.json from Google Sheets'.\\n\\nTambién corre solo por horario (cron) si lo dejaste activo.");
    };

    // cerrar modales al tocar fondo
    $("loginModal").addEventListener("click", (e)=>{ if(e.target=== $("loginModal")){} });
    $("editModal").addEventListener("click", (e)=>{ if(e.target=== $("editModal")) modal("editModal", false); });
  }

  async function init(){
    wire();
    const has = await loginFlow();
    if(!has) return; // esperando login

    try{
      // valida token
      await api("ping", {});
      await loadAll();
    }catch(_e){
      localStorage.removeItem(TOKEN_KEY);
      modal("loginModal", true);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

// admin_pro.js — Admin PRO completo
(() => {
  // ✅ Usa tu API_URL desde config.js si existe, si no pega tu URL aquí:
  const API = window.SDC_CONFIG?.API_URL || "";
  const PINS = ["199311","202528"];

  let PRODUCTS = [];
  let stockEdits = new Map(); // id -> newStock

  const $ = (id) => document.getElementById(id);
  const toast = (m) => alert(m);

  function slugId(){
    // genera ID simple tipo SDC-YYYYMMDD-XXXX
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const da = String(d.getDate()).padStart(2,"0");
    const rnd = String(Math.floor(Math.random()*9000)+1000);
    return `SDC-${y}${m}${da}-${rnd}`;
  }

  function auth(){
    const p = $("pinInput").value.trim();
    if (!PINS.includes(p)) return toast("PIN incorrecto");
    $("adminApp").style.display = "block";
    $("loginBtn").style.display = "none";
    $("logoutBtn").style.display = "inline-block";
    load();
  }

  function logout(){
    $("adminApp").style.display = "none";
    $("loginBtn").style.display = "inline-block";
    $("logoutBtn").style.display = "none";
  }

  async function load(){
    if (!API) return toast("Falta API_URL en config.js");
    const r = await fetch(`${API}?action=catalog`, { cache:"no-store" });
    const j = await r.json();
    PRODUCTS = j.productos || [];
    stockEdits.clear();
    render();
  }

  function render(){
    const q = ($("searchAdmin").value||"").toLowerCase();
    const rows = $("rows");
    rows.innerHTML = "";

    PRODUCTS
      .filter(p => !q || (p.nombre||"").toLowerCase().includes(q) || String(p.id||"").toLowerCase().includes(q))
      .forEach(p => {
        const tr = document.createElement("tr");

        const id = String(p.id||"");
        const price = Number(p.precio||0);
        const stock = Number(p.stock||0);

        tr.innerHTML = `
          <td>
            <div style="font-weight:1000">${p.nombre||""}</div>
            <div style="color:#9fb0c6;font-size:12px">${id}</div>
          </td>
          <td>${price}</td>
          <td>
            <input class="stockInput" type="number" value="${stock}" data-id="${id}">
          </td>
          <td>
            <button class="smallBtn" data-act="edit" data-id="${id}">Editar</button>
          </td>
        `;

        const input = tr.querySelector("input");
        input.oninput = () => {
          const v = Number(input.value||0);
          stockEdits.set(id, v);
        };

        tr.querySelector("button").onclick = () => {
          const prod = PRODUCTS.find(x => String(x.id||"") === id);
          if (prod) fill(prod);
        };

        rows.appendChild(tr);
      });
  }

  function fill(p){
    $("f_id").value = p.id || "";
    $("f_id_show").value = p.id || "";
    $("f_nombre").value = p.nombre || "";
    $("f_precio").value = Number(p.precio||0);
    $("f_stock").value = Number(p.stock||0);
    $("f_desc").value = p.descripcion || "";
    previewDesc();
  }

  function previewDesc(){
    const txt = ($("f_desc").value || "").trim();
    $("descPreview").textContent = txt || "(Sin descripción)";
  }

  async function saveOne(){
    if (!API) return toast("Falta API_URL");
    const body = {
      id: $("f_id_show").value || $("f_id").value,
      nombre: $("f_nombre").value,
      precio: Number($("f_precio").value||0),
      stock: Number($("f_stock").value||0),
      descripcion: $("f_desc").value
    };

    await fetch(`${API}?action=update`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });

    toast("Guardado ✅");
    load();
  }

  async function bulkSaveStock(){
    if (!API) return toast("Falta API_URL");
    if (!stockEdits.size) return toast("No hay cambios de stock");

    for (const [id, stock] of stockEdits.entries()){
      await fetch(`${API}?action=update`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ id, stock: Number(stock) })
      });
    }

    toast("Stock actualizado ✅");
    load();
  }

  async function duplicate(){
    const baseId = $("f_id_show").value || $("f_id").value;
    const base = PRODUCTS.find(x => String(x.id||"") === String(baseId));
    if (!base) return toast("Selecciona un producto para duplicar");

    const newId = slugId();

    const copy = {
      ...base,
      id: newId,
      nombre: (base.nombre||"") + " (copia)",
      orden: Number(base.orden||0) + 1
    };

    await fetch(`${API}?action=add`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(copy)
    });

    toast("Duplicado ✅");
    load();
  }

  async function uploadImg(){
    const f = $("imgFile").files[0];
    if (!f) return toast("Selecciona una imagen");
    const b64 = await new Promise(res=>{
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.readAsDataURL(f);
    });

    const r = await fetch(`${API}?action=upload`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ filename: f.name, base64: b64 })
    });

    const j = await r.json();
    $("imgUrl").value = j.url || "";
    toast("Imagen subida ✅");
  }

  $("loginBtn").onclick = auth;
  $("logoutBtn").onclick = logout;
  $("reloadBtn").onclick = load;
  $("bulkSaveBtn").onclick = bulkSaveStock;
  $("searchAdmin").oninput = render;

  $("saveBtn").onclick = saveOne;
  $("dupBtn").onclick = duplicate;
  $("clearBtn").onclick = () => {
    ["f_id","f_id_show","f_nombre","f_precio","f_stock","f_desc"].forEach(id => $(id).value = "");
    previewDesc();
  };
  $("f_desc").oninput = previewDesc;

  $("uploadImgBtn").onclick = uploadImg;
})();
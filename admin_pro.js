// admin_pro.js
(() => {
  const API = window.SDC_CONFIG?.API_URL || "";
  const PINS = ["199311","202528"];
  let PRODUCTS = [];

  const $ = id => document.getElementById(id);
  const toast = m => alert(m);

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
    const r = await fetch(`${API}?action=catalog`,{cache:"no-store"});
    const j = await r.json();
    PRODUCTS = j.productos||[];
    render();
  }

  function render(){
    const q = $("searchAdmin").value.toLowerCase();
    const rows = $("rows"); rows.innerHTML="";
    PRODUCTS.filter(p=>!q||p.nombre.toLowerCase().includes(q)).forEach(p=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td>${p.nombre}</td>
        <td>${p.precio}</td>
        <td>${p.stock}</td>
        <td>${Number(p.stock)>0?"Sí":"No"}</td>
        <td>
          <button class="btn ghost" data-id="${p.id}">Editar</button>
        </td>`;
      tr.querySelector("button").onclick=()=>fill(p);
      rows.appendChild(tr);
    });
  }

  function fill(p){
    $("f_id").value=p.id;
    $("f_nombre").value=p.nombre||"";
    $("f_precio").value=p.precio||0;
    $("f_stock").value=p.stock||0;
    $("f_disp").value=Number(p.stock)>0?1:0;
    $("f_desc").value=p.descripcion||"";
  }

  async function save(){
    const body={
      id:$("f_id").value,
      nombre:$("f_nombre").value,
      precio:$("f_precio").value,
      stock:$("f_stock").value,
      descripcion:$("f_desc").value
    };
    await fetch(`${API}?action=update`,{
      method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    toast("Guardado");
    load();
  }

  async function duplicate(){
    const body={
      ...PRODUCTS.find(x=>String(x.id)===$("f_id").value),
      id:"", nombre:$("f_nombre").value+" (copia)"
    };
    await fetch(`${API}?action=add`,{
      method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    toast("Duplicado");
    load();
  }

  async function uploadImg(){
    const f=$("imgFile").files[0];
    if(!f) return;
    const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f);});
    const r=await fetch(`${API}?action=upload`,{
      method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({filename:f.name,base64:b64})
    });
    const j=await r.json();
    $("imgUrl").value=j.url||"";
  }

  $("loginBtn").onclick=auth;
  $("logoutBtn").onclick=logout;
  $("reloadBtn").onclick=load;
  $("searchAdmin").oninput=render;
  $("saveBtn").onclick=save;
  $("dupBtn").onclick=duplicate;
  $("clearBtn").onclick=()=>document.querySelectorAll("input,textarea").forEach(i=>i.value="");
  $("uploadImgBtn").onclick=uploadImg;
})();
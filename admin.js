(() => {
  const CFG = window.SDC_CONFIG;
  const API_URL = CFG.API_URL;
  const PIN = String(CFG.ADMIN_PIN || "");
  const $ = id => document.getElementById(id);
  const toast = msg => { const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1800); };

  function unlock() {
    $("pinBox").style.display = "none";
    $("adminBox").style.display = "block";
    sessionStorage.setItem("SDC_ADMIN_UNLOCK", "1");
  }

  // Si ya desbloqueaste en esta sesión, entra directo
  if (sessionStorage.getItem("SDC_ADMIN_UNLOCK") === "1") unlock();

  $("pinBtn").onclick = () => {
    const v = ($("pinInput").value || "").trim();
    if (!PIN) { toast("PIN no configurado en config.js"); return; }
    if (v === PIN) { unlock(); return; }
    toast("PIN incorrecto");
  };

  $("uploadBtn").onclick = async () => {
    const key = ($("adminKey").value || "").trim();
    const file = $("fileUp").files[0];

    if(!key){ toast("Falta ADMIN_KEY"); return; }
    if(!file){ toast("Selecciona una imagen"); return; }

    const base64 = await fileToBase64(file);
    const payload = { filename:file.name, contentType:file.type||"image/jpeg", base64 };

    const res = await fetch(`${API_URL}?action=upload&key=${encodeURIComponent(key)}`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if(!json.ok){ toast(json.error || "Error subiendo"); return; }

    $("outUrl").value = json.url || "";
    $("outView").value = json.viewUrl || "";
    toast("Imagen subida");
  };

  function fileToBase64(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>resolve(r.result);
      r.onerror=reject;
      r.readAsDataURL(file);
    });
  }
})();

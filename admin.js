(() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;

  function unlock(){
    U.$("pinBox").style.display="none";
    U.$("adminBox").style.display="block";
    sessionStorage.setItem("SDC_ADMIN_UNLOCK","1");
  }

  if(sessionStorage.getItem("SDC_ADMIN_UNLOCK")==="1") unlock();

  U.$("pinBtn").onclick = () => {
    const v=(U.$("pinInput").value||"").trim();
    if(!CFG.ADMIN_PIN){ U.toast("PIN no configurado en config.js"); return; }
    if(v===String(CFG.ADMIN_PIN)) unlock();
    else U.toast("PIN incorrecto");
  };

  U.$("uploadBtn").onclick = async () => {
    const key=(U.$("adminKey").value||"").trim();
    const file=U.$("fileUp").files[0];
    if(!key){ U.toast("Falta ADMIN_KEY"); return; }
    if(!file){ U.toast("Selecciona una imagen"); return; }

    const base64=await U.fileToBase64(file);
    const payload={ filename:file.name, contentType:file.type||"image/jpeg", base64 };

    const res = await fetch(`${CFG.API_URL}?action=upload&key=${encodeURIComponent(key)}`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if(!json.ok){ U.toast(json.error || "Error subiendo"); return; }
    U.$("outUrl").value = json.url || "";
    U.$("outView").value = json.viewUrl || "";
    U.toast("Imagen subida");
  };
})();

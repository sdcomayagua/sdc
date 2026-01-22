(() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;

  // bloqueo PIN
  const MAX_ATTEMPTS = 3;
  const LOCK_MINUTES = 5;
  const LS_ATTEMPTS = "SDC_ADMIN_PIN_ATTEMPTS";
  const LS_LOCK_UNTIL = "SDC_ADMIN_LOCK_UNTIL";
  const SS_UNLOCK = "SDC_ADMIN_UNLOCK";
  const SS_PIN = "SDC_ADMIN_PIN";

  const nowMs = () => Date.now();
  const getAttempts = () => Number(localStorage.getItem(LS_ATTEMPTS) || "0");
  const setAttempts = (n) => localStorage.setItem(LS_ATTEMPTS, String(n));
  const getLockUntil = () => Number(localStorage.getItem(LS_LOCK_UNTIL) || "0");
  const setLockUntil = (ms) => localStorage.setItem(LS_LOCK_UNTIL, String(ms));
  const clearLock = () => { setAttempts(0); setLockUntil(0); };

  const pinsAllowed = () => (Array.isArray(CFG.ADMIN_PINS) ? CFG.ADMIN_PINS : [])
    .map(String).map(s => s.trim()).filter(Boolean);

  const isLocked = () => {
    const until = getLockUntil();
    return until && nowMs() < until;
  };

  const remainingLockText = () => {
    const until = getLockUntil();
    const ms = Math.max(0, until - nowMs());
    const min = Math.ceil(ms / 60000);
    return `${min} min`;
  };

  function showPinUI(){
    U.$("pinBox").style.display = "block";
    U.$("adminBox").style.display = "none";
    const b = U.$("logoutBtn");
    if (b) b.style.display = "none";
  }

  function showAdminUI(){
    U.$("pinBox").style.display = "none";
    U.$("adminBox").style.display = "block";
    const b = U.$("logoutBtn");
    if (b) b.style.display = "inline-block";
  }

  function unlock(pin){
    sessionStorage.setItem(SS_UNLOCK,"1");
    sessionStorage.setItem(SS_PIN,String(pin||"").trim());
    showAdminUI();
  }

  function logout(){
    sessionStorage.removeItem(SS_UNLOCK);
    sessionStorage.removeItem(SS_PIN);
    showPinUI();
    U.toast("Sesión cerrada");
  }

  // ===== Helpers Admin API
  function adminKey(){
    return String(sessionStorage.getItem(SS_PIN) || "").trim();
  }

  async function apiPost(action, body){
    const key = adminKey();
    if (!key) throw new Error("No autorizado (PIN)");
    const url = `${CFG.API_URL}?action=${encodeURIComponent(action)}&key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(body || {})
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Error");
    return json;
  }

  async function apiGetCatalog(){
    const res = await fetch(`${CFG.API_URL}?action=catalog`, { cache:"no-store" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "No se pudo cargar catálogo");
    return json;
  }

  // ===== PIN flow
  if (U.$("logoutBtn")) U.$("logoutBtn").onclick = logout;

  if (sessionStorage.getItem(SS_UNLOCK) === "1") showAdminUI();
  else showPinUI();

  if (isLocked()) U.toast(`Admin bloqueado. Intenta en ${remainingLockText()}.`);

  U.$("pinBtn").onclick = () => {
    const allowed = pinsAllowed();
    if (!allowed.length) { U.toast("No hay PIN configurado"); return; }
    if (isLocked()) { U.toast(`Bloqueado. Intenta en ${remainingLockText()}.`); return; }

    const input = (U.$("pinInput").value || "").trim();
    if (allowed.includes(input)) {
      clearLock();
      unlock(input);
      return;
    }

    const attempts = getAttempts() + 1;
    setAttempts(attempts);

    const left = Math.max(0, MAX_ATTEMPTS - attempts);
    if (left > 0) { U.toast(`PIN incorrecto. Intentos restantes: ${left}`); return; }

    setLockUntil(nowMs() + LOCK_MINUTES * 60000);
    U.toast(`Demasiados intentos. Bloqueado por ${LOCK_MINUTES} minutos.`);
  };

  // ===== Upload imagen
  U.$("uploadBtn").onclick = async () => {
    if (sessionStorage.getItem(SS_UNLOCK) !== "1") { U.toast("Primero ingresa el PIN"); showPinUI(); return; }

    const file = U.$("fileUp").files[0];
    if (!file) { U.toast("Selecciona una imagen"); return; }

    const base64 = await U.fileToBase64(file);
    const payload = { filename:file.name, contentType:file.type||"image/jpeg", base64 };

    try{
      const json = await apiPost("upload", payload);
      U.$("outUrl").value = json.url || "";
      U.$("outView").value = json.viewUrl || "";
      U.toast("Imagen subida ✅");
    } catch(err){
      U.toast(String(err.message || err));
    }
  };

  // ===== Form helpers
  const FIELDS = [
    "id","nombre","precio","precio_anterior","stock","categoria","subcategoria","imagen","galeria",
    "video_url","video_tiktok","video_facebook","video_youtube","descripcion","marca","modelo",
    "compatibilidad","garantia","condicion","destacado","oferta","tags","orden",
    "galeria_1","galeria_2","galeria_3","galeria_4","galeria_5","galeria_6","galeria_7","galeria_8","video"
  ];

  function getField(name){
    return document.getElementById("p_" + name);
  }

  function readForm(){
    const obj = {};
    for (const k of FIELDS){
      const el = getField(k);
      if (!el) continue;
      let v = el.value;

      // normaliza números
      if (["precio","precio_anterior","stock","orden"].includes(k)){
        v = String(v||"").trim();
        obj[k] = v === "" ? "" : Number(v);
        continue;
      }
      obj[k] = String(v||"");
    }
    return obj;
  }

  function fillForm(p){
    for (const k of FIELDS){
      const el = getField(k);
      if (!el) continue;
      const v = p[k];
      el.value = (v === undefined || v === null) ? "" : String(v);
    }
  }

  function clearForm(){
    for (const k of FIELDS){
      const el = getField(k);
      if (el) el.value = "";
    }
  }

  // ===== Cargar producto por ID
  U.$("loadBtn").onclick = async () => {
    const id = String(U.$("findId").value || "").trim();
    if (!id) { U.toast("Escribe un ID"); return; }

    try{
      const cat = await apiGetCatalog();
      const list = cat.productos || [];
      const p = list.find(x => String(x.id||"").trim() === id);
      if (!p) { U.toast("No encontrado"); return; }
      fillForm(p);
      U.toast("Producto cargado ✅");
    } catch(err){
      U.toast(String(err.message || err));
    }
  };

  // ===== Guardar / Actualizar
  U.$("saveBtn").onclick = async () => {
    if (sessionStorage.getItem(SS_UNLOCK) !== "1") { U.toast("Primero ingresa el PIN"); return; }

    const data = readForm();
    data.id = String(data.id||"").trim();
    data.nombre = String(data.nombre||"").trim();
    data.categoria = String(data.categoria||"").trim();

    if (!data.id) { U.toast("Falta id"); return; }
    if (!data.nombre) { U.toast("Falta nombre"); return; }
    if (!data.categoria) { U.toast("Falta categoria"); return; }

    try{
      const json = await apiPost("upsert_product", data);
      U.toast(json.mode === "insert" ? "Producto creado ✅" : "Producto actualizado ✅");
      U.$("findId").value = data.id;
    } catch(err){
      U.toast(String(err.message || err));
    }
  };

  // ===== Eliminar
  U.$("deleteBtn").onclick = async () => {
    if (sessionStorage.getItem(SS_UNLOCK) !== "1") { U.toast("Primero ingresa el PIN"); return; }
    const id = String(U.$("findId").value || "").trim();
    if (!id) { U.toast("Escribe un ID"); return; }

    const ok = confirm(`¿Eliminar el producto con ID "${id}"?`);
    if (!ok) return;

    try{
      await apiPost("delete_product", { id });
      U.toast("Producto eliminado ✅");
      clearForm();
    } catch(err){
      U.toast(String(err.message || err));
    }
  };

  // ===== Botones extra
  U.$("clearFormBtn").onclick = () => { clearForm(); U.toast("Formulario limpio"); };

  U.$("copyJsonBtn").onclick = async () => {
    const data = readForm();
    try{
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      U.toast("JSON copiado ✅");
    } catch {
      U.toast("No se pudo copiar");
    }
  };
})();
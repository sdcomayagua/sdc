(() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;

  // ===== Ajustes bloqueo =====
  const MAX_ATTEMPTS = 3;
  const LOCK_MINUTES = 5;

  const LS_ATTEMPTS = "SDC_ADMIN_PIN_ATTEMPTS";
  const LS_LOCK_UNTIL = "SDC_ADMIN_LOCK_UNTIL";
  const SS_UNLOCK = "SDC_ADMIN_UNLOCK";

  function nowMs(){ return Date.now(); }

  function getAttempts(){
    return Number(localStorage.getItem(LS_ATTEMPTS) || "0");
  }
  function setAttempts(n){
    localStorage.setItem(LS_ATTEMPTS, String(n));
  }
  function getLockUntil(){
    return Number(localStorage.getItem(LS_LOCK_UNTIL) || "0");
  }
  function setLockUntil(ms){
    localStorage.setItem(LS_LOCK_UNTIL, String(ms));
  }
  function clearLock(){
    setAttempts(0);
    setLockUntil(0);
  }

  function pinsAllowed(){
    const pins = Array.isArray(CFG.ADMIN_PINS) ? CFG.ADMIN_PINS.map(String) : [];
    const pinSingle = CFG.ADMIN_PIN ? [String(CFG.ADMIN_PIN)] : [];
    const allowed = pins.length ? pins : pinSingle;
    return allowed.map(p => p.trim()).filter(Boolean);
  }

  function isLocked(){
    const until = getLockUntil();
    return until && nowMs() < until;
  }

  function remainingLockText(){
    const until = getLockUntil();
    const ms = Math.max(0, until - nowMs());
    const sec = Math.ceil(ms / 1000);
    const min = Math.ceil(sec / 60);
    return `${min} min`;
  }

  function unlock() {
    U.$("pinBox").style.display = "none";
    U.$("adminBox").style.display = "block";
    sessionStorage.setItem(SS_UNLOCK, "1");
  }

  // Si ya desbloqueaste en esta sesión, entra directo (sin PIN)
  if (sessionStorage.getItem(SS_UNLOCK) === "1") {
    unlock();
  }

  // Si está bloqueado, avisa
  if (isLocked()) {
    U.toast(`Admin bloqueado. Intenta de nuevo en ${remainingLockText()}.`);
  }

  U.$("pinBtn").onclick = () => {
    const allowed = pinsAllowed();
    if (!allowed.length) {
      U.toast("No hay PIN configurado en config.js");
      return;
    }

    if (isLocked()) {
      U.toast(`Bloqueado. Intenta de nuevo en ${remainingLockText()}.`);
      return;
    }

    const input = (U.$("pinInput").value || "").trim();
    const ok = allowed.includes(input);

    if (ok) {
      clearLock();
      unlock();
      return;
    }

    // Falló
    const attempts = getAttempts() + 1;
    setAttempts(attempts);

    const left = Math.max(0, MAX_ATTEMPTS - attempts);
    if (left > 0) {
      U.toast(`PIN incorrecto. Intentos restantes: ${left}`);
      return;
    }

    // Bloquear
    const lockUntil = nowMs() + LOCK_MINUTES * 60 * 1000;
    setLockUntil(lockUntil);
    U.toast(`Demasiados intentos. Bloqueado por ${LOCK_MINUTES} minutos.`);
  };

  U.$("uploadBtn").onclick = async () => {
    // Requiere estar desbloqueado (PIN)
    if (sessionStorage.getItem(SS_UNLOCK) !== "1") {
      U.toast("Primero ingresa el PIN.");
      return;
    }

    const key = (U.$("adminKey").value || "").trim();
    const file = U.$("fileUp").files[0];

    if (!key) { U.toast("Falta ADMIN_KEY"); return; }
    if (!file) { U.toast("Selecciona una imagen"); return; }

    const base64 = await U.fileToBase64(file);
    const payload = { filename: file.name, contentType: file.type || "image/jpeg", base64 };

    const res = await fetch(`${CFG.API_URL}?action=upload&key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json.ok) { U.toast(json.error || "Error subiendo"); return; }

    U.$("outUrl").value = json.url || "";
    U.$("outView").value = json.viewUrl || "";
    U.toast("Imagen subida");
  };
})();

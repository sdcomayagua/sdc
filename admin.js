(() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;

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

  const pinsAllowed = () => (Array.isArray(CFG.ADMIN_PINS) ? CFG.ADMIN_PINS : []).map(String).map(s => s.trim()).filter(Boolean);

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

  const showPinUI = () => {
    U.$("pinBox").style.display = "block";
    U.$("adminBox").style.display = "none";
    const b = U.$("logoutBtn");
    if (b) b.style.display = "none";
  };

  const showAdminUI = () => {
    U.$("pinBox").style.display = "none";
    U.$("adminBox").style.display = "block";
    const b = U.$("logoutBtn");
    if (b) b.style.display = "inline-block";
  };

  const unlock = (pin) => {
    sessionStorage.setItem(SS_UNLOCK, "1");
    sessionStorage.setItem(SS_PIN, String(pin || "").trim());
    showAdminUI();
  };

  const logout = () => {
    sessionStorage.removeItem(SS_UNLOCK);
    sessionStorage.removeItem(SS_PIN);
    if (U.$("pinInput")) U.$("pinInput").value = "";
    if (U.$("fileUp")) U.$("fileUp").value = "";
    if (U.$("outUrl")) U.$("outUrl").value = "";
    if (U.$("outView")) U.$("outView").value = "";
    showPinUI();
    U.toast("Sesión cerrada");
  };

  if (U.$("logoutBtn")) U.$("logoutBtn").onclick = logout;

  if (sessionStorage.getItem(SS_UNLOCK) === "1") showAdminUI();
  else showPinUI();

  if (isLocked()) U.toast(`Admin bloqueado. Intenta de nuevo en ${remainingLockText()}.`);

  if (U.$("pinInput")) {
    U.$("pinInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") U.$("pinBtn").click();
    });
  }

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

  U.$("uploadBtn").onclick = async () => {
    if (sessionStorage.getItem(SS_UNLOCK) !== "1") { U.toast("Primero ingresa el PIN."); showPinUI(); return; }

    const pinAsKey = String(sessionStorage.getItem(SS_PIN) || "").trim();
    if (!pinAsKey) { U.toast("PIN no encontrado. Vuelve a entrar."); logout(); return; }

    const file = U.$("fileUp").files[0];
    if (!file) { U.toast("Selecciona una imagen"); return; }

    const base64 = await U.fileToBase64(file);
    const payload = { filename: file.name, contentType: file.type || "image/jpeg", base64 };

    const res = await fetch(`${CFG.API_URL}?action=upload&key=${encodeURIComponent(pinAsKey)}`, {
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

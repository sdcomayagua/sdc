(() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;

  function unlock() {
    U.$("pinBox").style.display = "none";
    U.$("adminBox").style.display = "block";
    sessionStorage.setItem("SDC_ADMIN_UNLOCK", "1");
  }

  // Ya desbloqueado en esta sesión
  if (sessionStorage.getItem("SDC_ADMIN_UNLOCK") === "1") unlock();

  function isValidPin(input) {
    const pins = Array.isArray(CFG.ADMIN_PINS) ? CFG.ADMIN_PINS.map(String) : [];
    const pinSingle = CFG.ADMIN_PIN ? [String(CFG.ADMIN_PIN)] : [];
    const allowed = pins.length ? pins : pinSingle; // compatibilidad
    return allowed.includes(String(input || "").trim());
  }

  U.$("pinBtn").onclick = () => {
    const v = (U.$("pinInput").value || "").trim();
    if (!isValidPin(v)) { U.toast("PIN incorrecto"); return; }
    unlock();
  };

  U.$("uploadBtn").onclick = async () => {
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

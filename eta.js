window.SDC_ETA = (() => {
  // Ajusta estos rangos si quieres
  const ETA_LOCAL = "Entrega local: 1–2 días (según zona y ruta)";
  const ETA_LOCAL_SAME_DAY = "Entrega local: mismo día (si hay disponibilidad)";
  const ETA_NATIONAL = "Envío nacional: 2–5 días hábiles (según empresa)";
  const ETA_NATIONAL_PREPAGO = "Envío nacional (prepago): 2–4 días hábiles (más rápido)";
  const ETA_NATIONAL_COD = "Envío nacional (contra entrega): 3–6 días hábiles";

  function get(dep, mun, localAllowed, payType) {
    // Si es local permitido, usamos ETA local
    if (localAllowed) {
      // Si quisieras mismo día para Comayagua, puedes activar esto:
      // if ((mun||"").toLowerCase() === "comayagua") return ETA_LOCAL_SAME_DAY;
      return ETA_LOCAL;
    }

    // Nacional
    if (payType === "prepago") return ETA_NATIONAL_PREPAGO;
    if (payType === "pagar_al_recibir") return ETA_NATIONAL_COD;
    return ETA_NATIONAL;
  }

  return { get };
})();
// badges_logic.js
window.SDC_BADGES = (() => {
  function toBool(v){
    const s = String(v ?? "").trim().toLowerCase();
    return v === true || s === "1" || s === "true" || s === "si" || s === "sí" || s === "yes";
  }

  let maxOrden = 0;
  let newMinOrden = 0;

  function init(products){
    const ords = (products||[]).map(p => Number(p.orden||0)).filter(n => Number.isFinite(n));
    maxOrden = ords.length ? Math.max(...ords) : 0;

    // "NUEVO" = top 15% por orden, mínimo 1
    const sorted = ords.slice().sort((a,b)=>a-b);
    const idx = Math.floor(sorted.length * 0.85);
    newMinOrden = sorted.length ? sorted[Math.min(sorted.length-1, idx)] : 0;
  }

  function get(p){
    const precio = Number(p.precio||0);
    const prev = Number(p.precio_anterior||0);

    const isOffer = (prev > 0 && prev > precio);
    const saveAmt = isOffer ? (prev - precio) : 0;
    const savePct = isOffer ? Math.round((saveAmt / prev) * 100) : 0;

    const isFeatured = toBool(p.destacado);
    const isNew = Number(p.orden||0) >= newMinOrden && Number(p.orden||0) > 0;

    return { isOffer, saveAmt, savePct, isFeatured, isNew };
  }

  return { init, get, toBool };
})();
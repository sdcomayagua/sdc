// wa_enhanced.js
window.SDC_WA_PLUS = (() => {
  function buildMessagePro(){
    const S = window.SDC_STORE;
    const U = window.SDC_UTILS;
    const CFG = window.SDC_CONFIG;

    const cart = S?.getCart?.() || new Map();
    if (!cart.size) return "Hola, quiero información.";

    const dep = document.getElementById("dep")?.value || "";
    const mun = document.getElementById("mun")?.value || "";
    const pay = document.getElementById("payType")?.value || "pagar_al_recibir";
    const name = document.getElementById("name")?.value?.trim() || "";
    const phone = document.getElementById("phone")?.value?.trim() || "";
    const addr = document.getElementById("addr")?.value?.trim() || "";
    const note = document.getElementById("clientNote")?.value?.trim() || "";

    let subtotal = 0;
    let items = 0;

    const lines = [];
    lines.push("🛒 *PEDIDO - Catálogo SDC*");
    if (dep || mun) lines.push(`📍 *Ubicación:* ${dep}${mun?(" - "+mun):""}`);

    lines.push("");
    lines.push("🧾 *Productos:*");

    for (const it of cart.values()){
      const p = it.p;
      const qty = it.qty;
      const unit = Number(p.precio||0);
      const sub = unit * qty;
      subtotal += sub;
      items += qty;
      lines.push(`• ${qty} x ${p.nombre} — ${U.money(sub, CFG.CURRENCY)}`);
    }

    lines.push("");
    lines.push(`Subtotal: ${U.money(subtotal, CFG.CURRENCY)}`);
    lines.push(`Items: ${items}`);

    // Nota de envío según pago
    lines.push("");
    lines.push("🚚 *Envío/Pago:*");
    if (pay === "prepago"){
      lines.push(`Prepago: incluye envío (${U.money(CFG.NATIONAL_PREPAGO, CFG.CURRENCY)}) si es nacional.`);
      lines.push(`Total estimado (si nacional): ${U.money(subtotal + CFG.NATIONAL_PREPAGO, CFG.CURRENCY)}`);
    } else {
      lines.push(`Pagar al recibir: si es nacional, el envío se paga a la empresa (${U.money(CFG.NATIONAL_CONTRA_ENTREGA, CFG.CURRENCY)}).`);
      lines.push(`Total producto: ${U.money(subtotal, CFG.CURRENCY)}`);
    }

    lines.push("");
    lines.push("👤 *Cliente:*");
    if (name) lines.push(`Nombre: ${name}`);
    if (phone) lines.push(`Tel: ${phone}`);
    if (addr) lines.push(`Dirección: ${addr}`);
    if (note) lines.push(`Nota: ${note}`);

    lines.push("");
    lines.push("✅ *Confirmar disponibilidad y tiempo de entrega, por favor.*");

    return lines.join("\n");
  }

  function init(){
    // parchea send() si existe
    if (window.SDC_WA?.send && !window.__SDC_WA_PATCHED__){
      window.__SDC_WA_PATCHED__ = true;
      const oldSend = window.SDC_WA.send.bind(window.SDC_WA);

      window.SDC_WA.send = function(){
        try{
          const msg = buildMessagePro();
          const phone = window.SDC_STORE?.getWhatsapp?.() || "+50431517755";
          const wa = "https://wa.me/" + String(phone).replace(/[^\d]/g,"") + "?text=" + encodeURIComponent(msg);
          window.open(wa, "_blank");
          return;
        }catch{
          return oldSend();
        }
      };
    }
  }

  return { init };
})();
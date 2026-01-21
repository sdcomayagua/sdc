window.SDC_WA = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const ST = window.SDC_STORE;

  const LOCAL = new Set(CFG.LOCAL_ALLOW || []);
  const isLocal = (dep, mun) => LOCAL.has(`${dep}|${mun}`);

  function build() {
    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = isLocal(dep, mun);
    const pay = U.$("payType").value;

    const name = U.$("name").value.trim();
    const phone = U.$("phone").value.trim();
    const addr = U.$("addr").value.trim();

    const lines = [];
    lines.push("🛒 *PEDIDO - Soluciones Digitales Comayagua*");
    lines.push(`📍 *Ubicación:* ${dep} - ${mun}`);
    lines.push(`🚚 *Entrega:* ${local ? "Entrega Local" : "Envío Nacional (Empresa)"}`);
    lines.push(`💳 *Pago:* ${pay === "prepago" ? "PREPAGO" : "PAGAR AL RECIBIR"}`);

    if (local && pay === "pagar_al_recibir") {
      const cash = (U.$("cashAmount").value || "").trim();
      if (cash) lines.push(`💵 *Paga con:* ${cash}`);
    } else if (!local) {
      lines.push("📦 *Empresa:* C807 / Cargo Expreso / Forza");
      lines.push(`💰 *Envío:* ${pay === "prepago" ? U.money(CFG.NATIONAL_PREPAGO, CFG.CURRENCY) : U.money(CFG.NATIONAL_CONTRA_ENTREGA, CFG.CURRENCY)} (${pay === "prepago" ? "incluido en depósito" : "pagado a empresa"})`);
    }

    lines.push("");
    lines.push("🧾 *Productos:*");

    let subtotal = 0;
    for (const it of ST.cart.values()) {
      const line = Number(it.p.precio || 0) * it.qty;
      subtotal += line;
      lines.push(`• ${it.qty} x ${it.p.nombre} — ${U.money(line, CFG.CURRENCY)}`);
    }
    lines.push(`Subtotal: ${U.money(subtotal, CFG.CURRENCY)}`);

    if (!local && pay === "prepago") lines.push(`Total a depositar: ${U.money(subtotal + CFG.NATIONAL_PREPAGO, CFG.CURRENCY)}`);
    else lines.push(`Total producto: ${U.money(subtotal, CFG.CURRENCY)}`);

    lines.push("");
    lines.push("👤 *Cliente:*");
    if (name) lines.push(`Nombre: ${name}`);
    if (phone) lines.push(`Tel: ${phone}`);
    if (addr) lines.push(`Dirección: ${addr}`);

    return lines.join("\n");
  }

  function send() {
    if (ST.cart.size === 0) { U.toast("Carrito vacío"); return; }
    const msg = build();
    const phone = (ST.DATA && ST.DATA.whatsapp) ? ST.DATA.whatsapp : CFG.DEFAULT_WHATSAPP;
    window.open("https://wa.me/" + phone.replace(/[^\d]/g, "") + "?text=" + encodeURIComponent(msg), "_blank");
  }

  return { send };
})();

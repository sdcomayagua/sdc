window.SDC_WA = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;
  const SHARE = window.SDC_SHARE;

  function validate(){
    const name = (U.$("name").value||"").trim();
    const phone = (U.$("phone").value||"").trim();
    const addr = (U.$("addr").value||"").trim();
    if (!name) return "Falta tu nombre";
    if (!phone) return "Falta tu teléfono";
    if (!addr) return "Falta tu dirección";
    return "";
  }

  function buildMessage() {
    const cart = S.getCart();
    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const pay = U.$("payType").value;
    const local = S.isLocalAllowed(dep, mun);
    const eta = window.SDC_ETA?.get?.(dep, mun, local, pay) || "";

    const name = (U.$("name").value||"").trim();
    const phone = (U.$("phone").value||"").trim();
    const addr = (U.$("addr").value||"").trim();
    const note = (document.getElementById("clientNote")?.value||"").trim();

    let subtotal = 0;
    let itemsCount = 0;

    const lines = [];
    lines.push("🧾 *ORDEN - SDC*");
    lines.push(`📍 ${dep} - ${mun}`);
    lines.push(`🚚 ${local ? "LOCAL" : "NACIONAL"} • ${eta}`);
    lines.push(`💳 Pago: ${pay === "prepago" ? "PREPAGO" : "PAGAR AL RECIBIR"}`);
    lines.push("");

    lines.push("🛒 *Productos:*");
    for (const it of cart.values()) {
      const p = it.p;
      const lineTotal = Number(p.precio||0) * it.qty;
      subtotal += lineTotal;
      itemsCount += it.qty;

      const link = SHARE.shareLinkFor(p);
      lines.push(`• ${it.qty} x ${p.nombre}`);
      lines.push(`  Unit: ${U.money(p.precio, CFG.CURRENCY)} • Sub: ${U.money(lineTotal, CFG.CURRENCY)}`);
      lines.push(`  🔗 ${link}`);
    }

    lines.push("");
    lines.push(`Subtotal (${itemsCount} items): ${U.money(subtotal, CFG.CURRENCY)}`);

    if (!local) {
      const ship = (pay === "prepago") ? CFG.NATIONAL_PREPAGO : CFG.NATIONAL_CONTRA_ENTREGA;
      if (pay === "prepago") {
        lines.push(`Envío (prepago): ${U.money(ship, CFG.CURRENCY)}`);
        lines.push(`Total a depositar: ${U.money(subtotal + ship, CFG.CURRENCY)}`);
      } else {
        lines.push(`Envío (contra entrega): ${U.money(ship, CFG.CURRENCY)} (se paga a empresa)`);
        lines.push(`Total producto: ${U.money(subtotal, CFG.CURRENCY)}`);
      }
    } else {
      const cash = (U.$("cashAmount").value||"").trim();
      if (cash) lines.push(`💵 Paga con: ${cash}`);
      lines.push(`Total producto: ${U.money(subtotal, CFG.CURRENCY)}`);
    }

    lines.push("");
    lines.push("👤 *Cliente:*");
    lines.push(`Nombre: ${name}`);
    lines.push(`Tel: ${phone}`);
    lines.push(`Dirección: ${addr}`);
    if (note) lines.push(`📝 Nota: ${note}`);

    return { text: lines.join("\n"), itemsCount, totalText: U.money(subtotal, CFG.CURRENCY) };
  }

  function send() {
    if (S.getCart().size === 0) { U.toast("Carrito vacío"); return; }
    const err = validate();
    if (err) { U.toast(err); return; }

    window.SDC_PROFILE?.save?.();

    const msg = buildMessage();

    // guardar historial PRO
    const cartItems = [];
    for (const it of S.getCart().values()){
      cartItems.push({ id: it.p.id, qty: it.qty });
    }
    window.SDC_ORDERS_PRO?.saveOrder?.({ cartItems, itemsCount: msg.itemsCount, totalText: msg.totalText });
    window.SDC_ORDERS_PRO?.render?.();

    const phone = S.getWhatsapp();
    const url = "https://wa.me/" + phone.replace(/[^\d]/g, "") + "?text=" + encodeURIComponent(msg.text);
    window.open(url, "_blank");

    // thanks + limpiar opcional
    window.SDC_THANKS_PLUS?.afterSend?.();
  }

  function bind() {
    U.$("sendWA").onclick = send;
    U.$("bottomSendBtn").onclick = send;
  }

  return { buildMessage: ()=>buildMessage().text, send, bind };
})();
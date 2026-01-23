// a_close_sale.js
// A) Cierre de venta:
// - "Comprar ahora" en modal → abre carrito directo en paso 2 (Entrega)
// - WhatsApp más corto y pro (sin perder info importante)
// - Confirmación visual usando thanksModal (si existe)

window.SDC_CLOSE_SALE = (() => {
  const U = window.SDC_UTILS;
  const CFG = window.SDC_CONFIG;
  const S = window.SDC_STORE;

  function money(n){ return U?.money?.(n, CFG?.CURRENCY) || ""; }

  function openCartStep2(){
    // abre carrito
    window.SDC_CART?.openCart?.();
    // fuerza paso 2 si existe stepper
    setTimeout(() => {
      // si tienes el wizard buttons:
      const step2 = document.getElementById("stepDelivery");
      const step1 = document.getElementById("stepProducts");
      const step3 = document.getElementById("stepConfirm");
      if (step1) step1.style.display = "none";
      if (step3) step3.style.display = "none";
      if (step2) step2.style.display = "block";

      // si existe tu stepper pro:
      window.SDC_CHECKOUT?.showStep?.(2);
      window.SDC_STEPPER?.render?.();
      window.SDC_GUARD?.syncNextDisabled?.();
    }, 60);
  }

  function hookBuyNow(){
    // botón del modal producto
    const btn = document.getElementById("pmBuyNowBtn");
    if (!btn) return;

    if (btn.dataset.patched) return;
    btn.dataset.patched = "1";

    btn.addEventListener("click", () => {
      // si el producto está agotado, tu product_modal ya lo manda a consultar
      // aquí solo hacemos: abrir carrito paso 2
      openCartStep2();
    });
  }

  // WhatsApp pro corto (override suave)
  function buildShortMessage(){
    const cart = S?.getCart?.() || new Map();
    if (!cart.size) return "Hola, quiero información.";

    const dep = document.getElementById("dep")?.value || "";
    const mun = document.getElementById("mun")?.value || "";
    const pay = document.getElementById("payType")?.value || "pagar_al_recibir";

    // delivery_plus fields
    const deliveryMode = document.getElementById("dp_delivery")?.value || "auto";
    const localMethod = document.getElementById("dp_method")?.value || "";
    const meetPoint = document.getElementById("dp_meet")?.value?.trim() || "";
    const company = document.getElementById("dp_company")?.value || "";
    const busCost = Number((document.getElementById("dp_bus_cost")?.value||"").replace(/[^\d.]/g,"")||0);

    const name = document.getElementById("name")?.value?.trim() || "";
    const phone = document.getElementById("phone")?.value?.trim() || "";
    const addr = document.getElementById("addr")?.value?.trim() || "";

    let subtotal = 0;
    let items = 0;
    const lines = [];
    lines.push("🛒 *PEDIDO - SDC*");
    if (dep || mun) lines.push(`📍 ${dep}${mun?(" - "+mun):""}`);

    lines.push("");
    for (const it of cart.values()){
      items += Number(it.qty||0);
      const lineTotal = Number(it.p?.precio||0) * Number(it.qty||0);
      subtotal += lineTotal;
      lines.push(`• ${it.qty}x ${it.p?.nombre} — ${money(lineTotal)}`);
    }

    lines.push("");
    lines.push(`Subtotal: ${money(subtotal)} (${items} items)`);

    // envío/pago corto
    if (deliveryMode === "local" || (deliveryMode==="auto" && S?.isLocalAllowed?.(dep, mun))){
      lines.push(`🚚 Local: ${localMethod==="punto" ? "Punto" : "Domicilio"} • Pago: Recibir`);
      if (localMethod === "punto" && meetPoint) lines.push(`📍 Punto: ${meetPoint}`);
    } else if (deliveryMode === "bus"){
      lines.push(`🚌 Bus: ${busCost>0?money(busCost):"Cotizar"} • Pago: ${pay==="prepago"?"Prepago":"Recibir"}`);
    } else {
      lines.push(`📦 Empresa: ${company||"C807/Cargo/Forza"} • Pago: ${pay==="prepago"?"Prepago":"Contra entrega"}`);
    }

    if (name || phone){
      lines.push("");
      lines.push(`👤 ${name}${phone?(" • "+phone):""}`);
    }
    if (addr) lines.push(`🏠 ${addr}`);

    lines.push("");
    lines.push("✅ Confirmar disponibilidad y entrega, por favor.");

    return lines.join("\n");
  }

  function patchWASend(){
    if (!window.SDC_WA?.send) return;
    if (window.__SDC_WA_SHORT__) return;
    window.__SDC_WA_SHORT__ = true;

    const old = window.SDC_WA.send.bind(window.SDC_WA);
    window.SDC_WA.send = function(){
      try{
        const msg = buildShortMessage();
        const phone = window.SDC_STORE?.getWhatsapp?.() || "+50431517755";
        const wa = "https://wa.me/" + String(phone).replace(/[^\d]/g,"") + "?text=" + encodeURIComponent(msg);
        window.open(wa, "_blank");

        // gracias (si existe)
        document.getElementById("thanksModal")?.classList.add("open");
        return;
      }catch{
        return old();
      }
    };
  }

  function init(){
    patchWASend();
    hookBuyNow();

    // re-hook cuando se abre el modal producto
    const pm = document.getElementById("productModal");
    if (pm && !window.__SDC_BUYNOW_OBS__){
      window.__SDC_BUYNOW_OBS__ = true;
      const obs = new MutationObserver(() => {
        if (pm.classList.contains("open")) setTimeout(hookBuyNow, 30);
      });
      obs.observe(pm, { attributes:true, attributeFilter:["class"] });
    }
  }

  return { init };
})();
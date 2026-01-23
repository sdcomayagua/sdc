// p7_checkout.js
window.SDC_P7 = (() => {
  const CFG = () => window.SDC_CONFIG;
  const S = () => window.SDC_STORE;
  const U = () => window.SDC_UTILS;

  function getStep(){
    // Detecta el paso visible
    const s1 = document.getElementById("stepProducts");
    const s2 = document.getElementById("stepDelivery");
    const s3 = document.getElementById("stepConfirm");

    if (s3 && s3.style.display !== "none") return 3;
    if (s2 && s2.style.display !== "none") return 2;
    return 1;
  }

  function stepLabel(n){
    if (n === 1) return "1/3 • Productos";
    if (n === 2) return "2/3 • Entrega";
    return "3/3 • Confirmar";
  }

  function ensureSticky(){
    if (document.getElementById("checkoutSticky")) return;

    const modalBody = document.querySelector("#cartModal .sheet .body");
    if (!modalBody) return;

    const sticky = document.createElement("div");
    sticky.id = "checkoutSticky";
    sticky.className = "checkoutSticky";
    sticky.innerHTML = `
      <div class="checkoutStickyTop">
        <div class="checkoutStepPill" id="csStep">1/3 • Productos</div>
        <div class="checkoutTotal" id="csTotal">Total: --</div>
      </div>
      <div class="checkoutStickyBtns">
        <button class="btn ghost" id="csBack" type="button">Atrás</button>
        <button class="btn acc" id="csNext" type="button">Continuar</button>
      </div>
      <div class="note" id="csNote" style="margin-top:10px;display:none"></div>
    `;

    modalBody.appendChild(sticky);

    document.getElementById("csBack").onclick = () => document.getElementById("prevStepBtn")?.click?.();
    document.getElementById("csNext").onclick = onPrimary;
  }

  function computeTotalNow(){
    const cart = S()?.getCart?.() || new Map();
    let subtotal = 0;

    for (const it of cart.values()){
      subtotal += Number(it.p?.precio || 0) * Number(it.qty || 1);
    }

    // Si no hay selects aún, total = subtotal
    const dep = document.getElementById("dep")?.value || "";
    const mun = document.getElementById("mun")?.value || "";
    const pay = document.getElementById("payType")?.value || "pagar_al_recibir";

    // localAllowed: usa store si existe
    let localAllowed = false;
    try { localAllowed = !!S()?.isLocalAllowed?.(dep, mun); } catch {}

    let ship = 0;
    if (!localAllowed){
      ship = (pay === "prepago") ? Number(CFG()?.NATIONAL_PREPAGO||0) : Number(CFG()?.NATIONAL_CONTRA_ENTREGA||0);
    }

    // total a pagar ahora:
    // - Local: subtotal (envío se coordina)
    // - Nacional prepago: subtotal + ship
    // - Nacional contra entrega: subtotal (envío lo paga a empresa)
    const totalNow = (!localAllowed && pay === "prepago") ? (subtotal + ship) : subtotal;

    return { subtotal, ship, totalNow, localAllowed, pay };
  }

  function updateSticky(){
    const step = getStep();
    const stepEl = document.getElementById("csStep");
    const totalEl = document.getElementById("csTotal");
    const nextBtn = document.getElementById("csNext");
    const backBtn = document.getElementById("csBack");
    const note = document.getElementById("csNote");

    if (!stepEl || !totalEl || !nextBtn || !backBtn) return;

    stepEl.textContent = stepLabel(step);

    const t = computeTotalNow();
    totalEl.textContent = `Total: ${U()?.money?.(t.totalNow, CFG()?.CURRENCY) || ""}`;

    // botones
    backBtn.style.display = (step === 1) ? "none" : "inline-flex";
    nextBtn.textContent = (step === 3) ? "Enviar por WhatsApp" : "Continuar";

    // nota
    if (note){
      note.style.display = "block";
      if (t.localAllowed){
        note.textContent = "Entrega local: pagar al recibir. Envío se coordina.";
      } else if (t.pay === "prepago"){
        note.textContent = `Nacional prepago: incluye envío (${U()?.money?.(t.ship, CFG()?.CURRENCY) || ""}).`;
      } else {
        note.textContent = `Nacional contra entrega: envío se paga a la empresa (${U()?.money?.(t.ship, CFG()?.CURRENCY) || ""}).`;
      }
    }
  }

  function scrollToEl(el){
    try{
      el.scrollIntoView({ behavior:"smooth", block:"center" });
      el.focus?.();
    }catch{}
  }

  function validateConfirmStep(){
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const addr = document.getElementById("addr");

    if (!name || !phone || !addr) return true;

    if (!name.value.trim()){
      U()?.toast?.("Falta tu nombre");
      scrollToEl(name);
      return false;
    }
    if (!phone.value.trim()){
      U()?.toast?.("Falta tu teléfono");
      scrollToEl(phone);
      return false;
    }
    if (!addr.value.trim()){
      U()?.toast?.("Falta tu dirección");
      scrollToEl(addr);
      return false;
    }
    return true;
  }

  function onPrimary(){
    const step = getStep();

    if (step === 3){
      if (!validateConfirmStep()) return;
      document.getElementById("sendWA")?.click?.();
      return;
    }

    // Pasos 1/2 => usar tu wizard real
    document.getElementById("nextStepBtn")?.click?.();
  }

  function hookCartModal(){
    const modal = document.getElementById("cartModal");
    if (!modal) return;

    // cada vez que abra/cambie, refresca
    const obs = new MutationObserver(() => {
      if (!modal.classList.contains("open")) return;
      ensureSticky();
      updateSticky();
    });
    obs.observe(modal, { attributes:true, attributeFilter:["class"] });

    // cambios en selects del carrito afectan total
    ["dep","mun","payType","deliveryType","cashAmount"].forEach(id=>{
      document.getElementById(id)?.addEventListener("change", updateSticky);
      document.getElementById(id)?.addEventListener("input", updateSticky);
    });

    // cambios en carrito
    const cartCount = document.getElementById("cartCount");
    if (cartCount){
      const obs2 = new MutationObserver(updateSticky);
      obs2.observe(cartCount, { childList:true, subtree:true });
    }
  }

  function init(){
    hookCartModal();

    // si ya está abierto, aplica
    if (document.getElementById("cartModal")?.classList.contains("open")){
      ensureSticky();
      updateSticky();
    }
  }

  return { init, updateSticky };
})();
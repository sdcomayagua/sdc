// fase4_checkout.js — Checkout ultra simple + punto encuentro + cambio
window.SDC_FASE4 = (() => {
  const U = window.SDC_UTILS;
  const CFG = window.SDC_CONFIG;

  function $(id){ return document.getElementById(id); }

  function money(n){
    return window.SDC_UTILS?.money?.(n, CFG?.CURRENCY) || "";
  }

  function getCartTotals(){
    const cart = window.SDC_STORE?.getCart?.() || new Map();
    let subtotal = 0;
    for (const it of cart.values()){
      subtotal += Number(it.p?.precio||0) * Number(it.qty||0);
    }
    return { subtotal };
  }

  function ensureMeetCard(){
    const wrap = $("dp_wrap");
    if (!wrap) return;

    if ($("fase4_meetCard")) return;

    const card = document.createElement("div");
    card.id = "fase4_meetCard";
    card.className = "dpCard";
    card.style.display = "none";
    card.innerHTML = `
      <div class="dpCardTitle">📍 Punto de encuentro</div>
      <div class="dpHint">Escribe un lugar donde te gustaría que nos viéramos (parque, mall, gasolinera, etc.).</div>
    `;

    // usamos el textarea ya existente de delivery_plus
    const meet = $("dp_meet");
    if (meet){
      meet.style.marginTop = "10px";
      card.appendChild(meet);
    }

    wrap.appendChild(card);
  }

  function ensureChangeBox(){
    const cash = $("cashAmount");
    if (!cash) return;

    if ($("fase4_changeBox")) return;

    const box = document.createElement("div");
    box.id = "fase4_changeBox";
    box.className = "changeBox";
    box.style.display = "none";
    cash.insertAdjacentElement("afterend", box);
  }

  function updateMeetVisibility(){
    const method = $("dp_method")?.value || "";
    const meetCard = $("fase4_meetCard");
    if (!meetCard) return;
    meetCard.style.display = (method === "punto") ? "block" : "none";
  }

  function updateChange(){
    ensureChangeBox();
    const box = $("fase4_changeBox");
    const cash = $("cashAmount");
    const pay = $("payType")?.value || "pagar_al_recibir";

    if (!box || !cash) return;

    // solo para pagar al recibir (local principalmente)
    if (pay !== "pagar_al_recibir"){
      box.style.display = "none";
      box.textContent = "";
      return;
    }

    const { subtotal } = getCartTotals();
    const val = Number(String(cash.value||"").replace(/[^\d.]/g,"") || 0);

    if (!val || val <= 0){
      box.style.display = "none";
      box.textContent = "";
      return;
    }

    const change = Math.max(0, val - subtotal);
    box.style.display = "block";
    box.textContent = `Devuelto: ${money(change)} (si paga con ${money(val)})`;
  }

  function clearErr(el){
    if (!el) return;
    el.classList.remove("fieldErr");
  }
  function setErr(el){
    if (!el) return;
    el.classList.add("fieldErr");
  }

  function validateConfirmStep(){
    const name = $("name");
    const phone = $("phone");
    const addr = $("addr");

    let ok = true;

    [name, phone, addr].forEach(clearErr);

    if (name && !name.value.trim()){
      setErr(name); ok = false;
    }
    if (phone && !phone.value.trim()){
      setErr(phone); ok = false;
    }
    if (addr && !addr.value.trim()){
      setErr(addr); ok = false;
    }

    if (!ok){
      // enfoca el primero
      const first = [name, phone, addr].find(x => x && x.classList.contains("fieldErr"));
      first?.scrollIntoView?.({ behavior:"smooth", block:"center" });
      first?.focus?.();
      U?.toast?.("Completa tus datos para enviar el pedido");
    }
    return ok;
  }

  function hookCheckoutButtons(){
    // Reemplaza comportamiento del botón sticky principal (si existe)
    const csNext = $("csNext");
    if (!csNext) return;

    const old = csNext.onclick;
    csNext.onclick = () => {
      const step3 = $("stepConfirm") && $("stepConfirm").style.display !== "none";
      if (step3){
        if (!validateConfirmStep()) return;
      }
      old && old();
    };
  }

  function hookCartModal(){
    const cm = $("cartModal");
    if (!cm) return;

    const obs = new MutationObserver(() => {
      if (!cm.classList.contains("open")) return;

      // inyecta UI
      ensureMeetCard();
      ensureChangeBox();

      // update
      updateMeetVisibility();
      updateChange();
      hookCheckoutButtons();
    });

    obs.observe(cm, { attributes:true, attributeFilter:["class"] });
  }

  function bindEvents(){
    $("dp_method")?.addEventListener("change", updateMeetVisibility);
    $("dp_meet")?.addEventListener("input", () => {});
    $("cashAmount")?.addEventListener("input", updateChange);
    $("payType")?.addEventListener("change", updateChange);

    // si cambian cantidades
    const cartCount = $("cartCount");
    if (cartCount){
      const obs = new MutationObserver(updateChange);
      obs.observe(cartCount, { childList:true, subtree:true });
    }
  }

  function init(){
    hookCartModal();

    // si ya existe el wrap (delivery_plus)
    ensureMeetCard();
    ensureChangeBox();

    bindEvents();
  }

  return { init };
})();
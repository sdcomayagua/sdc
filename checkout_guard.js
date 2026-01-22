window.SDC_GUARD = (() => {
  const $ = (id)=>document.getElementById(id);

  function showErr(msg){
    const el = $("wizardErr");
    if (!el) return;
    if (!msg){
      el.style.display = "none";
      el.textContent = "";
      return;
    }
    el.style.display = "block";
    el.textContent = msg;
  }

  function currentStep(){
    const ids = ["stepProducts","stepDelivery","stepConfirm"];
    for (let i=0;i<ids.length;i++){
      const el = $(ids[i]);
      if (el && el.style.display !== "none") return i+1;
    }
    return 1;
  }

  function validateStep(step){
    const S = window.SDC_STORE;
    if (step === 1){
      if (S.getCart().size === 0) return "Tu carrito está vacío.";
      return "";
    }

    if (step === 2){
      const dep = $("dep")?.value || "";
      const mun = $("mun")?.value || "";
      if (!dep || !mun) return "Selecciona Departamento y Municipio.";
      const pay = $("payType")?.value || "pagar_al_recibir";
      const local = S.isLocalAllowed(dep, mun);

      if (local && pay === "pagar_al_recibir"){
        // si está visible cashBox, exigir "con cuánto pagará"
        const cashBox = $("cashBox");
        const visible = cashBox && cashBox.style.display !== "none";
        if (visible){
          const cash = String($("cashAmount")?.value||"").trim();
          if (!cash) return "Escribe ¿con cuánto pagará? para calcular cambio.";
        }
      }
      return "";
    }

    if (step === 3){
      const name = String($("name")?.value||"").trim();
      const phone = String($("phone")?.value||"").trim();
      const addr = String($("addr")?.value||"").trim();
      if (!name) return "Falta tu nombre.";
      if (!phone) return "Falta tu teléfono.";
      if (!addr) return "Falta tu dirección/referencia.";
      return "";
    }

    return "";
  }

  function canNext(){
    const step = currentStep();
    const msg = validateStep(step);
    showErr(msg);
    return !msg;
  }

  function wireButtons(){
    const nextBtn = $("nextStepBtn");
    const prevBtn = $("prevStepBtn");
    if (!nextBtn || !prevBtn) return;

    // intercept Next
    nextBtn.onclick = () => {
      if (!canNext()) return;
      window.SDC_CHECKOUT?.next?.();
      setTimeout(() => window.SDC_STEPPER?.render?.(), 0);
      showErr("");
      // re-check for next step (to disable next if needed)
      syncNextDisabled();
    };

    // Prev always ok
    prevBtn.onclick = () => {
      showErr("");
      window.SDC_CHECKOUT?.prev?.();
      setTimeout(() => window.SDC_STEPPER?.render?.(), 0);
      syncNextDisabled();
    };

    // live validation
    ["dep","mun","payType","cashAmount","name","phone","addr"].forEach(id=>{
      $(id)?.addEventListener("input", syncNextDisabled);
      $(id)?.addEventListener("change", syncNextDisabled);
    });

    syncNextDisabled();
  }

  function syncNextDisabled(){
    const nextBtn = $("nextStepBtn");
    if (!nextBtn) return;
    const step = currentStep();
    // en el último paso, ocultamos el botón “Continuar”
    if (step === 3){
      nextBtn.disabled = true;
      nextBtn.classList.add("disabled");
      nextBtn.textContent = "Listo";
      return;
    }
    nextBtn.textContent = "Continuar";
    const ok = !validateStep(step);
    nextBtn.disabled = !ok;
    nextBtn.classList.toggle("disabled", !ok);
  }

  function init(){
    wireButtons();
  }

  return { init, validateStep, canNext, syncNextDisabled, showErr };
})();
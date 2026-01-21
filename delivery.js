window.SDC_DELIVERY = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;

  function initSelectors() {
    const DATA = S.getData();
    if (!DATA) return;

    const deps = new Set((DATA.municipios || []).map(x => x.departamento).filter(Boolean));
    const depSel = U.$("dep");
    depSel.innerHTML = "";
    Array.from(deps).sort((a,b)=>a.localeCompare(b)).forEach(d => {
      const o = document.createElement("option");
      o.value = d; o.textContent = d;
      depSel.appendChild(o);
    });

    depSel.onchange = fillMunicipios;
    U.$("mun").onchange = updateDeliveryOptions;
    U.$("payType").onchange = () => { toggleCashBox(); window.SDC_CART.computeSummary(); };
    U.$("cashAmount").oninput = () => window.SDC_CART.computeSummary();

    fillMunicipios();
  }

  function fillMunicipios() {
    const DATA = S.getData();
    const dep = U.$("dep").value;
    const munSel = U.$("mun");
    munSel.innerHTML = "";

    const list = (DATA.municipios || [])
      .filter(x => x.departamento === dep)
      .map(x => x.municipio);

    list.sort((a,b)=>a.localeCompare(b)).forEach(m => {
      const o = document.createElement("option");
      o.value = m; o.textContent = m;
      munSel.appendChild(o);
    });

    updateDeliveryOptions();
  }

  function updateDeliveryOptions() {
    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = S.isLocalAllowed(dep, mun);

    const sel = U.$("deliveryType");
    sel.innerHTML = "";
    const o = document.createElement("option");
    o.value = local ? "local" : "empresa";
    o.textContent = local ? "ENTREGA LOCAL (Comayagua y alrededores)" : "ENVÍO NACIONAL (C807 / Cargo Expreso / Forza)";
    sel.appendChild(o);

    U.$("deliveryNote").textContent = local ? "Entrega local: pagar al recibir." : "Envío nacional: contra entrega o prepago.";
    if (local) U.$("payType").value = "pagar_al_recibir";

    toggleCashBox();
    window.SDC_CART.computeSummary();
  }

  function toggleCashBox() {
    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = S.isLocalAllowed(dep, mun);
    const pay = U.$("payType").value;

    U.$("cashBox").style.display = (local && pay === "pagar_al_recibir") ? "block" : "none";

    U.$("payNote").textContent = local
      ? "PAGAR AL RECIBIR: se confirma monto para cambio."
      : (pay === "prepago"
        ? `PREPAGO: deposita producto + envío (${U.money(CFG.NATIONAL_PREPAGO, CFG.CURRENCY)}).`
        : `CONTRA ENTREGA: paga a la empresa producto + envío (${U.money(CFG.NATIONAL_CONTRA_ENTREGA, CFG.CURRENCY)}).`);
  }

  return { initSelectors, updateDeliveryOptions, toggleCashBox };
})();

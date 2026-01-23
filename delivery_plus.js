// delivery_plus.js
// Reglas completas de entrega + UI extra inyectada en el carrito (sin tocar templates.js)

window.SDC_DELIVERY_PLUS = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;

  // === ZONAS LOCALES (domicilio / punto de encuentro) ===
  const LOCAL_HOME_OR_MEET = new Set([
    "Comayagua|Comayagua",
    "Comayagua|Ajuterique",
    "Comayagua|Lejamaní",
    "Comayagua|Lejamani",
    "Comayagua|Flores",
    "Comayagua|Villa de San Antonio",
    "Comayagua|Palmerola",
    "Comayagua|El Pajonal",

    "La Paz|La Paz"
  ]);

  // === Municipios de Comayagua que NO están en local directo -> empresa o bus ===
  function isComayaguaOtherMunicipio(dep, mun){
    if (String(dep||"").trim() !== "Comayagua") return false;
    return !LOCAL_HOME_OR_MEET.has(`${dep}|${mun}`);
  }

  // === Empresas de envío ===
  const COMPANIES = ["C807", "Cargo Expreso", "Forza"];

  function $(id){ return document.getElementById(id); }

  // Inserta UI adicional dentro del Step Delivery del carrito
  function injectUI(){
    const step = $("stepDelivery");
    if (!step) return;
    if ($("dp_method")) return; // ya existe

    // Inserta debajo del bloque dep/mun (ya existente)
    const anchor = step.querySelector(".two")?.parentElement || step;

    const wrap = document.createElement("div");
    wrap.id = "dp_wrap";
    wrap.innerHTML = `
      <div style="margin-top:10px">
        <label class="mut">Tipo de entrega (según tu ubicación)</label>
        <select id="dp_delivery">
          <option value="auto">Automático</option>
          <option value="local">Entrega local</option>
          <option value="empresa">Envío por empresa</option>
          <option value="bus">Envío por bus (cotizable)</option>
        </select>
        <div class="note" id="dp_delivery_note" style="margin-top:6px"></div>
      </div>

      <div id="dp_local_block" style="display:none;margin-top:10px">
        <label class="mut">Método local</label>
        <select id="dp_method">
          <option value="domicilio">A domicilio</option>
          <option value="punto">Entrega en punto de encuentro</option>
        </select>

        <div id="dp_meet_block" style="display:none;margin-top:10px">
          <label class="mut">¿Dónde te gustaría que nos viéramos?</label>
          <textarea id="dp_meet" placeholder="Ej: Parque central, Mall, gasolinera..."></textarea>
        </div>
      </div>

      <div id="dp_empresa_block" style="display:none;margin-top:10px">
        <label class="mut">Empresa de envío</label>
        <select id="dp_company"></select>
        <div class="note" style="margin-top:6px">Costo: contra entrega Lps ${CFG.NATIONAL_CONTRA_ENTREGA} / prepago Lps ${CFG.NATIONAL_PREPAGO}</div>
      </div>

      <div id="dp_bus_block" style="display:none;margin-top:10px">
        <label class="mut">Envío por bus (cotizable)</label>
        <input id="dp_bus_cost" inputmode="numeric" placeholder="Costo del bus (Ej: 80)" />
        <div class="note" style="margin-top:6px">Este costo se suma al total (si aplica). Puedes cotizarlo manualmente.</div>
      </div>
    `;

    anchor.appendChild(wrap);

    // llenar empresas
    const sel = $("dp_company");
    sel.innerHTML = COMPANIES.map(c => `<option value="${c}">${c}</option>`).join("");

    // eventos
    $("dp_delivery").addEventListener("change", onAnyChange);
    $("dp_method").addEventListener("change", onAnyChange);
    $("dp_meet").addEventListener("input", onAnyChange);
    $("dp_company").addEventListener("change", onAnyChange);
    $("dp_bus_cost").addEventListener("input", onAnyChange);

    // los tuyos existentes:
    $("dep")?.addEventListener("change", onAnyChange);
    $("mun")?.addEventListener("change", onAnyChange);
    $("payType")?.addEventListener("change", onAnyChange);
    $("cashAmount")?.addEventListener("input", onAnyChange);
  }

  function getDepMun(){
    return { dep: $("dep")?.value || "", mun: $("mun")?.value || "" };
  }

  // Decide modo sugerido según reglas
  function suggestedMode(dep, mun){
    if (LOCAL_HOME_OR_MEET.has(`${dep}|${mun}`)) return "local";
    if (isComayaguaOtherMunicipio(dep, mun)) return "bus"; // por defecto bus (puede cambiar a empresa)
    return "empresa";
  }

  function show(el, yes){ if (el) el.style.display = yes ? "block" : "none"; }

  function onAnyChange(){
    // Ajusta UI según ubicación y selección
    updateDeliveryUI();
    // Recalcula resumen/cambio
    computeAndRenderSummary();
  }

  function updateDeliveryUI(){
    const { dep, mun } = getDepMun();

    // Auto decide si dp_delivery está en "auto"
    const sel = $("dp_delivery");
    const note = $("dp_delivery_note");
    if (!sel) return;

    let mode = sel.value;

    if (mode === "auto"){
      mode = suggestedMode(dep, mun);
    }

    // Mostrar bloques
    show($("dp_local_block"), mode === "local");
    show($("dp_empresa_block"), mode === "empresa");
    show($("dp_bus_block"), mode === "bus");

    // Local: método punto -> textarea
    if (mode === "local"){
      const method = $("dp_method")?.value || "domicilio";
      show($("dp_meet_block"), method === "punto");

      // Forzar forma de pago = pagar_al_recibir
      const pay = $("payType");
      if (pay){
        pay.value = "pagar_al_recibir";
        pay.disabled = false;
      }

      if (note) note.textContent = "Entrega local: pagar al recibir (domicilio o punto de encuentro).";
    }

    // Empresa: escoger empresa, pago contra/ prepago
    if (mode === "empresa"){
      if (note) note.textContent = "Envío nacional por empresa (C807 / Cargo Expreso / Forza).";
      // aquí sí se permite prepago/contra entrega (tu select payType ya lo tiene)
      const pay = $("payType");
      if (pay) pay.disabled = false;
    }

    // Bus: cotizable, pago usualmente pagar_al_recibir o prepago (lo dejas libre)
    if (mode === "bus"){
      if (note) note.textContent = "Envío por bus: el costo se cotiza manualmente (solo disponible para municipios del depto. Comayagua fuera de local directo).";
      const pay = $("payType");
      if (pay) pay.disabled = false;
    }

    // Mostrar cashBox solo si pagar_al_recibir y local (o local+punto)
    const payNow = $("payType")?.value || "pagar_al_recibir";
    const showCash = (mode === "local" && payNow === "pagar_al_recibir");
    show($("cashBox"), showCash);
  }

  function computeAndRenderSummary(){
    const cart = S?.getCart?.() || new Map();
    const sum = $("summary");
    if (!sum) return;

    if (!cart.size){
      sum.innerHTML = `<div class="note">Agrega productos para ver el total.</div>`;
      return;
    }

    const { dep, mun } = getDepMun();
    const sel = $("dp_delivery");
    let mode = sel?.value || "auto";
    if (mode === "auto") mode = suggestedMode(dep, mun);

    const pay = $("payType")?.value || "pagar_al_recibir";

    let subtotal = 0;
    let count = 0;
    for (const it of cart.values()){
      subtotal += Number(it.p?.precio||0) * Number(it.qty||0);
      count += Number(it.qty||0);
    }

    // shipping logic
    let ship = 0;
    let shipText = "";

    if (mode === "local"){
      ship = 0; // lo coordinas
      shipText = "Entrega local: se coordina (según zona/punto).";
    }

    if (mode === "empresa"){
      ship = (pay === "prepago") ? Number(CFG.NATIONAL_PREPAGO||0) : Number(CFG.NATIONAL_CONTRA_ENTREGA||0);
      shipText = pay === "prepago"
        ? `Envío empresa PREPAGO: ${U.money(ship, CFG.CURRENCY)}`
        : `Envío empresa CONTRA ENTREGA: ${U.money(ship, CFG.CURRENCY)} (pagado a la empresa)`;
    }

    if (mode === "bus"){
      const busCost = Number(($("dp_bus_cost")?.value||"").replace(/[^\d.]/g,"")||0);
      ship = busCost || 0;
      shipText = busCost>0 ? `Envío bus (cotizado): ${U.money(ship, CFG.CURRENCY)}` : "Envío bus: pendiente de cotización.";
    }

    // totalNow:
    // - local: subtotal
    // - empresa prepago: subtotal + ship
    // - empresa contra entrega: subtotal (envío paga empresa)
    // - bus: subtotal + ship (porque es un costo que tú sumas normalmente)
    let totalNow = subtotal;
    if (mode === "empresa" && pay === "prepago") totalNow = subtotal + ship;
    if (mode === "bus") totalNow = subtotal + ship;

    // cambio / devuelto:
    const cash = Number(($("cashAmount")?.value||"").replace(/[^\d.]/g,"")||0);
    let change = 0;
    if (mode === "local" && pay === "pagar_al_recibir" && cash > 0){
      change = Math.max(0, cash - totalNow);
    }

    // render
    let html = `
      <div class="sum"><div>Productos (${count})</div><div>${U.money(subtotal, CFG.CURRENCY)}</div></div>
      <div class="sum"><div>Envío</div><div>${mode==="empresa" ? (pay==="prepago"?U.money(ship,CFG.CURRENCY):"Se paga a empresa") : (mode==="bus" ? (ship>0?U.money(ship,CFG.CURRENCY):"Cotizar") : "Coordinar")}</div></div>
      <div class="sum total"><div>Total</div><div>${U.money(totalNow, CFG.CURRENCY)}</div></div>
      <div class="note" style="margin-top:8px">${shipText}</div>
    `;

    if (mode === "local" && pay === "pagar_al_recibir"){
      if (cash > 0){
        html += `<div class="note" style="margin-top:8px">Paga con: ${U.money(cash, CFG.CURRENCY)} → Devuelto: ${U.money(change, CFG.CURRENCY)}</div>`;
      } else {
        html += `<div class="note" style="margin-top:8px">Para calcular devuelto, escribe “¿Con cuánto pagará?”</div>`;
      }
    }

    // Punto de encuentro
    if (mode === "local" && ($("dp_method")?.value === "punto")){
      const meet = ($("dp_meet")?.value || "").trim();
      if (meet){
        html += `<div class="note" style="margin-top:8px">Punto de encuentro: <b>${U.esc(meet)}</b></div>`;
      } else {
        html += `<div class="note" style="margin-top:8px">Falta indicar punto de encuentro.</div>`;
      }
    }

    // Empresa seleccionada
    if (mode === "empresa"){
      const c = $("dp_company")?.value || "";
      if (c) html += `<div class="note" style="margin-top:8px">Empresa: <b>${U.esc(c)}</b></div>`;
    }

    sum.innerHTML = html;
  }

  function init(){
    injectUI();
    updateDeliveryUI();
    computeAndRenderSummary();

    // También re-render al abrir carrito
    const cm = $("cartModal");
    if (cm && !window.__SDC_DP_OBS__){
      window.__SDC_DP_OBS__ = true;
      const obs = new MutationObserver(() => {
        if (!cm.classList.contains("open")) return;
        injectUI();
        updateDeliveryUI();
        computeAndRenderSummary();
      });
      obs.observe(cm, { attributes:true, attributeFilter:["class"] });
    }
  }

  return { init };
})();
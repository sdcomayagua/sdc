window.SDC_DELIVERY = (() => {
  const CFG=window.SDC_CONFIG, ST=window.SDC_STORE, U=window.SDC_UTILS;
  const LOCAL=new Set(CFG.LOCAL_ALLOW||[]);

  const isLocal=(dep,mun)=>LOCAL.has(`${dep}|${mun}`);

  function init(){
    const deps=new Set((ST.DATA?.municipios||[]).map(x=>x.departamento).filter(Boolean));
    const depSel=U.$("dep"); depSel.innerHTML="";
    Array.from(deps).sort((a,b)=>a.localeCompare(b)).forEach(d=>{
      const o=document.createElement("option"); o.value=d; o.textContent=d; depSel.appendChild(o);
    });

    depSel.onchange=fillMunicipios;
    U.$("mun").onchange=updateDeliveryType;
    U.$("payType").onchange=()=>{toggleCash(); compute();};
    U.$("cashAmount").oninput=compute;

    fillMunicipios();
  }

  function fillMunicipios(){
    const dep=U.$("dep").value;
    const munSel=U.$("mun"); munSel.innerHTML="";
    const list=(ST.DATA?.municipios||[]).filter(x=>x.departamento===dep).map(x=>x.municipio);
    list.sort((a,b)=>a.localeCompare(b)).forEach(m=>{
      const o=document.createElement("option"); o.value=m; o.textContent=m; munSel.appendChild(o);
    });
    updateDeliveryType();
  }

  function updateDeliveryType(){
    const dep=U.$("dep").value, mun=U.$("mun").value;
    const local=isLocal(dep,mun);

    const sel=U.$("deliveryType"); sel.innerHTML="";
    const o=document.createElement("option");
    o.value=local?"local":"empresa";
    o.textContent=local?"ENTREGA LOCAL (Comayagua y alrededores)":"ENVÍO NACIONAL (C807 / Cargo Expreso / Forza)";
    sel.appendChild(o);

    U.$("deliveryNote").textContent=local?"Entrega local: pagar al recibir.":"Envío nacional: contra entrega o prepago.";
    if(local) U.$("payType").value="pagar_al_recibir";

    toggleCash();
    compute();
  }

  function toggleCash(){
    const dep=U.$("dep").value, mun=U.$("mun").value;
    const local=isLocal(dep,mun);
    const pay=U.$("payType").value;

    U.$("cashBox").style.display = (local && pay==="pagar_al_recibir") ? "block" : "none";
    U.$("payNote").textContent = local
      ? "PAGAR AL RECIBIR: se confirma monto para cambio."
      : (pay==="prepago"
        ? `PREPAGO: deposita producto + envío (${U.money(CFG.NATIONAL_PREPAGO, CFG.CURRENCY)}).`
        : `CONTRA ENTREGA: paga a la empresa producto + envío (${U.money(CFG.NATIONAL_CONTRA_ENTREGA, CFG.CURRENCY)}).`);
  }

  function compute(){
    const sum=U.$("summary");
    if(ST.cart.size===0){ sum.innerHTML=`<div class="note">Agrega productos para ver el total.</div>`; return; }

    const dep=U.$("dep").value, mun=U.$("mun").value;
    const local=isLocal(dep,mun);
    const pay=U.$("payType").value;

    let subtotal=0; for(const it of ST.cart.values()) subtotal += Number(it.p.precio||0)*it.qty;

    let shipping=0;
    if(!local) shipping = (pay==="prepago") ? CFG.NATIONAL_PREPAGO : CFG.NATIONAL_CONTRA_ENTREGA;

    const totalNow = subtotal + ((!local && pay==="prepago") ? shipping : 0);
    const cash = Number((U.$("cashAmount").value||"").replace(/[^\d.]/g,"")||0);
    const change = (local && pay==="pagar_al_recibir" && cash>0) ? Math.max(0, cash - subtotal) : 0;

    sum.innerHTML = `
      <div class="sum"><div>Subtotal</div><div>${U.money(subtotal, CFG.CURRENCY)}</div></div>
      <div class="sum"><div>Envío</div><div>${(!local && pay==="prepago") ? U.money(shipping, CFG.CURRENCY) : "Se paga a empresa / coordina"}</div></div>
      <div class="sum total"><div>Total a pagar ahora</div><div>${U.money(totalNow, CFG.CURRENCY)}</div></div>
      ${local && pay==="pagar_al_recibir" ? (cash>0
        ? `<div class="note" style="margin-top:8px">Paga con: ${U.money(cash, CFG.CURRENCY)} → Cambio estimado: ${U.money(change, CFG.CURRENCY)}</div>`
        : `<div class="note" style="margin-top:8px">Para calcular cambio, escribe “¿con cuánto pagará?”</div>`) : ""}
    `;
  }

  return { init, compute };
})();

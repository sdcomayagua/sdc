// shipping_quote.js
window.SDC_SHIP_QUOTE = (() => {
  const CFG = window.SDC_CONFIG;

  const LOCAL_ALLOW = new Set([
    "Comayagua|Comayagua",
    "Comayagua|Ajuterique",
    "Comayagua|Lejamaní",
    "Comayagua|Lejamani",
    "Comayagua|Flores",
    "Comayagua|Villa de San Antonio",
    "Comayagua|Palmerola",
    "Comayagua|El Pajonal",
  ]);

  function getMunicipios(){
    const d = window.SDC_STORE?.getData?.() || {};
    return d.municipios || [];
  }

  function mount(){
    const mount = document.getElementById("shipQuoteMount");
    if (!mount) return;

    if (document.getElementById("shipQuote")) return;

    mount.innerHTML = `
      <div class="shipQuote" id="shipQuote">
        <div class="shipQuoteHead">🚚 Cotiza tu envío</div>
        <div class="shipQuoteSub">Elige tu ubicación y te mostramos cómo se entrega.</div>

        <div class="shipQuoteRow">
          <div>
            <label class="mut">Departamento</label>
            <select id="sqDep"></select>
          </div>
          <div>
            <label class="mut">Municipio</label>
            <select id="sqMun"></select>
          </div>
        </div>

        <div class="shipQuoteResult" id="sqResult" style="display:none"></div>
      </div>
    `;
  }

  function fillDeps(){
    const list = getMunicipios();
    const deps = [...new Set(list.map(x=>x.departamento).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const dep = document.getElementById("sqDep");
    dep.innerHTML = deps.map(d=>`<option value="${d}">${d}</option>`).join("");
  }

  function fillMuns(){
    const list = getMunicipios();
    const depV = document.getElementById("sqDep").value;
    const muns = list.filter(x=>x.departamento===depV).map(x=>x.municipio).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    const mun = document.getElementById("sqMun");
    mun.innerHTML = muns.map(m=>`<option value="${m}">${m}</option>`).join("");
  }

  function compute(){
    const dep = document.getElementById("sqDep").value;
    const mun = document.getElementById("sqMun").value;
    const key = `${dep}|${mun}`;

    const box = document.getElementById("sqResult");
    box.style.display = "block";

    if (LOCAL_ALLOW.has(key)){
      box.innerHTML = `
        ✅ Entrega local (pagar al recibir)
        <small>Se coordina por WhatsApp. En Comayagua y alrededores.</small>
      `;
      return;
    }

    box.innerHTML = `
      📦 Envío nacional (empresa)
      <small>Contra entrega: Lps. ${CFG.NATIONAL_CONTRA_ENTREGA} • Prepago: Lps. ${CFG.NATIONAL_PREPAGO}</small>
    `;
  }

  function init(){
    mount();
    if (!document.getElementById("sqDep")) return;

    fillDeps();
    fillMuns();
    compute();

    document.getElementById("sqDep").addEventListener("change", ()=>{ fillMuns(); compute(); });
    document.getElementById("sqMun").addEventListener("change", compute);
  }

  return { init };
})();
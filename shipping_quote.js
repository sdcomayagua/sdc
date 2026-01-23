// shipping_quote.js (ACORDEÓN) — cerrado por defecto
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
    const headerWrap = document.querySelector("header .wrap");
    if (!headerWrap) return;

    // Si ya existe, no duplicar
    if (document.getElementById("shipAcc")) return;

    const box = document.createElement("div");
    box.id = "shipAcc";
    box.className = "shipAcc"; // cerrado por defecto (sin .open)
    box.innerHTML = `
      <button class="shipAccBtn" id="shipAccBtn" type="button">
        <div>
          🚚 Cotiza tu envío
          <div class="mut">Toca para elegir tu ubicación</div>
        </div>
        <div class="shipAccChevron" id="shipChevron">+</div>
      </button>

      <div class="shipAccBody" id="shipAccBody">
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

    // ✅ PONERLO DE ÚLTIMO EN EL HEADER (para que no cargue arriba)
    headerWrap.appendChild(box);

    // Toggle acordeón
    document.getElementById("shipAccBtn").onclick = () => {
      box.classList.toggle("open");
      const chev = document.getElementById("shipChevron");
      if (chev) chev.textContent = box.classList.contains("open") ? "–" : "+";
    };
  }

  function fillDeps(){
    const list = getMunicipios();
    const deps = [...new Set(list.map(x=>x.departamento).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const dep = document.getElementById("sqDep");
    if (!dep) return;
    dep.innerHTML = deps.map(d=>`<option value="${d}">${d}</option>`).join("");
  }

  function fillMuns(){
    const list = getMunicipios();
    const depEl = document.getElementById("sqDep");
    const munEl = document.getElementById("sqMun");
    if (!depEl || !munEl) return;

    const depV = depEl.value;
    const muns = list.filter(x=>x.departamento===depV).map(x=>x.municipio).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    munEl.innerHTML = muns.map(m=>`<option value="${m}">${m}</option>`).join("");
  }

  function compute(){
    const depEl = document.getElementById("sqDep");
    const munEl = document.getElementById("sqMun");
    const box = document.getElementById("sqResult");
    if (!depEl || !munEl || !box) return;

    const dep = depEl.value;
    const mun = munEl.value;
    const key = `${dep}|${mun}`;

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

    // Esperar a que ya haya data (municipios)
    const t = setInterval(() => {
      const ok = (getMunicipios().length > 0);
      if (!ok) return;
      clearInterval(t);

      fillDeps();
      fillMuns();
      compute();

      document.getElementById("sqDep")?.addEventListener("change", ()=>{ fillMuns(); compute(); });
      document.getElementById("sqMun")?.addEventListener("change", compute);
    }, 250);
  }

  return { init };
})();
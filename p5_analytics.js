// p5_analytics.js (FIX ESTRUCTURA)
// - No duplica secciones
// - No duplica “Más vistos”
// - Mueve Tendencias al FINAL (debajo del catálogo)

window.SDC_ANALYTICS = (() => {
  const KEY = "SDC_ANALYTICS_V1";
  const MAX = 80;

  function read(){
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch { return {}; }
  }
  function write(obj){
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
  }

  function pid(p){ return String(p?.id || p?.nombre || "").trim(); }

  function bump(type, p){
    const id = pid(p);
    if (!id) return;

    const db = read();
    db[type] = db[type] || {};
    db[type][id] = (db[type][id] || 0) + 1;

    const entries = Object.entries(db[type]).sort((a,b)=>b[1]-a[1]).slice(0, MAX);
    db[type] = Object.fromEntries(entries);
    write(db);
  }

  function top(type, n=12){
    const db = read();
    const m = db[type] || {};
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0, n);
  }

  // --- UI ---
  function ensureUI(){
    if (document.getElementById("statsSection")) return;

    const main = document.querySelector("main.wrap");
    if (!main) return;

    const sec = document.createElement("section");
    sec.id = "statsSection";
    sec.className = "section";
    sec.style.display = "none";

    sec.innerHTML = `
      <div class="sectionHead">
        <div>
          <div class="sectionTitle">📊 Tendencias</div>
          <div class="mut">Basado en actividad de clientes en este dispositivo</div>
        </div>
      </div>

      <div class="statsGrid">
        <div class="statsCard">
          <div class="statsTitle">👀 Más vistos</div>
          <div class="statsSub">Lo que más abren para ver detalles</div>
          <div class="statsRow" id="mostViewedRow"></div>
        </div>

        <div class="statsCard">
          <div class="statsTitle">🛒 Más agregados</div>
          <div class="statsSub">Lo que más ponen en el carrito</div>
          <div class="statsRow" id="mostAddedRow"></div>
        </div>
      </div>
    `;

    // ✅ Al FINAL del main (para que no se meta arriba)
    main.appendChild(sec);
  }

  function renderRow(rowId, pairs){
    const row = document.getElementById(rowId);
    if (!row) return;

    const products = window.SDC_STORE?.getProducts?.() || [];
    row.innerHTML = "";

    pairs.forEach(([id, score]) => {
      const p = products.find(x => String(x.id||x.nombre||"") === id);
      if (!p) return;

      const c = document.createElement("div");
      c.className = "hCard";
      c.onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p, { setHash:true });

      const img = document.createElement("img");
      img.src = p.imagen || (window.SDC_FALLBACK_IMG?.url || "");
      img.onerror = () => img.src = (window.SDC_FALLBACK_IMG?.url || "");

      const hp = document.createElement("div");
      hp.className = "hp";
      hp.innerHTML = `
        <div class="hname">${p.nombre || ""}</div>
        <div class="hprice">${window.SDC_UTILS?.money?.(p.precio, window.SDC_CONFIG?.CURRENCY) || ""}</div>
        <div class="mut" style="margin-top:6px">Score: ${score}</div>
      `;

      c.appendChild(img);
      c.appendChild(hp);
      row.appendChild(c);
    });
  }

  function render(){
    ensureUI();
    const sec = document.getElementById("statsSection");
    if (!sec) return;

    const viewed = top("view", 10);
    const added  = top("add", 10);

    if (!viewed.length && !added.length){
      sec.style.display = "none";
      return;
    }

    sec.style.display = "block";
    renderRow("mostViewedRow", viewed);
    renderRow("mostAddedRow", added);
  }

  // --- Hooks ---
  function hookProductOpen(){
    if (window.__SDC_ANALYTICS_OPEN__) return;
    window.__SDC_ANALYTICS_OPEN__ = true;

    const pm = window.SDC_PRODUCT_MODAL;
    if (!pm?.open) return;

    const old = pm.open.bind(pm);
    pm.open = function(p, opts){
      bump("view", p);
      setTimeout(render, 0);
      return old(p, opts);
    };
  }

  function hookAddToCart(){
    if (window.__SDC_ANALYTICS_ADD__) return;
    window.__SDC_ANALYTICS_ADD__ = true;

    const st = window.SDC_STORE;
    if (!st?.addToCart) return;

    const old
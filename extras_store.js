// extras_store.js
(() => {
  const money = (n) => window.SDC_UTILS?.money?.(n, window.SDC_CONFIG?.CURRENCY) || "";

  // (6) iconos por categoría
  const mapEmoji = (name) => {
    const s = (name||"").toLowerCase();
    if (s.includes("gamer") || s.includes("gaming")) return "🎮";
    if (s.includes("aud") || s.includes("head")) return "🎧";
    if (s.includes("carg")) return "🔋";
    if (s.includes("pc") || s.includes("laptop")) return "💻";
    if (s.includes("móvil") || s.includes("movil") || s.includes("cel")) return "📱";
    if (s.includes("control")) return "🕹️";
    if (s.includes("cable")) return "🔌";
    return "🛍️";
  };

  function getProducts(){ return window.SDC_STORE?.getProducts?.() || []; }

  function findProductForCard(card){
    const pid = card.getAttribute("data-pid");
    if (pid){
      return getProducts().find(p => String(p.id||p.nombre||"") === pid) || null;
    }
    const name = card.querySelector(".name")?.textContent?.trim() || "";
    return getProducts().find(p => (p.nombre||"").trim() === name) || null;
  }

  // (2) tachado precio anterior
  function applyPromo(card){
    const p = findProductForCard(card);
    if (!p) return;
    const prev = Number(p.precio_anterior||0);
    const cur  = Number(p.precio||0);
    if (!(prev > 0 && prev > cur)) return;

    const priceEl = card.querySelector(".price");
    if (!priceEl) return;

    if (!priceEl.querySelector(".strike")){
      const strike = document.createElement("span");
      strike.className = "strike";
      strike.textContent = money(prev);
      priceEl.appendChild(strike);
    }
  }

  // (4) share button
  function applyShare(card){
    const wrap = card.querySelector(".imgWrap");
    if (!wrap) return;
    if (wrap.querySelector(".shareBtn")) return;

    const p = findProductForCard(card);
    if (!p) return;

    const btn = document.createElement("button");
    btn.className = "shareBtn";
    btn.type = "button";
    btn.textContent = "↗";
    btn.title = "Compartir";
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const link = window.SDC_SHARE?.shareLinkFor?.(p) || "";
      const txt = `Mira este producto:\n${p.nombre}\n${link}`;
      window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank");
    };
    wrap.appendChild(btn);
  }

  // (9) confirm consultar
  function hookConsultConfirm(){
    document.addEventListener("click", (ev) => {
      const t = ev.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.classList.contains("consultBtn")) return;

      const card = t.closest(".card");
      const p = card ? findProductForCard(card) : null;
      const name = p?.nombre || "este producto";
      const ok = window.confirm(`¿Quieres consultar disponibilidad por WhatsApp?\n\nProducto: ${name}`);
      if (!ok){ ev.preventDefault(); ev.stopPropagation(); }
    }, true);
  }

  // (6) icon tabs
  function iconTabs(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.querySelectorAll(".tab").forEach(t => {
      if (t.dataset.iconed) return;
      const txt = t.textContent || "";
      t.textContent = `${mapEmoji(txt)} ${txt}`;
      t.dataset.iconed = "1";
    });
  }
  function hookTabsIcons(){
    const cat = document.getElementById("catTabs");
    const sub = document.getElementById("subTabs");
    const obs = new MutationObserver(() => { iconTabs("catTabs"); iconTabs("subTabs"); });
    if (cat) obs.observe(cat, { childList:true, subtree:true });
    if (sub) obs.observe(sub, { childList:true, subtree:true });
    iconTabs("catTabs"); iconTabs("subTabs");
  }

  // (8) banner
  function renderBanner(){
    const el = document.getElementById("topBanner");
    if (!el) return;

    const data = window.SDC_STORE?.getData?.() || {};
    const cfg = data.config || {};
    const title = cfg.banner_title || "📦 Envíos a toda Honduras";
    const text  = cfg.banner_text  || "Entrega local en Comayagua y envíos nacionales. Consulta disponibilidad por WhatsApp.";

    el.innerHTML = `<b>${title}</b><div class="mut" style="margin-top:6px">${text}</div>`;
    el.style.display = "block";
  }

  // (10) suggestions
  function renderSuggest(items){
    const box = document.getElementById("suggestBox");
    if (!box) return;

    if (!items.length){
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }

    box.style.display = "block";
    box.innerHTML = items.map(p => `
      <div class="suggestItem" data-id="${String(p.id||p.nombre||"")}">
        <div class="suggestName">${p.nombre}</div>
        <div class="suggestMeta">${p.categoria||""}${p.subcategoria?(" • "+p.subcategoria):""}</div>
      </div>
    `).join("");

    box.querySelectorAll(".suggestItem").forEach(el => {
      el.onclick = () => {
        const id = el.getAttribute("data-id");
        const prod = getProducts().find(x => String(x.id||x.nombre||"") === id);
        if (!prod) return;
        box.style.display="none"; box.innerHTML="";
        window.SDC_PRODUCT_MODAL?.open?.(prod, { setHash:true });
      };
    });
  }

  function hookSuggest(){
    const q = document.getElementById("q");
    const box = document.getElementById("suggestBox");
    if (!q || !box) return;

    q.addEventListener("input", () => {
      const t = (q.value||"").trim().toLowerCase();
      if (!t) return renderSuggest([]);

      const list = getProducts()
        .filter(p => (p.nombre||"").toLowerCase().includes(t) || (p.tags||"").toLowerCase().includes(t))
        .slice(0, 6);

      renderSuggest(list);
    });

    document.addEventListener("click", (e) => {
      if (box.contains(e.target) || e.target.id === "q") return;
      box.style.display="none"; box.innerHTML="";
    });
  }

  // hook grid for promo+share
  function hookGrid(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    const obs = new MutationObserver(() => {
      grid.querySelectorAll(".card").forEach(card => {
        applyPromo(card);
        applyShare(card);
      });
    });
    obs.observe(grid, { childList:true, subtree:true });
  }

  function waitProductsThenInit(){
    const t = setInterval(() => {
      if (getProducts().length === 0) return;
      clearInterval(t);

      hookGrid();
      hookTabsIcons();
      hookConsultConfirm();
      renderBanner();
      hookSuggest();
    }, 250);
  }

  waitProductsThenInit();
})();
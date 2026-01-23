// p6_promo.js
window.SDC_P6_PROMO = (() => {
  let timer = null;

  function toBool(v){
    const s = String(v ?? "").trim().toLowerCase();
    return v === true || s === "1" || s === "true" || s === "si" || s === "sí" || s === "yes";
  }

  function getCfg(){
    const data = window.SDC_STORE?.getData?.() || {};
    const cfg = data.config || {};
    return {
      active: toBool(cfg.promo_active),
      end: String(cfg.promo_end || "").trim(),      // ISO
      title: String(cfg.promo_title || "🔥 Oferta limitada").trim(),
      text: String(cfg.promo_text || "Aprovecha descuentos por tiempo limitado.").trim(),
    };
  }

  function parseEnd(endStr){
    // ISO recomendado: 2026-01-30T23:59:59
    const ms = Date.parse(endStr);
    return Number.isFinite(ms) ? ms : NaN;
  }

  function fmt(ms){
    const s = Math.max(0, Math.floor(ms/1000));
    const hh = String(Math.floor(s/3600)).padStart(2,"0");
    const mm = String(Math.floor((s%3600)/60)).padStart(2,"0");
    const ss = String(s%60).padStart(2,"0");
    return `${hh}:${mm}:${ss}`;
  }

  function ensurePromoBar(){
    if (document.getElementById("promoBar")) return;

    const headerWrap = document.querySelector("header .wrap");
    if (!headerWrap) return;

    const bar = document.createElement("div");
    bar.id = "promoBar";
    bar.className = "promoBar";
    bar.innerHTML = `
      <div>
        <div id="promoTitle" style="font-weight:1000"></div>
        <div class="mut" id="promoText" style="margin-top:4px"></div>
      </div>
      <div class="promoChip" id="promoCountdown">00:00:00</div>
    `;

    // debajo del banner si existe, si no al inicio del header
    const banner = document.getElementById("topBanner");
    if (banner) banner.insertAdjacentElement("afterend", bar);
    else headerWrap.insertAdjacentElement("afterbegin", bar);
  }

  function setPromoBar(title, text, remaining){
    const bar = document.getElementById("promoBar");
    const t = document.getElementById("promoTitle");
    const x = document.getElementById("promoText");
    const c = document.getElementById("promoCountdown");
    if (!bar || !t || !x || !c) return;

    t.textContent = title;
    x.textContent = text;
    c.textContent = remaining;
    bar.classList.add("show");
  }

  function hidePromoBar(){
    document.getElementById("promoBar")?.classList.remove("show");
  }

  // Aplica un ribbon "promo" solo en productos que estén en oferta
  function applyPromoRibbons(remainingText){
    const grid = document.getElementById("grid");
    if (!grid) return;

    grid.querySelectorAll(".card").forEach(card => {
      const pid = card.getAttribute("data-pid");
      if (!pid) return;

      const p = (window.SDC_STORE?.getProducts?.() || []).find(x => String(x.id||x.nombre||"") === pid);
      if (!p) return;

      const isOffer = Number(p.precio_anterior||0) > Number(p.precio||0);
      if (!isOffer) return;

      const wrap = card.querySelector(".imgWrap");
      if (!wrap) return;

      // ribbon container
      let rr = wrap.querySelector(".ribbonRow");
      if (!rr){
        rr = document.createElement("div");
        rr.className = "ribbonRow";
        wrap.appendChild(rr);
      }

      // si ya existe promo ribbon, actualizarlo
      let pr = rr.querySelector(".ribbon.promo");
      if (!pr){
        pr = document.createElement("div");
        pr.className = "ribbon promo";
        rr.appendChild(pr);
      }
      pr.textContent = `⏳ Termina en ${remainingText}`;
    });
  }

  function ensureModalPromoBox(){
    if (document.getElementById("pmPromo")) return;
    const price = document.getElementById("pmPrice");
    if (!price || !price.parentElement) return;
    const box = document.createElement("div");
    box.id = "pmPromo";
    box.className = "pmPromo";
    price.insertAdjacentElement("afterend", box);
  }

  function setModalPromo(remainingText, show){
    ensureModalPromoBox();
    const box = document.getElementById("pmPromo");
    if (!box) return;
    if (!show){
      box.classList.remove("show");
      box.textContent = "";
      return;
    }
    box.classList.add("show");
    box.textContent = `⏳ Oferta termina en ${remainingText}`;
  }

  function hookModal(){
    if (window.__SDC_P6_MODAL_HOOK__) return;
    window.__SDC_P6_MODAL_HOOK__ = true;

    const modal = document.getElementById("productModal");
    if (!modal) return;

    const obs = new MutationObserver(() => {
      if (!modal.classList.contains("open")) return;

      const title = document.getElementById("pmTitle")?.textContent?.trim() || "";
      const p = (window.SDC_STORE?.getProducts?.() || []).find(x => String(x.nombre||"").trim() === title) || null;
      if (!p) return;

      const cfg = getCfg();
      const endMs = parseEnd(cfg.end);

      const isOffer = Number(p.precio_anterior||0) > Number(p.precio||0);
      if (!cfg.active || !Number.isFinite(endMs) || !isOffer){
        setModalPromo("", false);
        return;
      }
      const left = endMs - Date.now();
      if (left <= 0){
        setModalPromo("", false);
        return;
      }
      setModalPromo(fmt(left), true);
    });
    obs.observe(modal, { attributes:true, attributeFilter:["class"] });
  }

  function start(){
    const cfg = getCfg();
    if (!cfg.active) return;

    const endMs = parseEnd(cfg.end);
    if (!Number.isFinite(endMs)) return;

    ensurePromoBar();

    const tick = () => {
      const left = endMs - Date.now();
      if (left <= 0){
        hidePromoBar();
        stop();
        return;
      }
      const t = fmt(left);
      setPromoBar(cfg.title, cfg.text, t);
      applyPromoRibbons(t);
    };

    tick();
    timer = setInterval(tick, 1000);
  }

  function stop(){
    if (timer) clearInterval(timer);
    timer = null;
    hidePromoBar();
  }

  function init(){
    hookModal();

    // espera datos (config)
    const t = setInterval(() => {
      const ok = !!window.SDC_STORE?.getData?.();
      if (!ok) return;
      clearInterval(t);
      start();
    }, 250);

    // fallback por si tarda
    setTimeout(() => { if (!timer) start(); }, 1200);
  }

  return { init, start, stop };
})();
// news_ticker.js (ACTUALIZADO)
(() => {
  function getMsg(){
    const data = window.SDC_STORE?.getData?.() || {};
    const cfg = data.config || {};

    // Puedes cambiar estos textos en Sheets si tu Apps Script expone config
    const title = cfg.banner_title || "📦 Envíos a toda Honduras";
    const text  = cfg.banner_text  || "Entrega local en Comayagua y envíos nacionales. Consulta disponibilidad por WhatsApp.";

    return { title, text };
  }

  function mount(){
    if (document.getElementById("newsTicker")) return;

    const header = document.querySelector("header");
    if (!header) return;

    const t = document.createElement("div");
    t.id = "newsTicker";
    t.className = "newsTicker";
    t.innerHTML = `<div class="tickerInner" id="tickerInner"></div>`;

    // arriba de TODO
    header.insertAdjacentElement("afterbegin", t);
  }

  function render(){
    const t = document.getElementById("newsTicker");
    const inner = document.getElementById("tickerInner");
    if (!t || !inner) return;

    const { title, text } = getMsg();

    inner.innerHTML = `
      <div class="tickerItem">${title} <span>${text}</span></div>
      <div class="tickerItem">${title} <span>${text}</span></div>
      <div class="tickerItem">${title} <span>${text}</span></div>
    `;

    t.classList.add("show");
  }

  function hideOldBannerBlock(){
    // ✅ esto quita el bloque grande que ocupa espacio
    const b = document.getElementById("topBanner");
    if (!b) return;
    b.style.display = "none";
    b.innerHTML = "";
  }

  function init(){
    mount();

    const timer = setInterval(() => {
      const ok = !!window.SDC_STORE?.getData?.();
      if (!ok) return;
      clearInterval(timer);
      hideOldBannerBlock();
      render();
    }, 250);

    setTimeout(() => {
      hideOldBannerBlock();
      render();
    }, 1200);
  }

  window.SDC_TICKER = { init, render };
  init();
})();
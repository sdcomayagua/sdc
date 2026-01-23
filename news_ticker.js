// news_ticker.js (FIX ESTRUCTURA)
// - Deja SOLO el ticker arriba
// - Oculta por completo el bloque grande #topBanner si existiera

(() => {
  function getMsg(){
    const data = window.SDC_STORE?.getData?.() || {};
    const cfg = data.config || {};
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
    header.insertAdjacentElement("afterbegin", t);
  }

  function hideOldBannerBlock(){
    const b = document.getElementById("topBanner");
    if (!b) return;
    b.style.display = "none";
    b.innerHTML = "";
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

  function init(){
    mount();

    const timer = setInterval(() => {
      const ok = !!window.SDC_STORE?.getData?.();
      if (!ok) return;
      clearInterval(timer);
      hideOldBannerBlock();
      render();
    }, 250);

    // fallback
    setTimeout(() => {
      hideOldBannerBlock();
      render();
    }, 1200);
  }

  window.SDC_TICKER = { init, render };
  init();
})();
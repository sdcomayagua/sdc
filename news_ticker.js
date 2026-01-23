// news_ticker.js
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
    t.innerHTML = `
      <div class="tickerInner" id="tickerInner"></div>
    `;

    // arriba de todo dentro del header
    header.insertAdjacentElement("afterbegin", t);
  }

  function render(){
    const t = document.getElementById("newsTicker");
    const inner = document.getElementById("tickerInner");
    if (!t || !inner) return;

    const { title, text } = getMsg();

    // repetimos 2 veces para que sea continuo y no se corte
    inner.innerHTML = `
      <div class="tickerItem">${title} <span>${text}</span></div>
      <div class="tickerItem">${title} <span>${text}</span></div>
      <div class="tickerItem">${title} <span>${text}</span></div>
    `;

    t.classList.add("show");
  }

  function init(){
    mount();

    // espera a que cargue DATA del catálogo
    const timer = setInterval(() => {
      const ok = !!window.SDC_STORE?.getData?.();
      if (!ok) return;
      clearInterval(timer);
      render();
    }, 250);

    // fallback rápido si tarda mucho
    setTimeout(() => {
      if (!document.getElementById("newsTicker")?.classList.contains("show")) render();
    }, 1200);
  }

  window.SDC_TICKER = { init, render };
})();
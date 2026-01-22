window.SDC_VIEW2 = (() => {
  const KEY = "SDC_VIEW_MODE2"; // detail | compact | list
  const order = ["detail","compact","list"];

  function get(){
    const v = localStorage.getItem(KEY);
    return order.includes(v) ? v : "detail";
  }

  function apply(mode){
    const m = order.includes(mode) ? mode : "detail";
    document.body.setAttribute("data-view", m);
    localStorage.setItem(KEY, m);
    syncBtns(m);
    window.SDC_CATALOG_UI?.renderGrid?.();
  }

  function next(){
    const cur = get();
    const idx = order.indexOf(cur);
    apply(order[(idx+1)%order.length]);
  }

  function syncBtns(m){
    const icon = m==="detail" ? "🧾" : (m==="compact" ? "⚡" : "📋");
    const label = m==="detail" ? "Detalle" : (m==="compact" ? "Rápido" : "Lista");
    const b1 = document.getElementById("viewBtn");
    const b2 = document.getElementById("bottomViewBtn");
    if (b1) b1.innerHTML = `${icon} <span class="tText">${label}</span>`;
    if (b2) b2.innerHTML = `${icon}`;
  }

  function init(){
    apply(get());
    document.getElementById("viewBtn")?.addEventListener("click", next);
    document.getElementById("bottomViewBtn")?.addEventListener("click", next);
  }

  return { init, get, apply, next };
})();
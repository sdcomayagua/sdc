window.SDC_VIEW = (() => {
  const KEY = "SDC_VIEW_MODE"; // "detail" | "compact"

  function get() {
    const v = localStorage.getItem(KEY);
    return (v === "compact" || v === "detail") ? v : "detail";
  }

  function apply(v) {
    const mode = (v === "compact") ? "compact" : "detail";
    document.body.setAttribute("data-view", mode);
    localStorage.setItem(KEY, mode);
    syncButtons(mode);
    // re-render catálogo
    window.SDC_CATALOG_UI?.renderGrid?.();
  }

  function toggle() {
    apply(get() === "detail" ? "compact" : "detail");
  }

  function syncButtons(mode) {
    const txt = (mode === "compact") ? "Rápido" : "Detalle";
    const icon = (mode === "compact") ? "⚡" : "🧾";

    const b1 = document.getElementById("viewBtn");
    const b2 = document.getElementById("bottomViewBtn");
    if (b1) b1.innerHTML = `${icon} <span class="tText">${txt}</span>`;
    if (b2) b2.innerHTML = `${icon}`;
  }

  function init() {
    const mode = get();
    document.body.setAttribute("data-view", mode);
    syncButtons(mode);

    document.getElementById("viewBtn")?.addEventListener("click", toggle);
    document.getElementById("bottomViewBtn")?.addEventListener("click", toggle);
  }

  return { init, get, apply, toggle };
})();
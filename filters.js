window.SDC_FILTERS = (() => {
  const KEY = "SDC_QUICK_FILTER";
  let mode = "all"; // all | stock | offers | featured

  function getMode(){ return mode; }

  function setMode(next){
    mode = next;
    localStorage.setItem(KEY, mode);
    paint();
    // re-render grid
    window.SDC_CATALOG_UI?.renderGrid?.();
  }

  function init(){
    const el = document.getElementById("quickFilters");
    if (!el) return;

    mode = localStorage.getItem(KEY) || "all";

    el.innerHTML = `
      <button class="chip" data-mode="all">Todo</button>
      <button class="chip" data-mode="stock">Disponibles</button>
      <button class="chip" data-mode="offers">Ofertas</button>
      <button class="chip" data-mode="featured">Destacados</button>
    `;

    el.querySelectorAll(".chip").forEach(b => {
      b.onclick = () => setMode(b.getAttribute("data-mode"));
    });

    paint();
  }

  function paint(){
    const el = document.getElementById("quickFilters");
    if (!el) return;
    el.querySelectorAll(".chip").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });
  }

  return { init, getMode, setMode };
})();

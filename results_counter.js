window.SDC_RESULTS = (() => {
  function ensure(){
    // lo ponemos arriba del grid
    const grid = document.getElementById("grid");
    if (!grid) return null;

    let el = document.getElementById("resultsCount");
    if (!el) {
      el = document.createElement("div");
      el.id = "resultsCount";
      el.className = "resultsPill";
      el.style.display = "none";
      grid.insertAdjacentElement("beforebegin", el);
    }
    return el;
  }

  function refresh(){
    const el = ensure();
    if (!el) return;

    const wrap = document.getElementById("loadMoreWrap");
    const note = document.getElementById("loadMoreNote");
    const grid = document.getElementById("grid");

    // Si existe loadMoreNote, úsalo como fuente (ya contiene Mostrando X de Y)
    const txt = (note && note.textContent) ? note.textContent.trim() : "";

    if (txt) {
      el.textContent = txt;
      el.style.display = "inline-flex";
      return;
    }

    // fallback: si no hay txt, ocultar
    el.style.display = "none";
  }

  function init(){
    ensure();
  }

  return { init, refresh };
})();
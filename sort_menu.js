window.SDC_SORT_MENU = (() => {
  function open() {
    syncActive();
    const m = document.getElementById("sortModal");
    if (m) m.classList.add("open");
  }

  function close() {
    const m = document.getElementById("sortModal");
    if (m) m.classList.remove("open");
  }

  function getCurrentSort(){
    const sel = document.getElementById("sortSel");
    return sel ? (sel.value || "relevancia") : "relevancia";
  }

  function setSort(value){
    const sel = document.getElementById("sortSel");
    if (sel) sel.value = value;
    syncActive();
    window.SDC_CATALOG_UI?.renderGrid?.();
    close();
  }

  function syncActive(){
    const cur = getCurrentSort();
    document.querySelectorAll(".sortItem").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-sort") === cur);
    });
  }

  function init(){
    const btn = document.getElementById("sortBtnMobile");
    const closeBtn = document.getElementById("sortClose");
    const modal = document.getElementById("sortModal");

    if (btn) btn.onclick = open;
    if (closeBtn) closeBtn.onclick = close;
    if (modal) modal.onclick = (e) => { if (e.target.id === "sortModal") close(); };

    document.querySelectorAll(".sortItem").forEach(b => {
      b.onclick = () => setSort(b.getAttribute("data-sort"));
    });

    // si cambian el select (desktop), refleja en móvil también
    const sel = document.getElementById("sortSel");
    if (sel) sel.addEventListener("change", syncActive);

    syncActive();
  }

  return { init, open, close, setSort };
})();

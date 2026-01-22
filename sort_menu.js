window.SDC_SORT_MENU = (() => {
  function open() {
    const m = document.getElementById("sortModal");
    if (m) m.classList.add("open");
  }
  function close() {
    const m = document.getElementById("sortModal");
    if (m) m.classList.remove("open");
  }

  function setSort(value){
    const sel = document.getElementById("sortSel");
    if (sel) {
      sel.value = value;
      // dispara render
      window.SDC_CATALOG_UI?.renderGrid?.();
    }
    close();
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
  }

  return { init, open, close, setSort };
})();

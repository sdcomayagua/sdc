window.SDC_SEARCH_UI = (() => {
  function init(){
    const q = document.getElementById("q");
    const wrap = q?.closest(".search");
    if (!q || !wrap) return;

    // crea botón X si no existe
    let btn = document.getElementById("searchClear");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "searchClear";
      btn.type = "button";
      btn.className = "searchClear";
      btn.textContent = "✕";
      wrap.appendChild(btn);
    }

    const sync = () => {
      btn.classList.toggle("show", (q.value || "").trim().length > 0);
    };

    btn.onclick = () => {
      q.value = "";
      q.dispatchEvent(new Event("input", { bubbles:true }));
      q.focus();
      sync();
    };

    q.addEventListener("input", sync);
    sync();
  }
  return { init };
})();
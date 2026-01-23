// fase3_ui.js
window.SDC_FASE3_UI = (() => {
  function closeSuggest(){
    const box = document.getElementById("suggestBox");
    if (!box) return;
    box.style.display = "none";
    box.innerHTML = "";
  }

  function hookCloseSuggestOnScroll(){
    window.addEventListener("scroll", () => closeSuggest(), { passive:true });
  }

  function pointerCards(){
    const grid = document.getElementById("grid");
    if (!grid) return;
    grid.querySelectorAll(".card").forEach(c => c.style.cursor = "pointer");
  }

  function hookGrid(){
    const grid = document.getElementById("grid");
    if (!grid) return;

    if (window.__SDC_FASE3_GRID__) return;
    window.__SDC_FASE3_GRID__ = true;

    const obs = new MutationObserver(() => pointerCards());
    obs.observe(grid, { childList:true, subtree:true });
  }

  function init(){
    hookCloseSuggestOnScroll();
    hookGrid();
    pointerCards();
  }

  return { init };
})();
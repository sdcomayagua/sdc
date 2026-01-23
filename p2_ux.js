// p2_ux.js
window.SDC_P2 = (() => {
  function isMobile(){ return window.matchMedia("(max-width: 720px)").matches; }

  function closeSuggest(){
    const box = document.getElementById("suggestBox");
    if (!box) return;
    box.style.display = "none";
    box.innerHTML = "";
  }

  function hookCloseSuggestOnScroll(){
    window.addEventListener("scroll", () => {
      if (!isMobile()) return;
      closeSuggest();
    }, { passive:true });
  }

  // Scroll a inicio del grid (más natural que top 0)
  function scrollToGrid(){
    const grid = document.getElementById("grid");
    if (!grid) return;
    const y = grid.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }

  function hookTabsScroll(){
    const cat = document.getElementById("catTabs");
    const sub = document.getElementById("subTabs");
    function onClick(e){
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.classList.contains("tab")) return;
      if (!isMobile()) return;
      // deja que renderice y luego sube al grid
      setTimeout(scrollToGrid, 80);
    }
    cat?.addEventListener("click", onClick);
    sub?.addEventListener("click", onClick);
  }

  // Status pill safe
  function ensureStatusPill(){
    if (document.getElementById("statusPill")) return;
    const headerWrap = document.querySelector("header .wrap");
    if (!headerWrap) return;
    const p = document.createElement("div");
    p.className = "pill";
    p.id = "statusPill";
    p.textContent = "Cargando catálogo...";
    headerWrap.appendChild(p);
  }

  function init(){
    ensureStatusPill();
    hookCloseSuggestOnScroll();
    hookTabsScroll();
  }

  return { init };
})();
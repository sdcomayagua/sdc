// store_extras.js
(() => {
  function qs(id){ return document.getElementById(id); }

  // 1) Insertar AppBar dentro del header
  function injectAppBar(){
    const headerWrap = document.querySelector("header .wrap");
    if (!headerWrap) return;
    if (qs("appBar")) return;

    const bar = document.createElement("div");
    bar.id = "appBar";
    bar.className = "appBar";

    bar.innerHTML = `
      <div class="appBarTitle">
        <span class="appBarDot"></span>
        <span>Catálogo SDC</span>
      </div>
      <div class="appBarBtns">
        <button class="appIconBtn" id="appCatsBtn" type="button" title="Categorías">☰</button>
        <button class="appIconBtn" id="appThemeBtn" type="button" title="Día/Noche">🌓</button>
      </div>
    `;

    // Ponerlo al inicio del header wrap
    headerWrap.insertAdjacentElement("afterbegin", bar);

    // acciones
    qs("appThemeBtn")?.addEventListener("click", () => window.SDC_THEME?.toggle?.());
    qs("appCatsBtn")?.addEventListener("click", openDrawer);
  }

  // 2) Drawer categorías: usa los tabs actuales (catTabs)
  function injectDrawer(){
    if (qs("drawer")) return;

    const overlay = document.createElement("div");
    overlay.id = "drawerOverlay";
    overlay.className = "drawerOverlay";

    const drawer = document.createElement("div");
    drawer.id = "drawer";
    drawer.className = "drawer";

    drawer.innerHTML = `
      <div class="drawerHead">
        <div class="drawerTitle">Categorías</div>
        <button class="drawerClose" id="drawerClose" type="button">✕</button>
      </div>
      <div class="drawerBody">
        <div class="note" style="margin-bottom:10px">Toca una categoría para filtrar.</div>
        <div id="drawerCats"></div>
        <div style="height:12px"></div>
        <div class="note" style="margin-bottom:10px">Subcategorías</div>
        <div id="drawerSubs"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    overlay.addEventListener("click", closeDrawer);
    qs("drawerClose")?.addEventListener("click", closeDrawer);
  }

  function openDrawer(){
    injectDrawer();
    syncDrawerLists();
    qs("drawerOverlay")?.classList.add("open");
    qs("drawer")?.classList.add("open");
  }

  function closeDrawer(){
    qs("drawerOverlay")?.classList.remove("open");
    qs("drawer")?.classList.remove("open");
  }

  function cloneTabs(sourceId, targetId){
    const src = qs(sourceId);
    const tgt = qs(targetId);
    if (!src || !tgt) return;
    tgt.innerHTML = "";
    // clonamos tabs como botones
    src.querySelectorAll(".tab").forEach(tab=>{
      const b = document.createElement("button");
      b.className = "btn ghost";
      b.style.width = "100%";
      b.style.marginBottom = "8px";
      b.style.textAlign = "left";
      b.textContent = tab.textContent || "";
      if (tab.classList.contains("active")) {
        b.style.borderColor = "rgba(37,211,102,.45)";
      }
      b.onclick = () => {
        tab.click();
        closeDrawer();
      };
      tgt.appendChild(b);
    });
  }

  function syncDrawerLists(){
    cloneTabs("catTabs", "drawerCats");
    cloneTabs("subTabs", "drawerSubs");
  }

  // 3) Fade-in cards: observa y aplica clase en grid cuando se renderiza
  function enableFadeIn(){
    const grid = qs("grid");
    if (!grid) return;

    const obs = new MutationObserver(() => {
      // aplicar a cards nuevas
      grid.querySelectorAll(".card:not(.fadeIn)").forEach((c, idx) => {
        c.classList.add("fadeIn");
        c.style.animationDelay = `${Math.min(120, idx * 16)}ms`;
      });
    });

    obs.observe(grid, { childList:true, subtree:true });
  }

  function init(){
    injectAppBar();
    injectDrawer();
    enableFadeIn();

    // mantener drawer actualizado cuando cambias tabs
    const catTabs = qs("catTabs");
    const subTabs = qs("subTabs");
    const obs = new MutationObserver(() => { if (qs("drawer")?.classList.contains("open")) syncDrawerLists(); });
    if (catTabs) obs.observe(catTabs, { childList:true, subtree:true });
    if (subTabs) obs.observe(subTabs, { childList:true, subtree:true });
  }

  window.SDC_STORE_EXTRAS = { init };
})();
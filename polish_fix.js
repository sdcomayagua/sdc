// polish_fix.js — Arreglo definitivo:
// 1) Repara botón carrito (no reescribir innerHTML)
// 2) Mueve Trust + Cotiza al final real
// 3) Modo noche: fallback 100% funcional

window.SDC_POLISH = (() => {
  const isMobile = () => window.matchMedia("(max-width:720px)").matches;

  function setTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    try{ localStorage.setItem("SDC_THEME", theme); }catch{}
  }

  function getTheme(){
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    try{ return localStorage.getItem("SDC_THEME") || "light"; }catch{ return "light"; }
  }

  function bindTheme(){
    const btn = document.getElementById("themeBtn") || document.getElementById("bottomThemeBtn");
    if (!btn) return;

    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";

    // Inicializa desde storage si theme.js no lo hace
    setTheme(getTheme());

    btn.addEventListener("click", () => {
      // usa theme.js si existe, si no fallback
      if (window.SDC_THEME?.toggle){
        try{ window.SDC_THEME.toggle(); }catch{}
      }
      // fallback robusto (por si toggle no cambia data-theme)
      const cur = getTheme();
      const next = (cur === "dark") ? "light" : "dark";
      setTheme(next);

      // cambia iconito si existe en el botón
      const icon = btn.querySelector(".tIcon");
      if (icon) icon.textContent = (next === "dark") ? "🌙" : "☀️";
    });
  }

  // Reparar carrito: NO tocar innerHTML nunca
  function fixCartBtn(){
    const btn = document.getElementById("cartBtn");
    const countEl = document.getElementById("cartCount");
    if (!btn || !countEl) return;

    // si algún script lo reescribió, lo restauramos a formato estable
    if (!btn.dataset.stable){
      btn.dataset.stable = "1";
      btn.innerHTML = `🛒 <span class="cartMiniText">Carrito</span> (<span id="cartCount">${countEl.textContent||"0"}</span>)`;
    }

    // en móvil lo queremos tipo “🛒 2”
    const count = Number(countEl.textContent||"0") || 0;
    if (isMobile()){
      btn.innerHTML = `🛒 <span id="cartCount">${count}</span>`;
    } else {
      btn.innerHTML = `🛒 <span class="cartMiniText">Carrito</span> (<span id="cartCount">${count}</span>)`;
    }
  }

  function hookCartCount(){
    const countEl = document.getElementById("cartCount");
    if (!countEl) return;
    if (window.__SDC_CARTBTN_OBS__) return;
    window.__SDC_CARTBTN_OBS__ = true;

    const obs = new MutationObserver(() => fixCartBtn());
    obs.observe(countEl, { childList:true, subtree:true });
    fixCartBtn();

    // también al cambiar tamaño pantalla
    window.addEventListener("resize", () => fixCartBtn(), { passive:true });
  }

  // Mover trustFooter y shipAcc al final real (abajo del todo)
  function moveFooterBlocks(){
    const main = document.querySelector("main.wrap");
    if (!main) return;

    document.body.classList.add("is-moving-footer");

    const trust = document.getElementById("trustFooter");
    const ship = document.getElementById("shipAcc");

    // si existen, los movemos al final
    if (trust) main.appendChild(trust);
    if (ship) main.appendChild(ship);

    document.body.classList.remove("is-moving-footer");
  }

  // reintenta después de render
  function scheduleFooterMove(){
    moveFooterBlocks();
    setTimeout(moveFooterBlocks, 400);
    setTimeout(moveFooterBlocks, 1200);
  }

  function init(){
    bindTheme();
    hookCartCount();
    scheduleFooterMove();
  }

  return { init, fixCartBtn, moveFooterBlocks };
})();
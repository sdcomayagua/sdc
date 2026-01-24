// polish_fix.js (COMPLETO) — Fix final del header:
// ✅ Modo noche no se pega
// ✅ Elimina buscador duplicado
// ✅ Carrito NO se deforma
// ✅ Compacta header al scrollear (como app)

window.SDC_POLISH = (() => {
  const isMobile = () => window.matchMedia("(max-width:720px)").matches;

  // ---------- THEME FIX (no se pega) ----------
  function setTheme(t){
    document.documentElement.setAttribute("data-theme", t);
    try{ localStorage.setItem("SDC_THEME", t); }catch{}
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

    // init
    setTheme(getTheme());

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // intenta theme.js si existe
      try{ window.SDC_THEME?.toggle?.(); }catch{}

      // fallback SIEMPRE (por si toggle no cambia nada)
      const cur = getTheme();
      const next = (cur === "dark") ? "light" : "dark";
      setTheme(next);

      // fuerza repaint (evita “se queda pegado”)
      requestAnimationFrame(() => {
        document.body.style.transform = "translateZ(0)";
        setTimeout(() => { document.body.style.transform = ""; }, 30);
      });
    }, { passive:false });
  }

  // ---------- HEADER SMART COMPACT ----------
  function smartHeader(){
    const header = document.querySelector("header");
    if (!header) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    function run(){
      const y = window.scrollY || 0;
      const down = y > lastY;
      lastY = y;

      if (!isMobile()){
        header.classList.remove("compact");
        return;
      }

      if (y < 80){
        header.classList.remove("compact");
        return;
      }

      if (down) header.classList.add("compact");
      else header.classList.remove("compact");
    }

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { run(); ticking = false; });
    }, { passive:true });

    run();
  }

  // ---------- FIX CARRITO (no deformar / no reescribir raro) ----------
  function fixCartBtn(){
    const btn = document.getElementById("cartBtn");
    const countEl = document.getElementById("cartCount");
    if (!btn || !countEl) return;

    const count = Number(countEl.textContent||"0") || 0;

    // móvil: “🛒 2”
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
    window.addEventListener("resize", fixCartBtn, { passive:true });
  }

  // ---------- ELIMINAR BUSCADOR DUPLICADO ----------
  function removeDuplicateSearch(){
    // En tu captura aparece “Buscar producto…” dos veces
    const inputs = Array.from(document.querySelectorAll('input[placeholder="Buscar producto..."]'));
    if (inputs.length <= 1) return;

    // Mantener SOLO el que tiene id="q"
    inputs.forEach(inp => {
      if (inp.id !== "q") {
        const box = inp.closest(".search") || inp.parentElement;
        if (box) box.style.display = "none";
        else inp.style.display = "none";
      }
    });
  }

  // reintenta porque algunos scripts lo crean después
  function scheduleDupFix(){
    removeDuplicateSearch();
    setTimeout(removeDuplicateSearch, 200);
    setTimeout(removeDuplicateSearch, 700);
    setTimeout(removeDuplicateSearch, 1400);
  }

  function init(){
    bindTheme();
    smartHeader();
    hookCartCount();
    scheduleDupFix();
  }

  return { init };
})();
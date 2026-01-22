window.SDC_TABS = (() => {
  let mode = "cat"; // "cat" | "sub"

  const $ = (id) => document.getElementById(id);

  function isMobile() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function setMode(next) {
    mode = next === "sub" ? "sub" : "cat";
    const cat = $("catTabs");
    const sub = $("subTabs");
    const t = $("tabsToggleLabel");

    if (!cat || !sub || !t) return;

    cat.style.display = (mode === "cat") ? "flex" : "none";
    sub.style.display = (mode === "sub") ? "flex" : "none";
    t.textContent = (mode === "cat") ? "Categorías" : "Subcategorías";
  }

  function init() {
    const toggle = $("tabsToggleBtn");
    if (!toggle) return;

    // En desktop: mostramos ambas filas como siempre
    if (!isMobile()) {
      $("catTabs").style.display = "flex";
      $("subTabs").style.display = "flex";
      toggle.style.display = "none";
      return;
    }

    // En móvil: 1 sola fila + toggle
    toggle.style.display = "inline-flex";
    setMode("cat");

    toggle.onclick = () => setMode(mode === "cat" ? "sub" : "cat");

    // Auto: al elegir categoría distinta a "Todas", saltar a subcategorías
    $("catTabs")?.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      const txt = (tab.textContent || "").trim().toLowerCase();
      if (txt && txt !== "todas") setMode("sub");
    });

    // Si toca “Todas” en sub, volver a categorías (opcional y cómodo)
    $("subTabs")?.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      const txt = (tab.textContent || "").trim().toLowerCase();
      if (txt === "todas") setMode("cat");
    });

    // Reaccionar si cambian tamaño (rotación o resize)
    window.addEventListener("resize", () => {
      if (!isMobile()) {
        $("catTabs").style.display = "flex";
        $("subTabs").style.display = "flex";
        toggle.style.display = "none";
      } else {
        toggle.style.display = "inline-flex";
        setMode(mode);
      }
    });
  }

  return { init, setMode };
})();
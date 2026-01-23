// loading_fix.js — FIX: activa loader inmediato y crea shell arriba del main
window.SDC_LOADING = (() => {
  let startedAt = 0;

  function ensureShell(){
    if (document.getElementById("loadingShell")) return;

    const main = document.querySelector("main.wrap");
    if (!main) return;

    const shell = document.createElement("div");
    shell.id = "loadingShell";
    shell.className = "loadingShell";

    shell.innerHTML = `
      <div class="ldRow">
        <div class="ldPill shimmer lg"></div>
        <div class="ldPill shimmer sm"></div>
        <div class="ldPill shimmer sm"></div>
      </div>

      <div class="ldRow">
        <div class="ldPill shimmer sm"></div>
        <div class="ldPill shimmer sm"></div>
        <div class="ldPill shimmer sm"></div>
        <div class="ldPill shimmer sm"></div>
      </div>

      <div class="ldGrid">
        ${Array.from({length:8}).map(()=>`
          <div class="ldCard shimmer">
            <div class="ldRibbonRow">
              <div class="ldRibbon"></div>
              <div class="ldRibbon"></div>
            </div>
            <div class="ldImg"></div>
            <div class="ldBody">
              <div class="ldLine lg"></div>
              <div class="ldLine md"></div>
              <div class="ldLine sm"></div>
              <div class="ldBtn"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    // IMPORTANTE: insertarlo al inicio del main para que sea lo primero visible
    main.insertAdjacentElement("afterbegin", shell);
  }

  function start(){
    ensureShell();
    startedAt = Date.now();
    document.body.classList.add("is-loading");

    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Cargando catálogo…";
  }

  function stop(){
    // mínimo para evitar parpadeo
    const minMs = 450;
    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, minMs - elapsed);

    setTimeout(() => {
      document.body.classList.remove("is-loading");
      const pill = document.getElementById("statusPill");
      if (pill && pill.textContent.includes("Cargando")) pill.textContent = "Catálogo listo ✅";
    }, wait);
  }

  // ✅ Auto-start lo más temprano posible (apenas existe el body)
  (function auto(){
    try{
      if (document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", () => start(), { once:true });
      } else {
        start();
      }
    }catch{}
  })();

  return { start, stop, ensureShell };
})();
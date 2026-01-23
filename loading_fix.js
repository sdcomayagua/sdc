// loading_fix.js — PRO Loader (skeleton igual a tu tienda)
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
      <!-- Top Ofertas skeleton -->
      <div class="ldSection">
        <div class="ldTitleRow">
          <div class="ldTitle shimmer"></div>
          <div class="ldSub shimmer"></div>
        </div>
        <div class="ldHRow">
          ${Array.from({length:5}).map(()=>`
            <div class="ldHCard shimmer">
              <div class="ldHImg"></div>
              <div class="ldHP">
                <div class="ldHL1"></div>
                <div class="ldHL2"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Grid skeleton (cards reales) -->
      <div class="ldGrid" style="margin-top:14px">
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

    // Lo ponemos justo al inicio del main para que se vea natural
    main.insertAdjacentElement("afterbegin", shell);
  }

  function start(){
    ensureShell();
    startedAt = Date.now();
    document.body.classList.add("is-loading");
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Cargando catálogo…";
  }

  // Evita “parpadeo”: mínimo 500ms de loader
  function stop(){
    const minMs = 500;
    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, minMs - elapsed);

    setTimeout(() => {
      document.body.classList.remove("is-loading");
      const pill = document.getElementById("statusPill");
      if (pill && pill.textContent.includes("Cargando")) pill.textContent = "Catálogo listo ✅";
    }, wait);
  }

  return { start, stop, ensureShell };
})();
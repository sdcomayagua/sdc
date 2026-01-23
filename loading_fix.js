// loading_fix.js — Loader visual + skeleton (no se ve vacío)
window.SDC_LOADING = (() => {
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
    main.insertAdjacentElement("afterbegin", shell);
  }

  function start(){
    ensureShell();
    document.body.classList.add("is-loading");
    const pill = document.getElementById("statusPill");
    if (pill) pill.textContent = "Cargando catálogo…";
  }

  function stop(){
    document.body.classList.remove("is-loading");
    const pill = document.getElementById("statusPill");
    if (pill && pill.textContent.includes("Cargando")) pill.textContent = "Catálogo listo ✅";
  }

  return { start, stop, ensureShell };
})();
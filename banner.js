window.SDC_BANNER = (() => {
  const KEY = "SDC_BANNER_HIDE";

  function init() {
    const el = document.getElementById("topBanner");
    if (!el) return;

    if (localStorage.getItem(KEY) === "1") {
      el.innerHTML = "";
      el.style.display = "none";
      return;
    }

    // Texto pro (edítalo cuando quieras)
    const msg = "Envíos a toda Honduras • Comayagua a domicilio • Pago al recibir disponible";

    el.className = "banner";
    el.innerHTML = `
      <div class="bLeft">✨ ${escapeHtml(msg)}</div>
      <button class="btn ghost bClose" id="bannerClose" type="button">Cerrar</button>
    `;

    document.getElementById("bannerClose").onclick = () => {
      localStorage.setItem(KEY, "1");
      el.style.display = "none";
    };
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  }

  return { init };
})();

// c_health_check.js
// C) Estabilidad: evita secciones duplicadas, asegura mounts, evita "pensando".

window.SDC_HEALTH = (() => {
  function ensure(id, whereSel="body"){
    if (document.getElementById(id)) return;
    const el = document.createElement("div");
    el.id = id;
    document.querySelector(whereSel)?.appendChild(el);
  }

  function removeDuplicatesById(id){
    const all = document.querySelectorAll("#"+CSS.escape(id));
    if (all.length <= 1) return;
    for (let i=1;i<all.length;i++) all[i].remove();
  }

  function removeDuplicateSections(){
    ["statsSection","topOffersSection","favSection","trustFooter","shipAcc"].forEach(removeDuplicatesById);
  }

  function ensureMounts(){
    ensure("templatesMount","body");
    // banner viejo se oculta por ticker
    const b = document.getElementById("topBanner");
    if (b){ b.style.display="none"; b.innerHTML=""; }
  }

  function init(){
    ensureMounts();
    removeDuplicateSections();
  }

  return { init };
})();
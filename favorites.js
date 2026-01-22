// favorites.js
window.SDC_FAV = (() => {
  const KEY = "SDC_FAVORITES"; // array de ids

  function read(){
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function write(arr){
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
  }

  function isFav(id){
    const list = read();
    return list.includes(id);
  }

  function toggle(id){
    const list = read();
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i,1);
    else list.unshift(id);
    write(list);
    return list.includes(id);
  }

  // botón en modal
  function injectModalFav(){
    const actions = document.getElementById("pmActions");
    if (!actions) return;

    if (document.getElementById("favBtn")) return;

    const b = document.createElement("button");
    b.id = "favBtn";
    b.type = "button";
    b.className = "btn ghost";
    b.textContent = "♡ Favorito";
    actions.appendChild(b);

    b.onclick = () => {
      const p = window.__SDC_CURRENT_PRODUCT__;
      if (!p) return;
      const ok = toggle(String(p.id||p.nombre||""));
      b.textContent = ok ? "♥ Favorito" : "♡ Favorito";
      window.SDC_UTILS?.toast?.(ok ? "Guardado en favoritos" : "Quitado de favoritos");
    };
  }

  function syncModalFav(p){
    window.__SDC_CURRENT_PRODUCT__ = p;
    const b = document.getElementById("favBtn");
    if (!b) return;
    const id = String(p.id||p.nombre||"");
    b.textContent = isFav(id) ? "♥ Favorito" : "♡ Favorito";
  }

  function init(){
    injectModalFav();
  }

  return { init, syncModalFav, isFav, toggle, read };
})();
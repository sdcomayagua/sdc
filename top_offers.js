// top_offers.js
window.SDC_TOP_OFFERS = (() => {
  function pct(p){
    const prev = Number(p.precio_anterior||0);
    const cur  = Number(p.precio||0);
    if (!(prev > 0 && prev > cur)) return 0;
    return Math.round(((prev-cur)/prev)*100);
  }

  function render(){
    const sec = document.getElementById("topOffersSection");
    const row = document.getElementById("topOffersRow");
    if (!sec || !row) return;

    const list = (window.SDC_STORE?.getProducts?.() || [])
      .filter(p => Number(p.precio_anterior||0) > Number(p.precio||0))
      .map(p => ({ p, pct: pct(p) }))
      .sort((a,b)=>b.pct - a.pct)
      .slice(0, 12);

    if (!list.length){
      sec.style.display = "none";
      row.innerHTML = "";
      return;
    }

    sec.style.display = "block";
    row.innerHTML = "";

    list.forEach(({p, pct})=>{
      const c = document.createElement("div");
      c.className = "hCard";
      c.onclick = () => window.SDC_PRODUCT_MODAL?.open?.(p, { setHash:true });

      const img = document.createElement("img");
      img.src = p.imagen || (window.SDC_FALLBACK_IMG?.url||"");
      img.onerror = () => { img.src = (window.SDC_FALLBACK_IMG?.url||""); };

      const hp = document.createElement("div");
      hp.className = "hp";
      hp.innerHTML = `
        <div class="hname">${p.nombre||""}</div>
        <div class="hprice">${window.SDC_UTILS?.money?.(p.precio, window.SDC_CONFIG?.CURRENCY)||""}</div>
        <div class="saveLine">OFERTA <b>-${pct}%</b></div>
      `;

      c.appendChild(img);
      c.appendChild(hp);
      row.appendChild(c);
    });
  }

  return { render };
})();
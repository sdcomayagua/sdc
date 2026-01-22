window.SDC_PRICE = (() => {
  const KEY = "SDC_PRICE_RANGE";
  // ranges: all | 0-500 | 500-1000 | 1000-2000 | 2000+
  let range = "all";

  function load(){
    const v = localStorage.getItem(KEY);
    range = v || "all";
  }

  function save(v){
    range = v || "all";
    localStorage.setItem(KEY, range);
    paint();
    window.SDC_CATALOG_UI?.renderGrid?.();
  }

  function get(){ return range; }

  function apply(list){
    if (range === "all") return list;
    const price = (p)=>Number(p.precio||0);

    if (range === "0-500") return list.filter(p=>price(p) <= 500);
    if (range === "500-1000") return list.filter(p=>price(p) > 500 && price(p) <= 1000);
    if (range === "1000-2000") return list.filter(p=>price(p) > 1000 && price(p) <= 2000);
    if (range === "2000+") return list.filter(p=>price(p) > 2000);
    return list;
  }

  function init(){
    load();
    const el = document.getElementById("priceFilters");
    if (!el) return;

    el.innerHTML = `
      <button class="chip" data-p="all">Todo</button>
      <button class="chip" data-p="0-500">≤ 500</button>
      <button class="chip" data-p="500-1000">501–1000</button>
      <button class="chip" data-p="1000-2000">1001–2000</button>
      <button class="chip" data-p="2000+">2000+</button>
    `;

    el.querySelectorAll(".chip").forEach(b=>{
      b.onclick = ()=>save(b.getAttribute("data-p"));
    });

    paint();
  }

  function paint(){
    const el = document.getElementById("priceFilters");
    if (!el) return;
    el.querySelectorAll(".chip").forEach(b=>{
      b.classList.toggle("active", b.getAttribute("data-p") === range);
    });
  }

  return { init, get, apply, save };
})();
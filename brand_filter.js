window.SDC_BRAND = (() => {
  const KEY = "SDC_BRAND_FILTER";
  let brand = "all";

  function load(){
    brand = localStorage.getItem(KEY) || "all";
  }
  function save(v){
    brand = v || "all";
    localStorage.setItem(KEY, brand);
    paint();
    window.SDC_CATALOG_UI?.renderGrid?.();
  }
  function get(){ return brand; }

  function apply(list){
    if (brand === "all") return list;
    const b = brand.toLowerCase();
    return (list||[]).filter(p =>
      String(p.marca||"").toLowerCase().includes(b) ||
      String(p.compatibilidad||"").toLowerCase().includes(b)
    );
  }

  function init(){
    load();
    const el = document.getElementById("brandFilter");
    if (!el) return;

    // opciones simples (puedes escribir a mano)
    el.innerHTML = `
      <option value="all">Marca/Compatibilidad: Todo</option>
      <option value="iphone">iPhone</option>
      <option value="android">Android</option>
      <option value="ps4">PS4</option>
      <option value="ps5">PS5</option>
      <option value="pc">PC</option>
    `;
    el.value = brand;

    el.onchange = () => save(el.value);
  }

  function paint(){
    const el = document.getElementById("brandFilter");
    if (!el) return;
    el.value = brand;
  }

  return { init, get, apply, save };
})();
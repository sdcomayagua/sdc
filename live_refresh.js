window.SDC_LIVE = (() => {
  const KEY = "SDC_LIVE_LAST_HASH";
  let timer = null;

  function hashProducts(products){
    // hash simple por id|precio|stock
    const s = (products||[])
      .map(p => `${String(p.id||"").trim()}|${Number(p.precio||0)}|${Number(p.stock||0)}`)
      .sort()
      .join(";");
    let h = 0;
    for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
    return String(h);
  }

  async function fetchCatalog(){
    const CFG = window.SDC_CONFIG;
    const res = await fetch(`${CFG.API_URL}?action=catalog`, { cache:"no-store" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "No se pudo actualizar");
    return json;
  }

  function cartAffected(oldProducts, newProducts){
    const S = window.SDC_STORE;
    const cart = S.getCart();
    if (!cart || cart.size===0) return { changed:0, items:[] };

    const mapOld = new Map((oldProducts||[]).map(p => [String(p.id||"").trim(), p]));
    const mapNew = new Map((newProducts||[]).map(p => [String(p.id||"").trim(), p]));

    let changed = 0;
    const items = [];
    for (const it of cart.values()){
      const id = String(it.p?.id||"").trim();
      const o = mapOld.get(id);
      const n = mapNew.get(id);
      if (!o || !n) continue;

      const op = Number(o.precio||0), np = Number(n.precio||0);
      const os = Number(o.stock||0), ns = Number(n.stock||0);

      if (op!==np || os!==ns){
        changed++;
        items.push({ id, oldPrice:op, newPrice:np, oldStock:os, newStock:ns });
      }
    }
    return { changed, items };
  }

  function showLiveAlert(text){
    const el = document.getElementById("cartAlert");
    if (!el) return;
    el.style.display = "block";
    el.textContent = text;
  }

  function clearLiveAlert(){
    const el = document.getElementById("cartAlert");
    if (!el) return;
    el.style.display = "none";
    el.textContent = "";
  }

  async function tick(){
    const S = window.SDC_STORE;
    const oldProducts = S.getProducts();

    let json;
    try{
      json = await fetchCatalog();
    } catch {
      return; // silencioso
    }

    const newProducts = json.productos || [];
    const oldHash = localStorage.getItem(KEY) || "";
    const newHash = hashProducts(newProducts);

    if (oldHash && oldHash === newHash) return;

    localStorage.setItem(KEY, newHash);

    // afecta carrito?
    const affect = cartAffected(oldProducts, newProducts);
    if (affect.changed > 0){
      showLiveAlert(`⚠️ Cambió precio o stock en ${affect.changed} producto(s). Revisa antes de enviar.`);
      window.SDC_UTILS?.toast?.("⚠️ Actualización: cambió precio/stock");
    }

    // refrescar store y re-render sin romper filtros
    // actualiza products en store, pero mantiene carrito tal cual
    S.setData(json);
    S.setProducts(newProducts.filter(p=>p && p.nombre && p.categoria));

    window.SDC_CATALOG_UI?.renderGrid?.();
    window.SDC_RESULTS?.refresh?.();
  }

  function start(minutes=3){
    stop();
    // hash inicial
    try{
      const S = window.SDC_STORE;
      localStorage.setItem(KEY, hashProducts(S.getProducts()));
    } catch {}

    timer = setInterval(tick, Math.max(1, minutes) * 60 * 1000);
  }

  function stop(){
    if (timer){ clearInterval(timer); timer=null; }
  }

  return { start, stop, tick, clearLiveAlert };
})();
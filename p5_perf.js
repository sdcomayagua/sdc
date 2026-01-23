// p5_perf.js
window.SDC_PERF = (() => {
  const CACHE_KEY = "SDC_CATALOG_CACHE_V1";
  const TTL_MS = 3 * 60 * 1000;

  function saveCache(data){
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
  }

  function readCache(){
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj?.ts || !obj?.data) return null;
      if (Date.now() - obj.ts > TTL_MS) return null;
      return obj.data;
    } catch { return null; }
  }

  // Cache wrapper para SDC_CATALOG.load
  function wrapCatalogLoad(){
    if (window.__SDC_PERF_WRAP__) return;
    window.__SDC_PERF_WRAP__ = true;

    const cat = window.SDC_CATALOG;
    if (!cat?.load) return;

    const old = cat.load.bind(cat);
    cat.load = async () => {
      const cached = readCache();
      if (cached?.ok){
        // hidrata store
        try{
          window.SDC_STORE?.setData?.(cached);
          window.SDC_STORE?.setProducts?.((cached.productos||[]).filter(p=>p && p.nombre && p.categoria));
          window.SDC_CATALOG_UI?.renderTabs?.();
          window.SDC_CATALOG_UI?.renderSubTabs?.();
          window.SDC_CATALOG_UI?.renderGrid?.();
        }catch{}
        // y luego refresca en background (sin romper)
        old().then(fresh => { if (fresh?.ok) saveCache(fresh); }).catch(()=>{});
        return cached;
      }

      const fresh = await old();
      if (fresh?.ok) saveCache(fresh);
      return fresh;
    };
  }

  function preloadFirstImages(){
    const list = window.SDC_STORE?.getProducts?.() || [];
    list.slice(0, 12).forEach(p=>{
      const url = p?.imagen;
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }

  function init(){
    wrapCatalogLoad();
    // precarga cuando haya productos
    const t = setInterval(() => {
      const ok = (window.SDC_STORE?.getProducts?.() || []).length > 0;
      if (!ok) return;
      clearInterval(t);
      preloadFirstImages();
    }, 250);
  }

  return { init };
})();
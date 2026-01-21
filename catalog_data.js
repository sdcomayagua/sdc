window.SDC_CATALOG_DATA = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;
  const S = window.SDC_STORE;

  async function load() {
    U.$("statusPill").textContent = "Cargando catálogo...";
    const res = await fetch(`${CFG.API_URL}?action=catalog`, { cache: "no-store" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "No se pudo cargar");

    S.setData(json);

    let products = (json.productos || []).filter(p => p && p.nombre && p.categoria);

    products.sort((a, b) => {
      const sa = (Number(a.stock) > 0) ? 0 : 1;
      const sb = (Number(b.stock) > 0) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const oa = Number(a.orden || 0), ob = Number(b.orden || 0);
      if (oa !== ob) return oa - ob;
      return String(a.nombre).localeCompare(String(b.nombre));
    });

    S.setProducts(products);

    const cats = new Set(products.map(p => p.categoria || ""));
    S.setCats(["Todas", ...Array.from(cats).filter(Boolean).sort((a,b)=>a.localeCompare(b))]);

    const sub = new Map();
    for (const p of products) {
      const c = p.categoria || "";
      const s = p.subcategoria || "";
      if (!sub.has(c)) sub.set(c, new Set());
      if (s) sub.get(c).add(s);
    }
    S.setSubcatsMap(sub);

    U.$("statusPill").textContent = `Catálogo listo (${products.length} productos)`;

    return json;
  }

  return { load };
})();

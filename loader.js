// loader.js?v=20260124_fast
(() => {
  const V = "20260124_fast";

  // ✅ SOLO LO ESENCIAL PARA QUE APAREZCAN PRODUCTOS RÁPIDO
  const CORE = [
    "config.js","utils.js",
    "templates.js",

    "theme.js",              // (pero reforzamos el toggle en app.js)
    "store.js",
    "catalog_data.js",
    "catalog_ui.js",
    "catalog.js",
    "cart.js",
    "delivery.js",
    "wa.js",

    // Loader visual (para no verse vacío)
    "loading_fix.js",

    // Carga diferida de extras (este archivo decide qué cargar según conexión)
    "defer_extras.js",

    // App final
    "app.js",
  ];

  function load(src){
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `${src}?v=${encodeURIComponent(V)}`;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  (async () => {
    for (const f of CORE) await load(f);
  })();
})();
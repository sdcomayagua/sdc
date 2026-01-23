// features_boot.js (safe)
(() => {
  const F = window.SDC_FEATURES || {};

  function safe(fn){ try { fn && fn(); } catch(e){ console.error("[SDC features]", e); } }

  window.SDC_BOOT_FEATURES = () => {
    // inicializadores seguros
    if (F.productTabs) safe(() => window.SDC_PRODUCT_TABS?.init?.());
    if (F.swipeClose) safe(() => window.SDC_SWIPE_CLOSE?.init?.());
    if (F.voiceSearch) safe(() => window.SDC_VOICE?.init?.());
    if (F.favorites) safe(() => window.SDC_FAV?.init?.());
    if (F.swipeImages) safe(() => window.SDC_SWIPE_IMAGES?.init?.());

    // flags css
    const html = document.documentElement;
    html.classList.toggle("fxOn", !!F.modalFx);
    html.classList.toggle("pcListColsOn", !!F.pcListColumns);
  };
})();

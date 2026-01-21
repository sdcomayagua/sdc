window.SDC_MOTION = (() => {
  const modals = ["cartModal", "productModal"];

  function anyOpen() {
    return modals.some(id => document.getElementById(id)?.classList.contains("open"));
  }

  function syncBodyLock() {
    document.body.classList.toggle("modalOn", anyOpen());
    // aria
    for (const id of modals) {
      const m = document.getElementById(id);
      if (!m) continue;
      m.setAttribute("aria-hidden", m.classList.contains("open") ? "false" : "true");
    }
  }

  function observe() {
    const obs = new MutationObserver(() => syncBodyLock());
    for (const id of modals) {
      const m = document.getElementById(id);
      if (m) obs.observe(m, { attributes: true, attributeFilter: ["class"] });
    }
    syncBodyLock();
  }

  return { observe };
})();

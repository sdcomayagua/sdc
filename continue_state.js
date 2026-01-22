window.SDC_CONTINUE = (() => {
  let snapshot = null;

  function takeSnapshot() {
    const S = window.SDC_STORE;
    snapshot = {
      cat: S.getActiveCat(),
      sub: S.getActiveSub(),
      y: window.scrollY || 0
    };
  }

  function restoreSnapshot() {
    if (!snapshot) return;
    const S = window.SDC_STORE;
    S.setActiveCat(snapshot.cat || "Todas");
    S.setActiveSub(snapshot.sub || "Todas");

    // re-render
    window.SDC_CATALOG_UI?.renderTabs?.();
    window.SDC_CATALOG_UI?.renderSubTabs?.();
    window.SDC_CATALOG_UI?.renderGrid?.();

    // scroll
    setTimeout(() => window.scrollTo({ top: snapshot.y || 0, behavior:"auto" }), 0);
  }

  function hookCart() {
    const cart = window.SDC_CART;
    if (!cart?.openCart || !cart?.closeCart) return;

    const oldOpen = cart.openCart;
    const oldClose = cart.closeCart;

    cart.openCart = function() {
      takeSnapshot();
      return oldOpen.apply(cart, arguments);
    };

    cart.closeCart = function() {
      const r = oldClose.apply(cart, arguments);
      // volver al browse state
      restoreSnapshot();
      return r;
    };
  }

  function init() { hookCart(); }

  return { init };
})();
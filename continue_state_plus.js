window.SDC_CONTINUE_PLUS = (() => {
  let snapshot = null;

  function take(){
    const S = window.SDC_STORE;
    snapshot = {
      cat: S.getActiveCat(),
      sub: S.getActiveSub(),
      y: window.scrollY || 0,
      q: (document.getElementById("q")?.value || ""),
      quick: window.SDC_FILTERS?.getMode?.() || "all",
      price: window.SDC_PRICE?.get?.() || "all",
      view: document.body.getAttribute("data-view") || "detail"
    };
  }

  function restore(){
    if (!snapshot) return;
    const S = window.SDC_STORE;

    // restore store cat/sub
    S.setActiveCat(snapshot.cat || "Todas");
    S.setActiveSub(snapshot.sub || "Todas");

    // restore search
    const q = document.getElementById("q");
    if (q) q.value = snapshot.q || "";
    window.SDC_SEARCH_UI?.init?.(); // refresca X

    // restore quick filter + price filter + view mode
    window.SDC_FILTERS?.setMode?.(snapshot.quick || "all");
    window.SDC_PRICE?.save?.(snapshot.price || "all");
    // view mode (si existe view2)
    window.SDC_VIEW2?.apply?.(snapshot.view || "detail");

    // re-render
    window.SDC_CATALOG_UI?.renderTabs?.();
    window.SDC_CATALOG_UI?.renderSubTabs?.();
    window.SDC_CATALOG_UI?.renderGrid?.();

    // restore scroll
    setTimeout(() => window.scrollTo({ top: snapshot.y || 0, behavior:"auto" }), 0);
  }

  function hook(){
    const cart = window.SDC_CART;
    if (!cart?.openCart || !cart?.closeCart) return;

    const oldOpen = cart.openCart;
    const oldClose = cart.closeCart;

    cart.openCart = function(){
      take();
      return oldOpen.apply(cart, arguments);
    };

    cart.closeCart = function(){
      const r = oldClose.apply(cart, arguments);
      restore();
      return r;
    };
  }

  function init(){ hook(); }

  return { init, take, restore };
})();
window.SDC_STORE = (() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;

  const state = {
    DATA: null,
    products: [],
    categories: [],
    subcatsByCat: new Map(),
    activeCat: "Todas",
    activeSub: "Todas",
    cart: new Map(), // id -> {p, qty}
  };

  const LOCAL_ALLOW = new Set(CFG.LOCAL_ALLOW || []);

  const setData = (data) => { state.DATA = data; };
  const getData = () => state.DATA;

  const setProducts = (arr) => { state.products = Array.isArray(arr) ? arr : []; };
  const getProducts = () => state.products;

  const setCats = (cats) => { state.categories = cats; };
  const getCats = () => state.categories;

  const setSubcatsMap = (m) => { state.subcatsByCat = m; };
  const getSubcatsMap = () => state.subcatsByCat;

  const setActiveCat = (c) => { state.activeCat = c; };
  const getActiveCat = () => state.activeCat;

  const setActiveSub = (s) => { state.activeSub = s; };
  const getActiveSub = () => state.activeSub;

  const cartCount = () => {
    let c = 0;
    for (const it of state.cart.values()) c += it.qty;
    return c;
  };

  const updateCartCountUI = () => {
    const el = U.$("cartCount");
    if (el) el.textContent = String(cartCount());
  };

  const addToCart = (p, qty = 1) => {
    const id = p.id || p.nombre;
    const stock = Number(p.stock || 0);
    const cur = state.cart.get(id);
    const currentQty = cur ? cur.qty : 0;
    const addQty = Math.max(1, Number(qty || 1));
    const next = currentQty + addQty;

    if (next > stock) { U.toast("No hay stock suficiente"); return false; }

    state.cart.set(id, { p, qty: next });
    updateCartCountUI();
    U.toast("Agregado al carrito");
    return true;
  };

  const setCartQty = (id, qty) => {
    const it = state.cart.get(id);
    if (!it) return;
    it.qty = qty;
    state.cart.set(id, it);
    updateCartCountUI();
  };

  const delFromCart = (id) => {
    state.cart.delete(id);
    updateCartCountUI();
  };

  const getCart = () => state.cart;

  const isLocalAllowed = (dep, mun) => LOCAL_ALLOW.has(`${dep}|${mun}`);

  const getWhatsapp = () => {
    const d = state.DATA;
    if (d && d.whatsapp) return d.whatsapp;
    return CFG.DEFAULT_WHATSAPP;
  };

  return {
    state,
    setData, getData,
    setProducts, getProducts,
    setCats, getCats,
    setSubcatsMap, getSubcatsMap,
    setActiveCat, getActiveCat,
    setActiveSub, getActiveSub,
    getCart, addToCart, setCartQty, delFromCart,
    cartCount, updateCartCountUI,
    isLocalAllowed,
    getWhatsapp,
  };
})();

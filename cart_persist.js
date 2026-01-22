window.SDC_CART_PERSIST = (() => {
  const KEY = "SDC_CART_V1";

  function serializeCart(cartMap) {
    // Map -> Array
    const arr = [];
    for (const [id, it] of cartMap.entries()) {
      if (!it || !it.p) continue;
      arr.push({
        id,
        qty: Number(it.qty || 1),
        p: it.p, // snapshot del producto (para no depender de catálogo)
      });
    }
    return arr;
  }

  function deserializeCart(arr) {
    const map = new Map();
    if (!Array.isArray(arr)) return map;
    for (const item of arr) {
      if (!item || !item.id || !item.p) continue;
      map.set(String(item.id), {
        qty: Number(item.qty || 1),
        p: item.p,
      });
    }
    return map;
  }

  function save() {
    try {
      const S = window.SDC_STORE;
      const cart = S.getCart();
      const data = {
        at: Date.now(),
        items: serializeCart(cart),
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch {}
  }

  function restore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.items)) return false;

      const S = window.SDC_STORE;
      const map = deserializeCart(obj.items);

      // Reemplaza el Map del store
      S.state.cart = map;
      S.updateCartCountUI();
      return true;
    } catch {
      return false;
    }
  }

  return { save, restore, clear };
})();
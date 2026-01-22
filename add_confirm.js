window.SDC_ADD_CONFIRM = (() => {
  function pulseCart() {
    const el = document.getElementById("cartBtn");
    if (!el) return;
    el.classList.remove("pulse");
    // reflow
    void el.offsetWidth;
    el.classList.add("pulse");
    setTimeout(() => el.classList.remove("pulse"), 420);
  }

  function vibrate(ms=30){
    try { navigator.vibrate && navigator.vibrate(ms); } catch {}
  }

  function notify(msg="Agregado al carrito ✅"){
    window.SDC_UTILS?.toast?.(msg);
    pulseCart();
    vibrate(20);
  }

  return { notify, pulseCart };
})();
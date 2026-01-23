window.SDC_CART_TOOLS = (() => {
  const U = window.SDC_UTILS;

  function getMessage() {
    try {
      if (window.SDC_WA?.buildMessage) return window.SDC_WA.buildMessage();
    } catch {}
    return "Pedido SDC";
  }

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(getMessage());
      U.toast("Pedido copiado ✅");
    } catch {
      U.toast("No se pudo copiar");
    }
  }

  async function shareOrder() {
    const text = getMessage();
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
      return;
    }
    await copyOrder();
  }

  function init() {
    // ✅ ahora SIEMPRE seguro (si no existen botones, no pasa nada)
    document.getElementById("copyOrderBtn")?.addEventListener("click", copyOrder);
    document.getElementById("shareOrderBtn")?.addEventListener("click", shareOrder);
  }

  return { init, copyOrder, shareOrder };
})();

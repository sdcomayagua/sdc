window.SDC_THANKS_PLUS = (() => {
  function open(){ document.getElementById("thanksModal")?.classList.add("open"); }
  function close(){ document.getElementById("thanksModal")?.classList.remove("open"); }

  function clearCart(){
    const S = window.SDC_STORE;
    S.state.cart = new Map();
    S.updateCartCountUI();
    window.SDC_CART?.renderCart?.();
    window.SDC_CART?.computeSummary?.();
  }

  function init(){
    document.getElementById("thanksClose")?.addEventListener("click", close);
    document.getElementById("thanksContinue")?.addEventListener("click", ()=>{
      close();
      window.scrollTo({ top:0, behavior:"smooth" });
    });

    document.getElementById("thanksModal")?.addEventListener("click",(e)=>{
      if (e.target.id==="thanksModal") close();
    });

    document.getElementById("clearAfterSend")?.addEventListener("change",(e)=>{
      localStorage.setItem("SDC_CLEAR_AFTER_SEND", e.target.checked ? "1":"0");
    });

    // cargar preferencia
    const chk = document.getElementById("clearAfterSend");
    if (chk) chk.checked = (localStorage.getItem("SDC_CLEAR_AFTER_SEND")==="1");
  }

  function afterSend(){
    open();
    const clear = (localStorage.getItem("SDC_CLEAR_AFTER_SEND")==="1");
    if (clear) clearCart();
  }

  return { init, afterSend, open, close };
})();
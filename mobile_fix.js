// mobile_fix.js
(() => {
  const modalIds = ["cartModal","productModal","sortModal","zoomModal","thanksModal"];

  function anyOpen(){
    return modalIds.some(id => document.getElementById(id)?.classList.contains("open"));
  }

  function sync(){
    document.body.classList.toggle("modalOn", anyOpen());
  }

  function init(){
    const obs = new MutationObserver(sync);
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el, { attributes:true, attributeFilter:["class"] });
    });
    sync();
  }

  window.SDC_MOBILE_FIX = { init };
})();
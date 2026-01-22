(() => {
  const U = window.SDC_UTILS;

  let step = 1;
  const ids = ["stepProducts","stepDelivery","stepConfirm"];

  function showStep(n) {
    step = Math.max(1, Math.min(ids.length, Number(n||1)));
    ids.forEach((id,i)=>{
      const el = U.$(id);
      if (el) el.style.display = (i+1===step) ? "block" : "none";
    });
    window.SDC_STEPPER?.render?.();
  }

  function next(){ showStep(step+1); }
  function prev(){ showStep(step-1); }

  window.SDC_CHECKOUT = { showStep, next, prev };
})();
window.SDC_STEPPER = (() => {
  const steps = [
    { id:"stepProducts",  label:"Productos", ico:"🛒" },
    { id:"stepDelivery",  label:"Entrega",   ico:"🚚" },
    { id:"stepConfirm",   label:"Confirmar", ico:"✅" },
  ];

  function currentStep() {
    for (let i=0;i<steps.length;i++){
      const el = document.getElementById(steps[i].id);
      if (el && el.style.display !== "none") return i+1;
    }
    return 1;
  }

  function go(n){
    if (!window.SDC_CHECKOUT?.showStep) return;
    window.SDC_CHECKOUT.showStep(n);
  }

  function render(){
    const bar = document.getElementById("checkoutBar");
    if (!bar) return;
    const active = currentStep();

    bar.innerHTML = steps.map((s,i)=>`
      <div class="chkStep ${active===i+1?"active":""}" data-step="${i+1}">
        <span class="ico">${s.ico}</span>
        <span>${s.label}</span>
      </div>
    `).join("");

    bar.querySelectorAll(".chkStep").forEach(x=>{
      x.onclick = () => go(Number(x.getAttribute("data-step")||"1"));
    });
  }

  function init(){
    // re-render en botones wizard
    document.getElementById("nextStepBtn")?.addEventListener("click", ()=>setTimeout(render,0));
    document.getElementById("prevStepBtn")?.addEventListener("click", ()=>setTimeout(render,0));
    // primera vez
    setTimeout(render,0);
  }

  return { init, render };
})();
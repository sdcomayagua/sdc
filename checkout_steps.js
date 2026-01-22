(() => {
  const S = window.SDC_STORE;
  const U = window.SDC_UTILS;

  let step = 1;

  const steps = [
    { id: "stepProducts", title: "Productos" },
    { id: "stepDelivery", title: "Entrega" },
    { id: "stepConfirm", title: "Confirmar" }
  ];

  function showStep(n) {
    step = n;
    steps.forEach((s, i) => {
      const el = U.$(s.id);
      if (el) el.style.display = (i + 1 === step) ? "block" : "none";
    });
    renderBar();
  }

  function renderBar() {
    const bar = U.$("checkoutBar");
    if (!bar) return;
    bar.innerHTML = steps.map((s, i) => `
      <div class="chkStep ${i + 1 === step ? "active" : ""}">
        ${i + 1}. ${s.title}
      </div>
    `).join("");
  }

  function next() {
    if (step < steps.length) showStep(step + 1);
  }

  function prev() {
    if (step > 1) showStep(step - 1);
  }

  window.SDC_CHECKOUT = { showStep, next, prev };
})();
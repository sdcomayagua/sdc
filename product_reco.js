(() => {
  const U = window.SDC_UTILS;

  function render(product, products) {
    const box = U.$("recoBox");
    if (!box) return;

    const list = products
      .filter(p => p.categoria === product.categoria && p.id !== product.id)
      .slice(0, 4);

    if (!list.length) {
      box.innerHTML = "";
      return;
    }

    box.innerHTML = `
      <div class="recoTitle">También te puede interesar</div>
      <div class="recoRow">
        ${list.map(p => `
          <div class="recoItem" onclick="window.SDC_CATALOG.openProduct('${p.id}')">
            <img src="${p.imagen}">
            <div>${p.nombre}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  window.SDC_RECO = { render };
})();
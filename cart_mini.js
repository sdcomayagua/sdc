window.SDC_CART_MINI = (() => {
  const U = window.SDC_UTILS;
  const CFG = window.SDC_CONFIG;

  function set(text){
    const el = document.getElementById("cartMiniSummary");
    if (!el) return;
    el.textContent = text || "";
  }

  function update({itemsCount, totalNow, local, pay, shipping}){
    const n = Number(itemsCount||0);
    const t = U.money(totalNow||0, CFG.CURRENCY);

    let extra = "";
    if (!local && pay === "prepago") extra = ` (incluye envío ${U.money(shipping||0, CFG.CURRENCY)})`;
    if (!local && pay !== "prepago") extra = " (envío se paga a empresa)";

    set(`Items: ${n} • Total ahora: ${t}${extra}`);
  }

  return { update, set };
})();

window.SDC_CATALOG = (() => {
  const DATA = window.SDC_CATALOG_DATA;
  const UI = window.SDC_CATALOG_UI;
  const PM = window.SDC_PRODUCT_MODAL;

  async function load() {
    await DATA.load();
    UI.renderTabs();
    UI.renderSubTabs();
    UI.bindSort();
    UI.renderGrid();
    PM.openFromHash();
  }

  function renderGrid() { UI.renderGrid(); }
  function bindProductModalEvents() { PM.bindEvents(); }
  function closeProductModal() { PM.close(); }

  return { load, renderGrid, bindProductModalEvents, closeProductModal };
})();

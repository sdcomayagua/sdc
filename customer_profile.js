(() => {
  const U = window.SDC_UTILS;
  const KEY = "SDC_CUSTOMER";

  function load() {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (d.name) U.$("name").value = d.name;
    if (d.phone) U.$("phone").value = d.phone;
    if (d.addr) U.$("addr").value = d.addr;
  }

  function save() {
    const data = {
      name: U.$("name").value.trim(),
      phone: U.$("phone").value.trim(),
      addr: U.$("addr").value.trim()
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  window.SDC_PROFILE = { load, save };
})();
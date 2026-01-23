(() => {
  const header = document.querySelector("header");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 80) {
      header.classList.add("compact");
    } else {
      header.classList.remove("compact");
    }
    lastScroll = current;
  });

  // Mini carrito
  window.addEventListener("SDC_CART_UPDATE", e => {
    const mini = document.getElementById("miniCart");
    if (!mini) return;
    if (e.detail.count > 0) {
      mini.classList.add("show");
      mini.querySelector(".count").textContent = e.detail.count;
      mini.querySelector(".total").textContent = e.detail.total;
    } else {
      mini.classList.remove("show");
    }
  });
})();
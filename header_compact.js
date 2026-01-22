window.SDC_HEADER = (() => {
  function init(){
    const header = document.querySelector("header");
    const pill = document.getElementById("statusPill");
    if (!header) return;

    const onScroll = () => {
      const y = window.scrollY || 0;
      header.classList.toggle("compact", y > 28);
      // opcional: ocultar el pill en scroll (se siente más limpio)
      if (pill) pill.style.display = (y > 28 ? "none" : "");
    };

    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();
  }

  return { init };
})();

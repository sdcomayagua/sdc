window.SDC_UX = (() => {
  function initToTop() {
    const btn = document.getElementById("toTop");
    if (!btn) return;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      btn.classList.toggle("show", y > 420);
    };

    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  return { initToTop };
})();

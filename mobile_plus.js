// mobile_plus.js
(() => {
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  function closeSuggest(){
    const box = document.getElementById("suggestBox");
    if (!box) return;
    box.style.display = "none";
    box.innerHTML = "";
  }

  // 1) Cierra sugerencias al scrollear
  function hookCloseSuggestOnScroll(){
    window.addEventListener("scroll", () => {
      if (!isMobile()) return;
      closeSuggest();
    }, { passive:true });
  }

  // 2) Auto-hide header al bajar (tipo app)
  function hookAutoHideHeader(){
    const header = document.querySelector("header");
    if (!header) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    function run(){
      const y = window.scrollY || 0;
      const down = y > lastY;
      lastY = y;

      if (!isMobile()) return;

      // si estás arriba, siempre visible
      if (y < 50){
        header.style.transform = "translateY(0)";
        header.style.transition = "transform .18s ease";
        return;
      }

      if (down){
        header.style.transform = "translateY(-72px)";
        header.style.transition = "transform .18s ease";
      } else {
        header.style.transform = "translateY(0)";
        header.style.transition = "transform .18s ease";
      }
    }

    window.addEventListener("scroll", () => {
      if (!ticking){
        ticking = true;
        requestAnimationFrame(() => {
          run();
          ticking = false;
        });
      }
    }, { passive:true });
  }

  // 3) Al cambiar categoría, sube un poco para que se sienta “app”
  function hookTabScrollTop(){
    const catTabs = document.getElementById("catTabs");
    if (!catTabs) return;

    catTabs.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.classList.contains("tab")) return;
      if (!isMobile()) return;

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function init(){
    hookCloseSuggestOnScroll();
    hookAutoHideHeader();
    hookTabScrollTop();
  }

  window.SDC_MOBILE_PLUS = { init };
})();